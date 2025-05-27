import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBQ6ynseO94aXpkhO9VlBrnDCBGvY-y2Nc",
    authDomain: "ptype2-c3cd4.firebaseapp.com",
    projectId: "ptype2-c3cd4",
    storageBucket: "ptype2-c3cd4.firebasestorage.app",
    messagingSenderId: "291277401452",
    appId: "1:291277401452:web:2952a70a23e378a9f45749",
    measurementId: "G-05KDBDLEJH"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Optional for future use