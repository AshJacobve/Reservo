// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Add Timestamp and getCountFromServer to the import
import { getFirestore, collection, getDocs, Timestamp, getCountFromServer } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7lVx2xN1VHvYsOyp5D5aLfqHO3xcAF68",
  authDomain: "soen-287-project-794db.firebaseapp.com",
  projectId: "soen-287-project-794db",
  storageBucket: "soen-287-project-794db.firebasestorage.app",
  messagingSenderId: "219613651385",
  appId: "1:219613651385:web:73cb0421bfff7f95335668",
  measurementId: "G-ERS0795T8T"
};

initializeApp(firebaseConfig)
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Get a reference to the Cloud Firestore service
export const db = getFirestore(app);

// Renamed for clarity
const bookingsColRef = collection(db, 'bookings');
// Add a new reference for the 'resources' collection
const resourcesColRef = collection(db, 'resources');
// Add a new reference for the 'users' collection
const usersColRef = collection(db, 'users');

// This function now formats the data and converts the timestamp
export async function getBookings() {
  try {
    const snapshot = await getDocs(bookingsColRef);
    const bookings: any[] = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      // Convert the Firestore Timestamp to a JavaScript Date object
      // Check if bookingTime exists and is a Timestamp before converting
      const bookingTime = data.bookingTime instanceof Timestamp ? data.bookingTime.toDate() : null;
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;

      // Create a new object with the new booking structure
      const formattedBooking = {
        id: doc.id, // Keep the unique ID
        email: data.email || null,
        facility: data.facility || null,
        bookingTime: bookingTime, // Use the converted Date object
        createdAt: createdAt, // When the booking was requested
        status: data.status || "inprogress",
        purpose: data.purpose || null, // Purpose/notes for the booking
      };
      bookings.push(formattedBooking);
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return []; // Return an empty array in case of an error
  }
}

// New function to count bookings
export async function countBookings() {
  try {
    const snapshot = await getCountFromServer(bookingsColRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting bookings:", error);
    return 0; // Return 0 in case of an error
  }
}

// New function to count resources
export async function countResources() {
  try {
    const snapshot = await getCountFromServer(resourcesColRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting resources:", error);
    return 0; // Return 0 in case of an error
  }
}

// New function to count users
export async function countUsers() {
  try {
    const snapshot = await getCountFromServer(usersColRef);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting users:", error);
    return 0; // Return 0 in case of an error
  }
}

// New function to get all resources
export async function getResources() {
  try {
    const snapshot = await getDocs(resourcesColRef);
    // Map the documents to a new array with only name and location
    const resources = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: data.name || null, // Get the name, or null if it doesn't exist
        location: data.location || null, // Get the location, or null if it doesn't exist
      };
    });
    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return []; // Return an empty array in case of an error
  }
}

// New function to get bookings aggregated by date for the chart
export async function getBookingsByDate() {
  try {
    const snapshot = await getDocs(bookingsColRef);
    const bookingsByDate: { [key: string]: number } = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Ensure createdAt field exists and is a Timestamp
      if (data.createdAt && data.createdAt instanceof Timestamp) {
        const date = data.createdAt.toDate();
        // Format date as YYYY-MM-DD
        const dateString = date.toISOString().split('T')[0];

        if (bookingsByDate[dateString]) {
          bookingsByDate[dateString]++;
        } else {
          bookingsByDate[dateString] = 1;
        }
      }
    });

    // Convert the aggregated object into an array of objects for the chart
    const chartData = Object.keys(bookingsByDate).map(date => ({
      date: date,
      bookings: bookingsByDate[date],
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

    return chartData;
  } catch (error) {
    console.error("Error fetching bookings by date:", error);
    return [];
  }
}

