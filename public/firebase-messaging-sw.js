// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: "AIzaSyDNWx6D1QyaezRE9TM8C-b6_gbxJXepLWU",
    authDomain: "innopetcare-2a866.firebaseapp.com",
    databaseURL: "https://innopetcare-2a866-default-rtdb.firebaseio.com",
    projectId: "innopetcare-2a866",
    storageBucket: "innopetcare-2a866.appspot.com",
    messagingSenderId: "485214746152",
    appId: "1:485214746152:web:872da38df2d3c8df82e71d",
    measurementId: "G-SCXNZK8VMZ",
  });

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// Initialize Firebase in the service worker

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon, // Ensure this icon exists in your public directory
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
