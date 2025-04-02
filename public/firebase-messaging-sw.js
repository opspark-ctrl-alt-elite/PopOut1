firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCW2qiw0ft5UhtdTTw6HZfOqELyE3y2qk8",
  authDomain: "popout-5d2e4.firebaseapp.com",
  projectId: "popout-5d2e4",
  storageBucket: "popout-5d2e4.firebasestorage.app",
  messagingSenderId: "125512622559",
  appId: "1:125512622559:web:f7868a7f9c75593206e46a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "fixLater",
  });
});