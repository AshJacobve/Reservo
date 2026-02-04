"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Building2, Calendar } from "lucide-react";

interface Stats {
  totalBookings: number;
  totalResources: number;
  totalUsers: number;
  bookingsByStatus: Record<string, number>;
  bookingsByFacility: Record<string, number>;
  recentBookings: number;
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      // Fetch all data
      const [bookingsRes, resourcesRes] = await Promise.all([
        fetch("/api/bookings-stats"),
        fetch("/api/resources"),
      ]);

      if (!bookingsRes.ok || !resourcesRes.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const bookingsData = await bookingsRes.json();
      const resourcesData = await resourcesRes.json();

      setStats({
        totalBookings: bookingsData.total || 0,
        totalResources: resourcesData.resources?.length || 0,
        totalUsers: bookingsData.uniqueUsers || 0,
        bookingsByStatus: bookingsData.byStatus || {},
        bookingsByFacility: bookingsData.byFacility || {},
        recentBookings: bookingsData.recent || 0,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
            <h1 className="text-3xl font-bold">Statistics & Reports</h1>
            <p className="text-muted-foreground">
              System usage and booking analytics
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Resources
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalResources || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available facilities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Unique users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Bookings
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recentBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings by Status */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Status</CardTitle>
                <CardDescription>Distribution of booking statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.bookingsByStatus && Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            status === "accepted"
                              ? "bg-green-500"
                              : status === "rejected"
                              ? "bg-red-500"
                              : status === "cancelled"
                              ? "bg-gray-500"
                              : status === "completed"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <span className="capitalize">{status}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Most Booked Facilities</CardTitle>
                <CardDescription>Top facilities by booking count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.bookingsByFacility && Object.entries(stats.bookingsByFacility)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([facility, count]) => (
                      <div key={facility} className="flex items-center justify-between">
                        <span className="truncate">{facility}</span>
                        <span className="font-semibold ml-2">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
