declare global {
  interface Window {
    FB: any;
  }
}

export const facebookLogin = () => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject('Facebook SDK not loaded.');
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response.status === 'connected') {
          resolve(response.authResponse);
        } else {
          reject('User did not authorize or canceled login.');
        }
      },
      { scope: 'public_profile,email' }
    );
  });
};