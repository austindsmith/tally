/**
 * Google OAuth for Tally.
 *
 * One code path for Chrome and Firefox: authorization code + PKCE via
 * identity.launchWebAuthFlow. chrome.identity.getAuthToken is deliberately not
 * used -- it does not exist in Firefox, and it relies on restricted internals
 * that are absent from non-Google Chromium builds, so it fails in development
 * on Linux distro browsers.
 *
 * The code -> token exchange runs through the Cloudflare Worker in worker/,
 * because Google demands a client_secret at its token endpoint even for PKCE
 * clients and that secret must not ship inside a public extension bundle.
 */

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
]

const CLIENT_ID = import.meta.env.WXT_GOOGLE_CLIENT_ID
const TOKEN_PROXY = import.meta.env.WXT_TOKEN_PROXY_URL

const ACCESS_TOKEN_KEY = "gAuthToken"
const EXPIRY_KEY = "gAuthTokenExpiry"
const REFRESH_TOKEN_KEY = "gAuthRefreshToken"

/** Refresh this many ms before actual expiry so in-flight calls do not race it. */
const EXPIRY_SKEW_MS = 60_000

/** Message asking the background to acquire a token on the caller's behalf. */
export const AUTH_TOKEN_MESSAGE = "AUTH_GET_TOKEN"

type TokenPayload = {
  access_token: string
  refresh_token?: string
  expires_in: number
}

/* -------------------------------------------------------------------------- */
/* PKCE                                                                       */
/* -------------------------------------------------------------------------- */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function createVerifier(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)))
}

async function createChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  )
  return base64UrlEncode(new Uint8Array(digest))
}

/* -------------------------------------------------------------------------- */
/* Redirect URI                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Chrome yields https://<extension-id>.chromiumapp.org/, which can be
 * registered with Google directly.
 *
 * Firefox yields https://<subdomain>.extensions.allizom.org/, which Google
 * rejects because domain ownership cannot be proven for a Mozilla domain.
 * Firefox 86+ accepts a loopback form instead, and Google allows loopback
 * redirects without verification (RFC 8252 s7.3).
 */
export function getRedirectUri(): string {
  const generated = browser.identity.getRedirectURL()

  if (import.meta.env.BROWSER === "firefox") {
    const subdomain = new URL(generated).hostname.split(".")[0]
    return `http://127.0.0.1/mozoauth2/${subdomain}`
  }

  return generated
}

/* -------------------------------------------------------------------------- */
/* Token storage                                                              */
/* -------------------------------------------------------------------------- */

async function storeTokens(payload: TokenPayload): Promise<void> {
  await browser.storage.session.set({
    [ACCESS_TOKEN_KEY]: payload.access_token,
    [EXPIRY_KEY]: Date.now() + payload.expires_in * 1000 - EXPIRY_SKEW_MS,
  })

  // Google returns a refresh token only on the first consent, so an absent one
  // here must not clobber the stored value.
  if (payload.refresh_token) {
    await browser.storage.local.set({
      [REFRESH_TOKEN_KEY]: payload.refresh_token,
    })
  }
}

async function getCachedToken(): Promise<string | null> {
  const stored = await browser.storage.session.get([ACCESS_TOKEN_KEY, EXPIRY_KEY])
  const token = stored[ACCESS_TOKEN_KEY] as string | undefined
  const expiry = stored[EXPIRY_KEY] as number | undefined

  if (token && expiry && Date.now() < expiry) return token
  return null
}

async function getRefreshToken(): Promise<string | null> {
  const stored = await browser.storage.local.get(REFRESH_TOKEN_KEY)
  return (stored[REFRESH_TOKEN_KEY] as string | undefined) ?? null
}

/* -------------------------------------------------------------------------- */
/* Token proxy                                                                */
/* -------------------------------------------------------------------------- */

