// This is a library of all the useful front-end functions regarding the authentication process. 
// They will need to be called in the front-end code in the relevant places.

import { auth } from "../firebaseWebConfig.js";
import {  
  signInWithEmailAndPassword,  
  sendEmailVerification, 
  signOut,
  onAuthStateChanged,  
  updateEmail, 
  updatePassword, 
  sendPasswordResetEmail,  
} from "firebase/auth";

//Checks whether the user is signed in
export function monitorAuthState(callback) {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback(user) // user can be null or a Firebase User object
  })
  return unsubscribe
}

//Updates user email
export async function updateUserEmail(user, newEmail) {
  try {
    await updateEmail(user, newEmail);
    console.log("Email updated!");
  } catch (error) {
    console.error("Error updating email:", error.code, error.message);
    throw error;
  }
}

//Send email verification email
export async function sendVerificationEmail(user) {
  try {
    await sendEmailVerification(user);
    console.log("Verification email sent!");
  } catch (error) {
    console.error("Error sending verification email:", error.code, error.message);
    throw error;
  }
}

//Updates user password
export async function changeUserPassword(user, newPassword) {
  try {
    await updatePassword(user, newPassword);
    console.log("Password updated!");
  } catch (error) {
    console.error("Error updating password:", error.code, error.message);
    throw error;
  }
}

//Sends a password reset email
export async function sendPasswordReset(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent!");
  } catch (error) {
    console.error("Error sending password reset:", error.code, error.message);
    throw error;
  }
}

// Sign in existing user
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error.code, error.message);
    throw error;
  }
}

// Sign out user
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error.code, error.message);
  }
}

export async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null; // or throw

  const idTokenResult = await user.getIdTokenResult(true); // force refresh to get latest claims
  return idTokenResult.claims.role || 'student'; // fallback if no role claim
}