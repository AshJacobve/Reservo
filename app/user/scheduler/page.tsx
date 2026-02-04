// =============================================
// Description: Facility booking page with facility picker, calendar,
//              real-time availability grid, and automatic email from logged-in user.
//              Bookings are saved to Firestore with status "inprogress".
// =============================================

"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { AnnouncementPopup } from "@/components/announcement-popup";

import { useEffect, useMemo, useState } from "react";
import { format, isBefore } from "date-fns";
import { Calendar } from "@/components/calendar";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/protected-routes";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textareata";

import { useAuth } from "@/app/user/context/AuthContext";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

type Service = {
  id: string;
  name: string;
  durationMinutes: number; // e.g. 30, 45, 60
  description?: string;
};

type AvailabilitySlot = {
  start: string; // ISO time string
  end: string; // ISO time string
  capacity?: number; // optional
};

type BookingPayload = {
  start: string; // ISO timestamp for booking
  email: string;
  facility: string;
  purpose?: string; // Optional purpose/notes
};

type BookingSummary = {
  id: string;
  serviceName?: string;
  resourceName?: string;
  start: string; // ISO
  end: string; // ISO
  purpose?: string;
  status?: string;
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

// ------------------------------------------------------------
// API Hooks
// ------------------------------------------------------------

function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try your existing endpoint first
        const res = await fetch("/api/services", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setServices(data?.services ?? []);
        } else {
          // Fallback defaults
          if (mounted)
            setServices([
              {
                id: "default-30",
                name: "Study Room Booking",
                durationMinutes: 60,
                description: "1-hour session",
              },
              {
                id: "default-60-1",
                name: "Computer Science Lab Booking",
                durationMinutes: 60,
                description: "1-hour session",
              },
              {
                id: "default-60-2",
                name: "Music Room Booking",
                durationMinutes: 60,
                description: "1-hour session",
              },
            ]);
        }
      } catch (e) {
        if (mounted)
          setServices([
            { id: "default-30", name: "Study Room", durationMinutes: 60 },
            {
              id: "default-60",
              name: "Computer Science Lab",
              durationMinutes: 60,
            },
            { id: "default-90", name: "Music Room", durationMinutes: 60 },
          ]);
        setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { services, loading };
}

