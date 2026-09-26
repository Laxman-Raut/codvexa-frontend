// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "codvexa-bef11.firebaseapp.com",
  projectId: "codvexa-bef11",
  storageBucket: "codvexa-bef11.firebasestorage.app",
  messagingSenderId: "739583040434",
  appId: "1:739583040434:web:122a645a19b7733573e2ab",
  measurementId: "G-JBQZL1BTCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try { const analytics = getAnalytics(app); } catch(e) {}
export const auth= getAuth(app)
export const googleProvider =new GoogleAuthProvider()