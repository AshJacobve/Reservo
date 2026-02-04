import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getBookings } from "@/lib/firebase";

export default async function BookingsPage() {
  const bookingsData = await getBookings();

  // Filter out cancelled bookings and sort by most recent first
  const activeBookings = bookingsData
    .filter(booking => booking.status !== "cancelled")
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Most recent first
    });

  const formattedData = activeBookings.map((booking) => ({
    id: booking.id,
    docId: booking.id,
    facility: booking.facility || "N/A",
    status: booking.status || "inprogress",
    time: booking.bookingTime ? new Date(booking.bookingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
    date: booking.bookingTime ? new Date(booking.bookingTime).toLocaleDateString() : "N/A",
    email: booking.email || "N/A",
    createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A",
    purpose: booking.purpose || "",
  }));

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">All Bookings</h1>
            <p className="text-muted-foreground">
              Manage and approve booking requests
            </p>
          </div>
          <DataTable data={formattedData} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
