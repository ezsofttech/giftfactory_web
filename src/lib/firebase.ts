import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDh8vI43n5Qdxe-hIajbZTtH1pJYrcXE1Q",
  authDomain: "giftfactory-f037d.firebaseapp.com",
  projectId: "giftfactory-f037d",
  storageBucket: "giftfactory-f037d.firebasestorage.app",
  messagingSenderId: "543934317405",
  appId: "1:543934317405:web:14580e26482eeb23925eb4",
  measurementId: "G-SG291HD735",
};

// Initialize Firebase for SSR / Client-side usage safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup };
