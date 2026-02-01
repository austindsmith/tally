export async function getAuthToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (result) => {
      if (chrome.runtime.lastError || !result?.token) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(result.token);
    });
  });
}
export async function removeAuthToken(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.removeCachedAuthToken({ token }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
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
