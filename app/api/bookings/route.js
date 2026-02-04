import { db } from "@/public/firebaseWebConfig";
import { collection, addDoc, Timestamp, doc, updateDoc, getDoc, query, where, getDocs } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(JSON.stringify({ error: "Email parameter is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Query bookings for this user's email
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      bookingTime: doc.data().bookingTime?.toDate().toISOString(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    console.log(`Found ${bookings.length} bookings for ${email}`);

    return new Response(JSON.stringify({ bookings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch bookings", 
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
    
    console.log("Received booking request:", body);

    // Validate required fields
    if (!body.start || !body.email || !body.facility) {
      console.error("Missing required fields:", { start: body.start, email: body.email, facility: body.facility });
      return new Response(JSON.stringify({ error: "Missing required fields: start, email, or facility" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create the booking document with the required structure
    const docRef = await addDoc(collection(db, "bookings"), {
      bookingTime: Timestamp.fromDate(new Date(body.start)), // The actual booking time
      createdAt: Timestamp.now(), // When the booking was created
      email: body.email, // User's email
      facility: body.facility || body.serviceName || "Unknown Facility", // Facility name
      status: "inprogress", // Default status is "inprogress"
      purpose: body.purpose || "", // Optional purpose/notes
    });

    console.log("Booking created successfully:", docRef.id);

    return new Response(JSON.stringify({ id: docRef.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("BOOKING ERROR:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return new Response(JSON.stringify({ 
      error: "Booking failed", 
      details: error.message,
      code: error.code 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    console.log("Received update request:", { id, status });

    // Validate required fields
    if (!id || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields: id or status" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate status value
    const validStatuses = ["inprogress", "accepted", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status value" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update the booking status
    const bookingRef = doc(db, "bookings", id);
    
    // Check if document exists
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) {
      return new Response(JSON.stringify({ error: "Booking not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await updateDoc(bookingRef, {
      status: status,
      updatedAt: Timestamp.now(),
    });

    console.log("Booking status updated successfully:", id);

    return new Response(JSON.stringify({ success: true, id, status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return new Response(JSON.stringify({ 
      error: "Update failed", 
      details: error.message,
      code: error.code 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
