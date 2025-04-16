import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCW2qiw0ft5UhtdTTw6HZfOqELyE3y2qk8",
  authDomain: "popout-5d2e4.firebaseapp.com",
  projectId: "popout-5d2e4",
  storageBucket: "popout-5d2e4.firebasestorage.app",
  messagingSenderId: "125512622559",
  appId: "1:125512622559:web:f7868a7f9c75593206e46a",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export { firebaseApp, messaging };
