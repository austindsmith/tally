import { AUTH_TOKEN_MESSAGE, acquireAuthToken } from "@/utils/auth";

export default defineBackground(() => {
  // Chrome destroys the popup as soon as the OAuth window takes focus, which
  // would abandon launchWebAuthFlow mid-flight. The background outlives that,
  // so the whole consent-and-exchange runs here and only the token goes back.
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== AUTH_TOKEN_MESSAGE) return false;

    acquireAuthToken().then(
      (token) => sendResponse({ token }),
      (error: unknown) =>
        sendResponse({
          error: error instanceof Error ? error.message : "Sign-in failed.",
        }),
    );

    // Keeps the message channel open for the async sendResponse above.
    return true;
  });
});
