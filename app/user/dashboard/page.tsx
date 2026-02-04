"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AnnouncementPopup } from "@/components/announcement-popup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  facility: string;
  bookingTime: Date;
  status: string;
  email: string;
  purpose?: string;
}

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email) {
      fetchBookings();
    }
  }, [user]);

  async function fetchBookings() {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(user!.email!)}`);
      
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await res.json();
      
      // Convert bookingTime strings to Date objects, filter out cancelled, and sort
      const bookingsWithDates = data.bookings
        .filter((b: any) => b.status !== "cancelled")
        .map((b: any) => ({
          ...b,
          bookingTime: new Date(b.bookingTime),
        }))
        .sort((a: Booking, b: Booking) => {
          // Accepted bookings first
          if (a.status === "accepted" && b.status !== "accepted") return -1;
          if (a.status !== "accepted" && b.status === "accepted") return 1;
          // Then sort by booking time
          return a.bookingTime.getTime() - b.bookingTime.getTime();
        });

      setBookings(bookingsWithDates);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    try {
      setCancellingId(bookingId);
      
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bookingId,
          status: "cancelled",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "cancelled":
        return "bg-gray-500";
      case "inprogress":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  }

  function canCancel(booking: Booking) {
    // Can cancel if status is not already cancelled, rejected, or completed
    // And if the booking is in the future
    const now = new Date();
    return (
      booking.status !== "cancelled" &&
      booking.status !== "rejected" &&
      booking.status !== "completed" &&
      booking.bookingTime > now
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.bookingTime > new Date() && b.status !== "cancelled" && b.status !== "rejected"
  );
  const pastBookings = bookings.filter(
    (b) => b.bookingTime <= new Date() || b.status === "cancelled" || b.status === "rejected"
  );

  return (
    <>
      <AnnouncementPopup />
      <Header />
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your facility bookings
          </p>
        </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={() => router.push("/user/scheduler")} variant="outline">
          Book New Facility
        </Button>
        <Button onClick={fetchBookings} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Upcoming Bookings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Upcoming Bookings ({upcomingBookings.length})
        </h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No upcoming bookings
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{booking.facility}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <CardDescription>Booking ID: {booking.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.bookingTime.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.bookingTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {booking.purpose && (
                      <div className="mt-3 p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Purpose:</p>
                        <p className="text-sm">{booking.purpose}</p>
                      </div>
                    )}
                  </div>
                  {canCancel(booking) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                    >
                      {cancellingId === booking.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Cancel Booking"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Past Bookings ({pastBookings.length})
        </h2>
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No past bookings
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastBookings.map((booking) => (
              <Card key={booking.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{booking.facility}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <CardDescription>Booking ID: {booking.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.bookingTime.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.bookingTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
