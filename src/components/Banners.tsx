
"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { DonateButton } from "./DonateButton";
import FeedbackDialog from "./FeedbackDialog";

function FeedbackButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        aria-label="Open suggestions"
        className={cn(
          "h-14 rounded-full shadow-lg border-2 border-accent/20 bg-accent hover:bg-accent/90 text-accent-foreground w-full justify-start px-4",
          "flex items-center gap-3"
        )}
      >
        <Star className="h-6 w-6" />
        <span className="font-medium">Suggest improvements</span>
      </Button>
      <FeedbackDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}


export function Banners() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-8 z-40 flex flex-col items-start gap-4 w-auto">
      <DonateButton />
      <FeedbackButton />
    </div>
  );
}
