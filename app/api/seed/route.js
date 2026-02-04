import { db } from "@/public/firebaseWebConfig";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    // Check if resources already exist
    const resourcesRef = collection(db, "resources");
    const snapshot = await getDocs(resourcesRef);
    
    if (snapshot.size > 0) {
      return new Response(JSON.stringify({ 
        message: "Resources already exist. Delete them first if you want to re-seed.",
        count: snapshot.size
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create initial resources
    const initialResources = [
      {
        name: "Computer Science Lab 1",
        description: "30 workstations with latest development tools and IDEs",
        location: "Building A, Room 101",
        capacity: 30,
        imageUrl: "",
        status: "active",
        workingHours: { start: "09:00", end: "17:00" },
        blackoutDates: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        name: "Music Room",
        description: "Equipped with piano, guitars, and recording equipment",
        location: "Building B, Room 205",
        capacity: 10,
        imageUrl: "",
        status: "active",
        workingHours: { start: "09:00", end: "21:00" },
        blackoutDates: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        name: "Study Room A",
        description: "Quiet study space with whiteboards and group tables",
        location: "Library, Floor 2",
        capacity: 8,
        imageUrl: "",
        status: "active",
        workingHours: { start: "08:00", end: "22:00" },
        blackoutDates: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        name: "Conference Room",
        description: "Professional meeting space with projector and video conferencing",
        location: "Building C, Room 301",
        capacity: 20,
        imageUrl: "",
        status: "active",
        workingHours: { start: "09:00", end: "18:00" },
        blackoutDates: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        name: "Maker Space",
        description: "3D printers, laser cutters, and prototyping tools",
        location: "Building A, Basement",
        capacity: 15,
        imageUrl: "",
        status: "active",
        workingHours: { start: "10:00", end: "17:00" },
        blackoutDates: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    const promises = initialResources.map(resource => 
      addDoc(collection(db, "resources"), resource)
    );

    const results = await Promise.all(promises);

    console.log(`Seeded ${results.length} resources`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully created ${results.length} resources`,
      resources: results.map((r, i) => ({
        id: r.id,
        name: initialResources[i].name
      }))
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("SEED ERROR:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to seed resources", 
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
