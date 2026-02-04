import { db } from "@/public/firebaseWebConfig";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD format
    const facilityName = searchParams.get("facility"); // Facility name

    console.log("Availability check for:", { date, facilityName });

    if (!date || !facilityName) {
      return new Response(JSON.stringify({ slots: [] }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if the date is a blackout date for this facility
    const resourcesRef = collection(db, "resources");
    const resourceQuery = query(resourcesRef, where("name", "==", facilityName));
    const resourceSnapshot = await getDocs(resourceQuery);
    
    if (!resourceSnapshot.empty) {
      const resourceData = resourceSnapshot.docs[0].data();
      const blackoutDates = resourceData.blackoutDates || [];
      
      if (blackoutDates.includes(date)) {
        console.log(`Date ${date} is a blackout date for ${facilityName}`);
        return new Response(JSON.stringify({ slots: [] }), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Parse the date string in UTC to match how booking times are stored
    const [year, month, day] = date.split('-').map(Number);
    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log("Date range (UTC):", {
      dayStart: dayStart.toISOString(),
      dayEnd: dayEnd.toISOString()
    });

    // Query bookings for this facility only (single where clause to avoid composite index)
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("facility", "==", facilityName)
    );

    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.docs.length} bookings for facility: ${facilityName}`);
    
    // Get all booked time slots (extract hour from bookingTime)
    // Filter by date in memory to avoid needing a composite index
    const bookedHours = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log("Checking booking:", {
        id: doc.id,
        facility: data.facility,
        status: data.status,
        bookingTime: data.bookingTime?.toDate().toISOString()
      });
      
      if (data.bookingTime && data.status !== "rejected" && data.status !== "cancelled") {
        const bookingDate = data.bookingTime.toDate();
        
        console.log("Booking date check:", {
          bookingDate: bookingDate.toISOString(),
          dayStart: dayStart.toISOString(),
          dayEnd: dayEnd.toISOString(),
          isInRange: bookingDate >= dayStart && bookingDate <= dayEnd
        });
        
        // Check if booking is on the selected date
        if (bookingDate >= dayStart && bookingDate <= dayEnd) {
          const hour = bookingDate.getHours();
          bookedHours.add(hour);
          console.log("Booked slot found:", { hour, status: data.status, time: bookingDate.toISOString() });
        }
      }
    });

    console.log("Booked hours:", Array.from(bookedHours));

    // Generate available slots (9 AM to 5 PM, 1-hour intervals)
    const availableSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      // Check if this hour is already booked
      if (!bookedHours.has(hour)) {
        const slotTime = `${String(hour).padStart(2, "0")}:00`;
        const startDateTime = new Date(`${date}T${slotTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        
        availableSlots.push({
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          capacity: 1,
        });
      }
    }

    console.log("Available slots count:", availableSlots.length);

    return new Response(JSON.stringify({ slots: availableSlots }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return new Response(JSON.stringify({ slots: [], error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
