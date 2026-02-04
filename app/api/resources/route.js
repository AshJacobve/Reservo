import { db } from "@/public/firebaseWebConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";

// GET - Fetch all resources
export async function GET(req) {
  try {
    const resourcesRef = collection(db, "resources");
    const snapshot = await getDocs(resourcesRef);

    const resources = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    console.log(`Found ${resources.length} resources`);

    return new Response(JSON.stringify({ resources }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET RESOURCES ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch resources", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create new resource
export async function POST(req) {
  try {
    const body = await req.json();
    
    console.log("Received create resource request:", body);

    // Validate required fields
    if (!body.name) {
      return new Response(JSON.stringify({ error: "Resource name is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create the resource document
    const docRef = await addDoc(collection(db, "resources"), {
      name: body.name,
      description: body.description || "",
      location: body.location || "",
      capacity: body.capacity || 1,
      imageUrl: body.imageUrl || "",
      status: body.status || "active", // active, maintenance, blocked
      workingHours: body.workingHours || { start: "09:00", end: "17:00" },
      blackoutDates: body.blackoutDates || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("Resource created successfully:", docRef.id);

    return new Response(JSON.stringify({ id: docRef.id, success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CREATE RESOURCE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create resource", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PATCH - Update existing resource
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    console.log("Received update resource request:", { id, updates });

    if (!id) {
      return new Response(JSON.stringify({ error: "Resource ID is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resourceRef = doc(db, "resources", id);
    const resourceSnap = await getDoc(resourceRef);

    if (!resourceSnap.exists()) {
      return new Response(JSON.stringify({ error: "Resource not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await updateDoc(resourceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    console.log("Resource updated successfully:", id);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("UPDATE RESOURCE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to update resource", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE - Remove resource
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("Received delete resource request:", id);

    if (!id) {
      return new Response(JSON.stringify({ error: "Resource ID is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resourceRef = doc(db, "resources", id);
    const resourceSnap = await getDoc(resourceRef);

    if (!resourceSnap.exists()) {
      return new Response(JSON.stringify({ error: "Resource not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await deleteDoc(resourceRef);

    console.log("Resource deleted successfully:", id);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE RESOURCE ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete resource", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