function useAvailability(
  date: Date | undefined,
  facilityName: string | undefined,
  timezone: string
) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !facilityName) return;
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const isoDay = toISODate(date);
        const res = await fetch(
          `/api/availability?date=${encodeURIComponent(
            isoDay
          )}&facility=${encodeURIComponent(facilityName)}&tz=${encodeURIComponent(
            timezone
          )}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (mounted) setSlots(Array.isArray(data?.slots) ? data.slots : []);
        } else {
          // Fallback demo slots if API is not ready
          const base = new Date(date);
          base.setHours(9, 0, 0, 0);
          const demo: AvailabilitySlot[] = Array.from({ length: 8 }).map(
            (_, i) => {
              const start = new Date(base.getTime() + i * 30 * 60 * 1000);
              const end = new Date(start.getTime() + 30 * 60 * 1000);
              return {
                start: start.toISOString(),
                end: end.toISOString(),
                capacity: 1,
              };
            }
          );
          if (mounted) setSlots(demo);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date?.toDateString(), facilityName, timezone]);

  return { slots, loading };
}

// 🔹 "My bookings" (upcoming + past)
function useMyBookings(refreshKey: number) {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<BookingSummary[]>([]);
  const [past, setPast] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bookings?email=${encodeURIComponent(user.email!)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }
        const data = await res.json();
        const rawBookings = data.bookings ?? [];
        
        // Transform bookings to have start/end fields
        const bookings: BookingSummary[] = rawBookings.map((b: any) => {
          const bookingTime = new Date(b.bookingTime);
          const endTime = new Date(bookingTime.getTime() + 60 * 60 * 1000); // Add 1 hour
          
          return {
            id: b.id,
            serviceName: b.facility,
            resourceName: b.facility,
            start: bookingTime.toISOString(),
            end: endTime.toISOString(),
            purpose: b.purpose,
            status: b.status,
          };
        });

        const now = new Date();
        const up: BookingSummary[] = [];
        const pa: BookingSummary[] = [];

        for (const b of bookings) {
          const end = new Date(b.end);
          if (end >= now) up.push(b);
          else pa.push(b);
        }

        if (!cancelled) {
          setUpcoming(up);
          setPast(pa);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load bookings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, user?.email]);

  return { upcoming, past, loading, error };
}

// ------------------------------------------------------------
// API calls for booking CRUD
// ------------------------------------------------------------

async function createBooking(payload: BookingPayload) {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let errorMessage = "Booking failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.details || errorData.error || errorMessage;
      console.error("Booking error details:", errorData);
    } catch (e) {
      errorMessage = await res.text() || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

async function cancelBooking(id: string) {
  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Failed to cancel booking");
  }
}

async function updateBookingTimeAndPurpose(
  id: string,
  startISO: string,
  endISO: string,
  purpose: string
) {
  const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start: startISO, end: endISO, purpose }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || "Failed to update booking");
  }
}

// ------------------------------------------------------------
// UI Card components
// ------------------------------------------------------------

const Card = ({ children, className, ...props }: any) => (
  <div
    className={cn("bg-card text-card-foreground rounded-md", className)}
    {...props}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className, ...props }: any) => (
  <div className={cn("px-4 py-2 border-b", className)} {...props}>
    {children}
  </div>
);
const CardContent = ({ children, className, ...props }: any) => (
  <div className={cn("p-4", className)} {...props}>
    {children}
  </div>
);
const CardTitle = ({ children, className, ...props }: any) => (
  <h3 className={cn("text-lg font-medium", className)} {...props}>
    {children}
  </h3>
);

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function SchedulerPage() {
  const router = useRouter();
  const qs = useSearchParams();
  const { user, loading: authLoading } = useAuth(); // Get logged-in user

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const preService = qs.get("serviceId") || undefined;
  const preDateStr = qs.get("date") || undefined;

  const { services, loading: servicesLoading } = useServices();

  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(preService);

  const [timezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });

  const [date, setDate] = useState<Date | undefined>(() => {
    if (!preDateStr) return undefined;
    const d = new Date(preDateStr);
    return isNaN(d.getTime()) ? undefined : d;
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const { slots, loading: slotsLoading } = useAvailability(
    date,
    selectedService?.name, // Pass facility name instead of ID
    timezone
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );

  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string>("");

  // "My bookings"
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0);
  const {
    upcoming: myUpcoming,
    past: myPast,
    loading: bookingsLoading,
    error: bookingsError,
  } = useMyBookings(bookingsRefreshKey);

  // Can submit if we have service, date, slot, and user email
  const canSubmit = !!(selectedService && date && selectedSlot && user?.email);

  async function onBook() {
    if (!canSubmit || !selectedService || !selectedSlot || !date || !user?.email) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: BookingPayload = {
        start: selectedSlot.start,
        email: user.email,
        facility: selectedService.name,
        purpose: purpose.trim() || undefined, // Optional purpose
      };
      const res = await createBooking(payload);
      setSuccessId(res?.id || "success");
      setBookingsRefreshKey((k) => k + 1);
      
      // Show success message
      toast.success("Booking confirmed! Redirecting to your bookings...");
      
      // Reset form
      setPurpose("");
      setSelectedSlot(null);
      
      // Redirect to dashboard after successful booking
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1500); // Small delay to show success message
    } catch (e: any) {
      setError(e?.message || "Booking failed");
      toast.error(e?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      setBookingsRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e?.message || "Failed to cancel booking");
    }
  }

  async function handleEditBooking(b: BookingSummary) {
    const currentStart = new Date(b.start);
    const currentEnd = new Date(b.end);

    const startPrompt = prompt(
      "New start time (HH:MM, 24h)",
      format(currentStart, "HH:mm")
    );
    if (!startPrompt) return;
    const endPrompt = prompt(
      "New end time (HH:MM, 24h)",
      format(currentEnd, "HH:mm")
    );
    if (!endPrompt) return;

    const purposePrompt = prompt("Purpose", b.purpose ?? "") ?? b.purpose ?? "";

    const bookingDate = format(currentStart, "yyyy-MM-dd");
    const [sh, sm] = startPrompt.split(":").map((n) => parseInt(n, 10));
    const [eh, em] = endPrompt.split(":").map((n) => parseInt(n, 10));

    const newStart = new Date(bookingDate);
    newStart.setHours(sh || 0, sm || 0, 0, 0);

    const newEnd = new Date(bookingDate);
    newEnd.setHours(eh || 0, em || 0, 0, 0);

    if (!(newEnd > newStart)) {
      alert("End time must be after start time.");
      return;
    }

    try {
      await updateBookingTimeAndPurpose(
        b.id,
        newStart.toISOString(),
        newEnd.toISOString(),
        purposePrompt
      );
      setBookingsRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e?.message || "Failed to update booking");
    }
  }

  // Keep URL in sync
  useEffect(() => {
    const params = new URLSearchParams(qs.toString());
    if (selectedServiceId) params.set("serviceId", selectedServiceId);
    else params.delete("serviceId");
    if (date) params.set("date", toISODate(date));
    else params.delete("date");
    const url = `/scheduler?${params.toString()}`;
    window.history.replaceState(null, "", url);
  }, [selectedServiceId, date, qs]);

  return (
    <ProtectedRoute>
      <>
        <AnnouncementPopup />
        <Header />

        {/* MAIN GRID */}
        <div className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: service + calendar + slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* BOOKING SETUP */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Service</Label>
                    <Select
                      value={selectedServiceId}
                      onValueChange={setSelectedServiceId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            servicesLoading
                              ? "Loading services..."
                              : "Select a service"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} ({s.durationMinutes}m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-2" />

                {/* Calendar */}
                <div>
                  <Label className="mb-2 block">Pick a date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d ?? undefined);
                      setSelectedSlot(null);
                    }}
                    disabled={(d) =>
                      isBefore(d, new Date(new Date().setHours(0, 0, 0, 0)))
                    }
                    initialFocus
                    numberOfMonths={2}
                    className="rounded-xl border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AVAILABLE TIMES */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Available Times</CardTitle>
              </CardHeader>
              <CardContent>
                {!date || !selectedServiceId ? (
                  <p className="text-sm text-muted-foreground">
                    Select a service and date to view availability.
                  </p>
                ) : slotsLoading ? (
                  <p className="text-sm">Loading slots…</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No slots available for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {slots.map((s) => {
                      const start = new Date(s.start);
                      const end = new Date(s.end);
                      const label = `${format(start, "HH:mm")}–${format(
                        end,
                        "HH:mm"
                      )}`;
                      const active = selectedSlot?.start === s.start;
                      return (
                        <button
                          key={s.start}
                          onClick={() => setSelectedSlot(s)}
                          className={classNames(
                            "rounded-lg border px-3 py-2 text-sm",
                            active
                              ? "border-primary ring-2 ring-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Details */}
          <div className="space-y-6">
            <Card className="sticky top-6 shadow-sm">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show logged-in user's email */}
                {user?.email && (
                  <div>
                    <Label>Booking as:</Label>
                    <p className="text-sm font-medium mt-1">{user.email}</p>
                  </div>
                )}

                <Separator />

                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    <strong>Facility:</strong>{" "}
                    {selectedService
                      ? `${selectedService.name}`
                      : "—"}
                  </div>
                  <div>
                    <strong>Date:</strong> {date ? format(date, "PPP") : "—"}
                  </div>
                  <div>
                    <strong>Time:</strong>{" "}
                    {selectedSlot
                      ? `${format(
                          new Date(selectedSlot.start),
                          "HH:mm"
                        )}–${format(new Date(selectedSlot.end), "HH:mm")}`
                      : "—"}
                  </div>
                  <div>
                    <strong>Timezone:</strong> {timezone}
                  </div>
                </div>

                {/* Purpose field */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">
                    Purpose / Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <textarea
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Study session, team meeting, project work..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {purpose.length}/200
                  </p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {successId && (
                  <p className="text-sm text-green-600">
                    Booked! Reference: {successId}
                  </p>
                )}

                <Button
                  disabled={!canSubmit || submitting}
                  onClick={onBook}
                  className="w-full"
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MY BOOKINGS */}
        <div className="container mx-auto px-4 pb-12">
          <Card className="mt-8 shadow-sm">
            <CardHeader>
              <CardTitle>My bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {bookingsLoading ? (
                <p className="text-sm">Loading your bookings…</p>
              ) : bookingsError ? (
                <p className="text-sm text-red-600">{bookingsError}</p>
              ) : (
                <>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Upcoming</h4>
                    {myUpcoming.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You have no upcoming bookings.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {myUpcoming.map((b) => {
                          const start = new Date(b.start);
                          const end = new Date(b.end);
                          return (
                            <div
                              key={b.id}
                              className="flex flex-col gap-2 rounded-lg border p-3 text-sm md:flex-row md:items-center md:justify-between"
                            >
                              <div>
                                <div className="font-medium">
                                  {b.resourceName || b.serviceName || "Booking"}
                                </div>
                                <div className="text-muted-foreground">
                                  {format(start, "PPP")} —{" "}
                                  {format(start, "HH:mm")}–
                                  {format(end, "HH:mm")}
                                </div>
                                {b.purpose && <div>{b.purpose}</div>}
                                {b.status && (
                                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Status: {b.status}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBooking(b)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Past</h4>
                    {myPast.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You have no past bookings yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {myPast.map((b) => {
                          const start = new Date(b.start);
                          const end = new Date(b.end);
                          return (
                            <div
                              key={b.id}
                              className="rounded-lg border p-3 text-sm"
                            >
                              <div className="font-medium">
                                {b.resourceName || b.serviceName || "Booking"}
                              </div>
                              <div className="text-muted-foreground">
                                {format(start, "PPP")} —{" "}
                                {format(start, "HH:mm")}–{format(end, "HH:mm")}
                              </div>
                              {b.purpose && <div>{b.purpose}</div>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </>
    </ProtectedRoute>
  );
}
