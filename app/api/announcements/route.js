import { db } from "@/public/firebaseWebConfig";
import { collection, addDoc, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore";

// GET - Fetch all announcements
export async function GET(req) {
  try {
    const announcementsRef = collection(db, "announcements");
    const q = query(announcementsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return new Response(JSON.stringify({ announcements }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET ANNOUNCEMENTS ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch announcements", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST - Create new announcement
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, message, createdBy } = body;

    if (!title || !message) {
      return new Response(JSON.stringify({ error: "Title and message are required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const docRef = await addDoc(collection(db, "announcements"), {
      title,
      message,
      createdBy: createdBy || "Admin",
      createdAt: Timestamp.now(),
      active: true,
    });

    console.log("Announcement created:", docRef.id);

    return new Response(JSON.stringify({ id: docRef.id, success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create announcement", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE - Remove announcement
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Announcement ID is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await deleteDoc(doc(db, "announcements", id));

    console.log("Announcement deleted:", id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to delete announcement", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
