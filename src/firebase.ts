// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCudbr99l5bEyI5ZsLjn1oM6NsCpsq9Xbg",
  authDomain: "studio-8464978590-4639e.firebaseapp.com",
  projectId: "studio-8464978590-4639e",
  storageBucket: "studio-8464978590-4639e.firebasestorage.app",
  messagingSenderId: "274929297895",
  appId: "1:274929297895:web:1757e70b5c7a0708b17542"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
