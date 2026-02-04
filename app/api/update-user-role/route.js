import { db } from "@/public/firebaseWebConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing email or role' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (role !== 'admin' && role !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Role must be either "admin" or "user"' }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update user document in Firestore
    const userDocRef = doc(db, "users", email);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await updateDoc(userDocRef, {
      role: role,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Updated role for ${email} to ${role}`);

    return new Response(
      JSON.stringify({ success: true, email, role }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
