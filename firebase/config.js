// firebase/config.js
import dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

// Support both local file and environment variable
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Use JSON string from environment variable
  console.log("Using FIREBASE_SERVICE_ACCOUNT from environment");
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Local development: Use file path
  console.log("Using service account file from GOOGLE_APPLICATION_CREDENTIALS");
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found: ${serviceAccountPath}`);
  }
  
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} else {
  throw new Error(
    "Firebase credentials not found. Set either:\n" +
    "- GOOGLE_APPLICATION_CREDENTIALS (local file path) or\n" +
    "- FIREBASE_SERVICE_ACCOUNT (JSON string for production)"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage ? admin.storage() : null;

console.log("Firebase Admin initialized successfully.");