import { db } from "@/public/firebaseWebConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET() {
  try {
    // Fetch all resources first to see what we have
    const allSnapshot = await getDocs(collection(db, "resources"));
    console.log(`Total resources in DB: ${allSnapshot.size}`);
    
    allSnapshot.docs.forEach(doc => {
      console.log(`Resource: ${doc.id}, status: ${doc.data().status}, name: ${doc.data().name}`);
    });

    // Only fetch active resources for user booking (or resources without status field)
    const services = allSnapshot.docs
      .filter(doc => {
        const status = doc.data().status;
        return !status || status === "active"; // Include if no status or status is active
      })
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    console.log(`Found ${services.length} active services`);

    return new Response(JSON.stringify({ services }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET SERVICES ERROR:", error);
    return new Response(JSON.stringify({ 
      services: [],
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
