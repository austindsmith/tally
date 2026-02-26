export async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    browser.identity.getAuthToken({ interactive: true }, (result) => {
      if (browser.runtime.lastError || !result?.token) {
        reject(browser.runtime.lastError);
        return;
      }
      resolve(result.token);
    });
  });
}
export async function removeAuthToken(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    browser.identity.removeCachedAuthToken({ token }, () => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

export async function revokeAuthToken(token: string): Promise<void> {
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  await removeAuthToken(token);
}
