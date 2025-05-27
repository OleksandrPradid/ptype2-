import { auth } from "./config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

// Sign up with email/password
export async function signUp(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // Update user profile with username
    await updateProfile(userCredential.user, {
      displayName: username
    });
    
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Login with email/password
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Logout
// In /src/firebase/auth.js
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { app } from './config.js';

const auth = getAuth(app);

export async function logout() {
    await signOut(auth);
    console.log("User signed out");
}

// Listen for auth state changes
export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}