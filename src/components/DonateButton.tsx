
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export function DonateButton() {
  return (
    <Button
      asChild
      variant="outline"
      aria-label="Support my work"
      className={cn(
        "h-14 rounded-full shadow-lg border-2 border-green-500/20 bg-green-400 hover:bg-green-400/90 text-green-900 w-full justify-start px-4",
        "flex items-center gap-3"
      )}
    >
      <Link href="https://buymeacoffee.com/hellohemant" target="_blank">
        <Heart className="h-6 w-6" />
        <span className="font-medium">Support my work</span>
      </Link>
    </Button>
  );
}
