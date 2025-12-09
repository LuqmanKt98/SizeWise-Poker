
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2 } from "lucide-react";

type EntryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, avatarUrl: string, sizingMethod: string, customSizing: string) => Promise<void>;
  onJoin: (name: string, avatarUrl: string, roomId: string) => Promise<void>;
  action: "create" | "join";
  isFirebaseLoading: boolean;
};

export default function EntryDialog({
  open,
  onOpenChange,
  onCreate,
  onJoin,
  action,
  isFirebaseLoading
}: EntryDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [sizingMethod, setSizingMethod] = useState("fibonacci");
  const [customSizing, setCustomSizing] = useState("1,2,4,8,16");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("pokerUserName");
    if (storedName) {
        const nameParts = storedName.split(' ');
        setFirstName(nameParts[0] || "");
        if (nameParts.length > 1) {
            setLastName(nameParts.slice(1).join(' '));
        }
    }
  }, []);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    // Default to empty string for avatar, initials will be shown.
    const defaultAvatarUrl = "";

    if (action === "create") {
      await onCreate(fullName, defaultAvatarUrl, sizingMethod, customSizing);
    } else {
      await onJoin(fullName, defaultAvatarUrl, roomId);
    }
    // Don't set isSubmitting to false here, as the component will unmount on success.
    // If it fails, we might want to show an error and allow retry.
  };

  const canSubmit = 
      firstName.trim() &&
      (action === 'create' || (action === 'join' && roomId.trim())) &&
      !isFirebaseLoading &&
      !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{action === "create" ? "Create a New Room" : "Join an Existing Room"}</DialogTitle>
          <DialogDescription>
            {action === "create" ? "Set up your name and room settings." : "Enter your details and the Room ID to join."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                        id="first-name"
                        placeholder="e.g. Alice"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name (optional)</Label>
                    <Input
                        id="last-name"
                        placeholder="e.g. Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-background"
                    />
                </div>
                
                {action === "join" && (
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="room-id">Room ID</Label>
                        <Input
                            id="room-id"
                            placeholder="Enter the Room ID from your host"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="bg-background"
                        />
                    </div>
                )}

                {action === "create" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sizing-method">Sizing Method</Label>
                      <Select value={sizingMethod} onValueChange={setSizingMethod}>
                        <SelectTrigger id="sizing-method" className="bg-background">
                          <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fibonacci">
                            Fibonacci (0, 1, 2, 3, 5...)
                          </SelectItem>
                          <SelectItem value="t-shirt">
                            T-Shirt (XS, S, M, L, XL)
                          </SelectItem>
                          <SelectItem value="custom">
                            Custom
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                )}
                 {action === "create" && sizingMethod === 'custom' && (
                  <div className="space-y-2 animate-in fade-in duration-300 md:col-span-2">
                    <Label htmlFor="custom-sizing">Custom Values (comma-separated)</Label>
                    <Input
                      id="custom-sizing"
                      placeholder="e.g. 1,2,4,8,16"
                      value={customSizing}
                      onChange={(e) => setCustomSizing(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
            </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={!canSubmit}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? (action === 'create' ? 'Creating Room...' : 'Joining Room...')
              : (action === "create" ? "Create and Enter Room" : "Join Room")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
