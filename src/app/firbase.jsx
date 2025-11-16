// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKiAjYEkQdgkdK31-5oeQ97TTQo5Bo-Iw",
  authDomain: "smartcoffe-b2c5e.firebaseapp.com",
  projectId: "smartcoffe-b2c5e",
  storageBucket: "smartcoffe-b2c5e.firebasestorage.app",
  messagingSenderId: "1014648266797",
  appId: "1:1014648266797:web:374e025080819bf9c958a4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)