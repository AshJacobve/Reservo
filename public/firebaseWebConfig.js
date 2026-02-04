//This is the creating of the firebase web auth system desinged to sign in user/send emails/sign out, etc
//This is meant to be public

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

// These are the public keys to our firebase project
const firebaseConfig = {
  apiKey: "AIzaSyC7lVx2xN1VHvYsOyp5D5aLfqHO3xcAF68",
  authDomain: "soen-287-project-794db.firebaseapp.com",
  projectId: "soen-287-project-794db",
  storageBucket: "soen-287-project-794db.firebasestorage.app",
  messagingSenderId: "219613651385",
  appId: "1:219613651385:web:73cb0421bfff7f95335668",
  measurementId: "G-ERS0795T8T"
};

//Creating the firebase project and the firestore database

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set persistence to SESSION - this will clear login when browser is closed
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});