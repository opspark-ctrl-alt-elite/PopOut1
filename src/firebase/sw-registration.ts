export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('sw registered', registration);
    } catch (error) {
      console.error('sw registration fail', error);
    }
  }
};