
"use client";

import { Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EndingSession() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-6">
      <div className="relative">
        <div className="relative w-48 h-64 rounded-xl border-2 bg-card shadow-2xl flex items-center justify-center overflow-hidden">
          <Hand
            className="w-24 h-24 text-primary/80"
            style={{
              animation: `wave 2.5s infinite`,
              transformOrigin: 'bottom center',
            }}
          />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Ending Session...</h2>
        <p className="text-muted-foreground">The host has closed the room. Goodbye!</p>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 60%, 100% {
            transform: rotate(0deg);
          }
          10%, 30% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
