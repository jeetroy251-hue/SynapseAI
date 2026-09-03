// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-36b33.firebaseapp.com",
  projectId: "cortexai-36b33",
  storageBucket: "cortexai-36b33.firebasestorage.app",
  messagingSenderId: "909734820164",
  appId: "1:909734820164:web:b2b31edcbd090dee4b3f11",
  measurementId: "G-68K4N2J0BT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()