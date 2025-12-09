
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { Users, Check } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AvatarPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, url: string) => void;
  currentAvatarUrl: string;
  currentName: string;
  usedAvatars: string[];
};

export default function AvatarPickerDialog({
  open,
  onOpenChange,
  onSave,
  currentAvatarUrl,
  currentName,
  usedAvatars,
}: AvatarPickerDialogProps) {
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedAvatar(currentAvatarUrl);
      const nameParts = currentName.split(' ');
      setFirstName(nameParts[0] || "");
      if (nameParts.length > 1) {
          setLastName(nameParts.slice(1).join(' '));
      } else {
        setLastName("");
      }
    }
  }, [open, currentAvatarUrl, currentName]);

  const handleConfirm = () => {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (fullName) {
      onSave(fullName, selectedAvatar);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
          <DialogDescription>
            Change your name and choose an avatar from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name (optional)</Label>
                    <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-background"
                    />
                </div>
            </div>
            <ScrollArea className="h-auto max-h-[50vh] pr-6">
            <div className="grid grid-cols-8 justify-center gap-4 py-4 pl-4">
                {PlaceHolderImages.map(({ imageUrl, imageHint }) => {
                const isUsedByOther = usedAvatars.includes(imageUrl) && imageUrl !== currentAvatarUrl;
                const isSelected = selectedAvatar === imageUrl;

                return (
                    <button
                    key={imageUrl}
                    disabled={isUsedByOther}
                    onClick={() => setSelectedAvatar(imageUrl)}
                    className={cn(
                        "aspect-square relative group transition-all duration-200 rounded-full",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isUsedByOther
                        ? "opacity-30 cursor-not-allowed"
                        : "cursor-pointer"
                    )}
                    >
                    <Image
                        src={imageUrl}
                        alt={imageHint}
                        data-ai-hint={imageHint}
                        fill
                        className="object-cover rounded-full"
                    />
                    {isUsedByOther && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <Users className="text-white w-1/2 h-1/2" />
                        </div>
                    )}
                     {isSelected && (
                      <div className="absolute inset-0 bg-primary/70 flex items-center justify-center rounded-full">
                        <Check className="text-primary-foreground w-1/2 h-1/2" />
                      </div>
                    )}
                    </button>
                );
                })}
            </div>
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={!firstName.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
