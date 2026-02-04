import { db } from "@/public/firebaseWebConfig";
import { collection, doc, getDoc, updateDoc, setDoc, query, where, getDocs } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Try to get user profile from users collection
    const userRef = doc(db, "users", email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return new Response(JSON.stringify(userSnap.data()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Return empty profile
      return new Response(JSON.stringify({ email, name: "", phone: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch profile", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, phone } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update only the name and phone fields, preserving role and other fields
    const userRef = doc(db, "users", email);
    
    // Check if user document exists
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create the user document if it doesn't exist (for legacy users)
      console.log("Creating new user document for:", email);
      await setDoc(userRef, {
        email: email,
        name: name || "",
        phone: phone || "",
        role: "user", // Default role for legacy users
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update only the specified fields
      await updateDoc(userRef, {
        name: name || "",
        phone: phone || "",
        updatedAt: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to save profile", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
