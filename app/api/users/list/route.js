import { db } from "@/public/firebaseWebConfig";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req) {
  try {
    // Get all users
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    // Get all bookings to count per user
    const bookingsRef = collection(db, "bookings");
    const bookingsSnapshot = await getDocs(bookingsRef);

    // Count bookings per user
    const bookingCounts = {};
    bookingsSnapshot.docs.forEach(doc => {
      const email = doc.data().email;
      if (email) {
        bookingCounts[email] = (bookingCounts[email] || 0) + 1;
      }
    });

    // Combine user data with booking counts
    const users = usersSnapshot.docs.map(doc => ({
      email: doc.id,
      ...doc.data(),
      bookingCount: bookingCounts[doc.id] || 0,
    }));

    // Also include users who have bookings but no profile
    Object.keys(bookingCounts).forEach(email => {
      if (!users.find(u => u.email === email)) {
        users.push({
          email,
          name: "",
          phone: "",
          bookingCount: bookingCounts[email],
        });
      }
    });

    console.log(`Found ${users.length} users`);

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch users", 
      details: error.message,
      users: []
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
