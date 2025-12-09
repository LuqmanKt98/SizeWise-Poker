
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";


type RoomSettingsDialogProps = {
  isHost: boolean;
};

export default function RoomSettingsDialog({ isHost }: RoomSettingsDialogProps) {

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Manage the room settings and your personal appearance preferences.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label>Appearance</Label>
          <div className="p-2 bg-muted rounded-md">
            <ModeToggle />
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
