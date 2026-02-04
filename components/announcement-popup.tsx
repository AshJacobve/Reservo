"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

export function AnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) return;

      const data = await res.json();
      
      // Get dismissed announcements from localStorage
      const dismissed = JSON.parse(
        localStorage.getItem("dismissedAnnouncements") || "[]"
      );

      // Filter out already dismissed announcements
      const newAnnouncements = data.announcements.filter(
        (announcement: Announcement) => !dismissed.includes(announcement.id)
      );

      if (newAnnouncements.length > 0) {
        setAnnouncements(newAnnouncements);
        setOpen(true);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  }

  function handleClose() {
    const currentAnnouncement = announcements[currentIndex];
    if (currentAnnouncement) {
      // Mark as dismissed
      const dismissed = JSON.parse(
        localStorage.getItem("dismissedAnnouncements") || "[]"
      );
      dismissed.push(currentAnnouncement.id);
      localStorage.setItem("dismissedAnnouncements", JSON.stringify(dismissed));
    }

    // Show next announcement if available
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setOpen(false);
    }
  }

  const currentAnnouncement = announcements[currentIndex];

  if (!currentAnnouncement) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {currentAnnouncement.title}
          </DialogTitle>
          <DialogDescription>
            From {currentAnnouncement.createdBy} •{" "}
            {new Date(currentAnnouncement.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="whitespace-pre-wrap text-sm">
            {currentAnnouncement.message}
          </p>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {currentIndex + 1} of {announcements.length}
          </p>
          <Button onClick={handleClose}>
            {currentIndex < announcements.length - 1 ? "Next" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
