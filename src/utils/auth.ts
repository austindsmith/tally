const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
]

const CHROME_PROD_CLIENT_ID =
  "94483234549-d804rllboarcjetek54ttfm3tolhoniq.apps.googleusercontent.com"

const WEB_CLIENT_ID =
  "94483234549-evjrp11bcmvkoqvbjfoh1otm5tta6e2q.apps.googleusercontent.com"

const STORAGE_KEY = "gAuthToken"
const EXPIRY_KEY = "gAuthTokenExpiry"

async function getCachedToken(): Promise<string | null> {
  const stored = await browser.storage.session.get([STORAGE_KEY, EXPIRY_KEY])
  const token = stored[STORAGE_KEY] as string | undefined
  const expiry = stored[EXPIRY_KEY] as number | undefined
  if (token && expiry && Date.now() < expiry) return token
  return null
}

async function launchWebAuthFlow(): Promise<string> {
  const redirectURL = browser.identity.getRedirectURL()

  const authURL = new URL("https://accounts.google.com/o/oauth2/auth")
  authURL.searchParams.set("client_id", WEB_CLIENT_ID)
  authURL.searchParams.set("response_type", "token")
  authURL.searchParams.set("redirect_uri", redirectURL)
  authURL.searchParams.set("scope", SCOPES.join(" "))
  authURL.searchParams.set("prompt", "consent")

  const resultURL = await browser.identity.launchWebAuthFlow({
    url: authURL.toString(),
    interactive: true,
  })

  if (!resultURL) throw new Error("Auth flow cancelled or failed")

  const hash = new URL(resultURL).hash.slice(1)
  const params = new URLSearchParams(hash)
  const token = params.get("access_token")
  const expiresIn = parseInt(params.get("expires_in") ?? "3600", 10)

  if (!token) throw new Error("No access_token in OAuth response")

  await browser.storage.session.set({
    [STORAGE_KEY]: token,
    [EXPIRY_KEY]: Date.now() + (expiresIn - 60) * 1000,
  })

  return token
}

function useWebAuthFlow(): boolean {
  return (
    import.meta.env.BROWSER === "firefox" ||
    import.meta.env.MODE === "development"
  )
}

export async function getAuthToken(): Promise<string> {
  if (useWebAuthFlow()) {
    const cached = await getCachedToken()
    if (cached) return cached
    return launchWebAuthFlow()
  }

  const result = await chrome.identity.getAuthToken({ interactive: true })
  if (!result.token) throw new Error("Failed to get Chrome auth token")
  return result.token
}

export async function removeAuthToken(token: string): Promise<void> {
  if (useWebAuthFlow()) {
    await browser.storage.session.remove([STORAGE_KEY, EXPIRY_KEY])
    return
  }
  await chrome.identity.removeCachedAuthToken({ token })
}

export async function revokeAuthToken(token: string): Promise<void> {
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
  await removeAuthToken(token)
}