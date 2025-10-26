// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firebase services
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getFunctions } from "firebase/functions";
import { getRemoteConfig } from "firebase/remote-config";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6hSp8jx-4w-V0I94_rYMQdWEgJ9OghzQ",
  authDomain: "teppichart-3dbd6.firebaseapp.com",
  projectId: "teppichart-3dbd6",
  storageBucket: "teppichart-3dbd6.appspot.com",
  messagingSenderId: "166946638359",
  appId: "1:166946638359:web:267cbe05c8f5bee3f3ea52",
  measurementId: "G-EQ6PJ8YGRT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize all services
const analytics = getAnalytics(app);          // Firebase Analytics
const auth = getAuth(app);                    // Firebase Authentication
const db = getFirestore(app);                 // Firestore Database
const storage = getStorage(app);              // Cloud Storage
const messaging = getMessaging(app);          // Firebase Cloud Messaging
const functions = getFunctions(app);          // Cloud Functions
const remoteConfig = getRemoteConfig(app);    // Remote Config

// Export services for easy usage in other modules
export { app, analytics, auth, db, storage, messaging, functions, remoteConfig };
