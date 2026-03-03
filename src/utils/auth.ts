const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const TOKEN_KEY = "ffAuthToken";

// Firefox uses launchWebAuthFlow since it doesn't have getAuthToken
async function getAuthTokenFirefox(): Promise<string> {
  const cached = await browser.storage.session.get(TOKEN_KEY);
  if (cached[TOKEN_KEY]) return cached[TOKEN_KEY] as string;

  const CLIENT_ID =
    "94483234549-evjrp11bcmvkoqvbjfoh1otm5tta6e2q.apps.googleusercontent.com";
  const redirectURL = browser.identity.getRedirectURL();
  const authURL = new URL("https://accounts.google.com/o/oauth2/auth");
  authURL.searchParams.set("client_id", CLIENT_ID);
  authURL.searchParams.set("response_type", "token");
  authURL.searchParams.set("redirect_uri", redirectURL);
  authURL.searchParams.set("scope", SCOPES.join(" "));

  const resultURL = await browser.identity.launchWebAuthFlow({
    url: authURL.toString(),
    interactive: true,
  });

  if (!resultURL) throw new Error("OAuth flow was cancelled or failed");

  const hash = new URL(resultURL).hash.slice(1);
  const token = new URLSearchParams(hash).get("access_token");
  if (!token) throw new Error("No access token in OAuth response");

  await browser.storage.session.set({ [TOKEN_KEY]: token });
  return token;
}

export async function getAuthToken(): Promise<string> {
  if (import.meta.env.BROWSER === "firefox") {
    return getAuthTokenFirefox();
  }

  // Chrome: use getAuthToken which integrates with the manifest oauth2 block
  const result = await chrome.identity.getAuthToken({ interactive: true });
  if (!result.token) throw new Error("Failed to get auth token");
  return result.token;
}

export async function removeAuthToken(token: string): Promise<void> {
  if (import.meta.env.BROWSER === "firefox") {
    await browser.storage.session.remove(TOKEN_KEY);
    return;
  }

  await chrome.identity.removeCachedAuthToken({ token });
}

export async function revokeAuthToken(token: string): Promise<void> {
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  await removeAuthToken(token);
}
