import { createUser, setUserRole, getUserByEmail } from '@/firebase/snippets/backend-functions.js';
import { db } from "@/public/firebaseWebConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists in Firebase Auth
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'The email address is already in use by another account.' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await createUser({
      email,
      password,
      firstName,
      lastName,
      role
    });

    console.log("Role to set:", role, "Type:", typeof role);
    
    // Set custom claim with the role
    await setUserRole(userRecord.uid, role);

    // Store user data in Firestore users collection
    const userDocRef = doc(db, "users", email);
    await setDoc(userDocRef, {
      email: email,
      name: `${firstName} ${lastName}`,
      phone: "",
      role: role, // Store role in Firestore
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log("User document created in Firestore:", email);

    return new Response(
      JSON.stringify({ uid: userRecord.uid }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}