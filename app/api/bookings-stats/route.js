import { db } from "@/public/firebaseWebConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

export async function GET(req) {
  try {
    const bookingsRef = collection(db, "bookings");
    const snapshot = await getDocs(bookingsRef);

    // Calculate statistics
    const total = snapshot.size;
    const uniqueUsers = new Set();
    const byStatus = {};
    const byFacility = {};
    
    // Get date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let recentCount = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Count unique users
      if (data.email) {
        uniqueUsers.add(data.email);
      }

      // Count by status
      const status = data.status || "inprogress";
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Count by facility
      const facility = data.facility || "Unknown";
      byFacility[facility] = (byFacility[facility] || 0) + 1;

      // Count recent bookings
      if (data.createdAt && data.createdAt.toDate() >= sevenDaysAgo) {
        recentCount++;
      }
    });

    return new Response(JSON.stringify({
      total,
      uniqueUsers: uniqueUsers.size,
      byStatus,
      byFacility,
      recent: recentCount,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch statistics", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