async function callProxy(
  path: "/token" | "/refresh",
  body: Record<string, string>,
): Promise<TokenPayload> {
  const response = await fetch(`${TOKEN_PROXY}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail ?? data.error ?? "Token exchange failed")
  }

  return data as TokenPayload
}

/* -------------------------------------------------------------------------- */
/* Flows                                                                      */
/* -------------------------------------------------------------------------- */

async function runConsentFlow(): Promise<string> {
  const verifier = createVerifier()
  const challenge = await createChallenge(verifier)
  const redirectUri = getRedirectUri()

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.set("client_id", CLIENT_ID)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("scope", SCOPES.join(" "))
  authUrl.searchParams.set("code_challenge", challenge)
  authUrl.searchParams.set("code_challenge_method", "S256")
  // access_type=offline plus prompt=consent is what makes Google issue a
  // refresh token, so the user is not sent back through consent every hour.
  authUrl.searchParams.set("access_type", "offline")
  authUrl.searchParams.set("prompt", "consent")

  const resultUrl = await browser.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true,
  })

  if (!resultUrl) throw new Error("Sign-in was cancelled")

  const params = new URL(resultUrl).searchParams
  const error = params.get("error")
  if (error) throw new Error(`Google rejected the sign-in: ${error}`)

  const code = params.get("code")
  if (!code) throw new Error("No authorization code in the OAuth response")

  const payload = await callProxy("/token", {
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri,
  })

  await storeTokens(payload)
  return payload.access_token
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const payload = await callProxy("/refresh", { refresh_token: refreshToken })
    await storeTokens(payload)
    return payload.access_token
  } catch {
    // A revoked or expired refresh token is recoverable by asking for consent
    // again, so drop it and let the caller fall through to the full flow.
    await browser.storage.local.remove(REFRESH_TOKEN_KEY)
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/** In-flight token acquisition shared by concurrent `getAuthToken` callers. */
let pendingAuth: Promise<string> | null = null

/**
 * Acquires a token in whichever context calls it. Only the background should
 * do so directly -- see `getAuthToken`.
 *
 * Order: cached token -> silent refresh -> interactive consent.
 */
export async function acquireAuthToken(): Promise<string> {
  const cached = await getCachedToken()
  if (cached) return cached

  // The identity API permits only one web auth flow at a time, so concurrent
  // callers must share a single acquisition rather than each starting a flow.
  if (!pendingAuth) {
    pendingAuth = acquireToken().finally(() => {
      pendingAuth = null
    })
  }

  return pendingAuth
}

async function acquireToken(): Promise<string> {
  const refreshToken = await getRefreshToken()
  if (refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken)
    if (refreshed) return refreshed
  }

  return runConsentFlow()
}

/**
 * Returns a usable access token, prompting the user only when necessary.
 *
 * Chrome tears the popup down the moment the OAuth window takes focus, which
 * would abandon launchWebAuthFlow before the code could be exchanged, so the
 * flow is delegated to the background and only its result crosses back.
 */
export async function getAuthToken(): Promise<string> {
  const response = (await browser.runtime.sendMessage({
    type: AUTH_TOKEN_MESSAGE,
  })) as { token?: string; error?: string } | undefined

  if (!response) throw new Error("The background script did not respond.")
  if (response.error) throw new Error(response.error)
  if (!response.token) throw new Error("No access token was returned.")

  return response.token
}

/** True when a refresh token is on hand, i.e. the user has signed in before. */
export async function isSignedIn(): Promise<boolean> {
  return (await getRefreshToken()) !== null
}

/** Clears local credentials without telling Google to forget the grant. */
export async function signOut(): Promise<void> {
  await browser.storage.session.remove([ACCESS_TOKEN_KEY, EXPIRY_KEY])
  await browser.storage.local.remove(REFRESH_TOKEN_KEY)
}

/** Revokes the grant at Google, then clears local credentials. */
export async function revokeAccess(): Promise<void> {
  const token = (await getCachedToken()) ?? (await getRefreshToken())

  if (token) {
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token }),
      })
    } catch {
      // Revocation is best-effort; local credentials are cleared regardless.
    }
  }

  await signOut()
}
