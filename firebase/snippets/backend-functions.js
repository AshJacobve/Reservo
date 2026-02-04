// This is a library of all the useful and relevant functions regarding the back-end user management

import { auth } from "../config.js";

//Update user profile
export async function updateUser(uid, updates) {
  try {
    const userRecord = await auth.updateUser(uid, updates);
    console.log("Successfully updated user:", userRecord.toJSON());
    return userRecord;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

//Delete a user
export async function removeUser(uid) {
  try {
    await auth.deleteUser(uid);
    console.log("User deleted successfully:", uid);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Create a new user
export async function createUser(userData) {
  const { email, password, firstName, lastName } = userData;

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    console.log("Successfully created new user:", userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

//Veryfing tokens
export async function verifyIdToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log("Decoded token:", decodedToken);
    return decodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw error;
  }
}

//Creating custom tokens
export async function generateCustomToken(uid) {
  try {
    const token = await auth.createCustomToken(uid);
    console.log("Custom token created:", token);
    return token;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}

export async function setUserRole(uid, role) {
  try {
    console.log(`Role = ${role}.`)
    await auth.setCustomUserClaims(uid, { role });
    console.log(`Set role '${role}' for user ${uid}`);
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
}

// Check if user exists by email
export async function getUserByEmail(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}