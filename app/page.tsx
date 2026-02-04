import HeroSection from "@/components/hero-section";
import Header from "@/components/header";
import Footer from "@/components/footer";
// Import the new function
import { getBookings } from "@/lib/firebase";


export default async function Home() {
  // Await the data from the new function
  const bookingsData = await getBookings();

  return (
    <main>
      <Header />
      <HeroSection />
      <Footer />
    </main>
  );
}
