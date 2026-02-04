"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus, Building2 } from "lucide-react";

interface Resource {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  imageUrl: string;
  status: string;
  workingHours: { start: string; end: string };
  blackoutDates: string[];
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: 1,
    imageUrl: "", // Keep for backend compatibility but hidden from UI
    status: "active",
    workingHours: { start: "09:00", end: "17:00" },
    blackoutDates: [] as string[],
  });
  const [newBlackoutDate, setNewBlackoutDate] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      setLoading(true);
      const res = await fetch("/api/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");
      
      const data = await res.json();
      setResources(data.resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  function openCreateDialog() {
    setEditingResource(null);
    setFormData({
      name: "",
      description: "",
      location: "",
      capacity: 1,
      imageUrl: "",
      status: "active",
      workingHours: { start: "09:00", end: "17:00" },
      blackoutDates: [],
    });
    setNewBlackoutDate("");
    setDialogOpen(true);
  }

  function openEditDialog(resource: Resource) {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description,
      location: resource.location,
      capacity: resource.capacity,
      imageUrl: resource.imageUrl,
      status: resource.status,
      workingHours: resource.workingHours || { start: "09:00", end: "17:00" },
      blackoutDates: resource.blackoutDates || [],
    });
    setNewBlackoutDate("");
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "/api/resources";
      const method = editingResource ? "PATCH" : "POST";
      const body = editingResource
        ? { id: editingResource.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save resource");

      toast.success(
        editingResource
          ? "Resource updated successfully"
          : "Resource created successfully"
      );
      setDialogOpen(false);
      fetchResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  }

  function addBlackoutDate() {
    if (!newBlackoutDate) {
      toast.error("Please select a date");
      return;
    }
    if (formData.blackoutDates.includes(newBlackoutDate)) {
      toast.error("This date is already added");
      return;
    }
    setFormData({
      ...formData,
      blackoutDates: [...formData.blackoutDates, newBlackoutDate].sort(),
    });
    setNewBlackoutDate("");
  }

  function removeBlackoutDate(date: string) {
    setFormData({
      ...formData,
      blackoutDates: formData.blackoutDates.filter((d) => d !== date),
    });
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/resources?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete resource");

      toast.success("Resource deleted successfully");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "blocked":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Resource Management</h1>
              <p className="text-muted-foreground">
                Manage facilities and equipment
              </p>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No resources found. Create your first resource to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{resource.name}</CardTitle>
                        <CardDescription>{resource.location}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(resource.status)}>
                        {resource.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {resource.description || "No description"}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Capacity:</span>{" "}
                        {resource.capacity} people
                      </div>
                      <div>
                        <span className="font-medium">Hours:</span>{" "}
                        {resource.workingHours?.start} -{" "}
                        {resource.workingHours?.end}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(resource)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(resource.id, resource.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? "Edit Resource" : "Create New Resource"}
                </DialogTitle>
                <DialogDescription>
                  {editingResource
                    ? "Update the resource information below."
                    : "Add a new resource to the system."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Building A, Room 101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.workingHours.start}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingHours: {
                              ...formData.workingHours,
                              start: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.workingHours.end}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingHours: {
                              ...formData.workingHours,
                              end: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Blackout Dates</Label>
                    <p className="text-sm text-muted-foreground">
                      Dates when this resource is unavailable for booking
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={newBlackoutDate}
                        onChange={(e) => setNewBlackoutDate(e.target.value)}
                        placeholder="Select a date"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addBlackoutDate}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.blackoutDates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.blackoutDates.map((date) => (
                          <Badge
                            key={date}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {new Date(date + "T00:00:00").toLocaleDateString()}
                            <button
                              type="button"
                              onClick={() => removeBlackoutDate(date)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingResource ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
