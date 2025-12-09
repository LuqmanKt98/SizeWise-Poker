
"use client";

import { Logo } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-6">
      <div className="relative w-48 h-64">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
                "absolute w-full h-full rounded-xl border-2 bg-card shadow-2xl transition-transform duration-500",
                "group-hover:rotate-0"
            )}
            style={{
              animation: `deal 2s ${i * 0.2}s infinite cubic-bezier(0.6, 0.05, 0.4, 0.95)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
                <Logo className="w-20 h-20 text-primary/50" />
            </div>
          </div>
        ))}
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold animate-pulse">Shuffling Cards...</h2>
        <p className="text-muted-foreground">Getting the room ready for you.</p>
      </div>

      <style jsx>{`
        @keyframes deal {
          0% {
            transform: translate(0, 0) rotate(0deg);
            z-index: 1;
          }
          25% {
            transform: translate(-50px, -20px) rotate(-10deg);
            z-index: 2;
          }
          50% {
            transform: translate(0px, 0) rotate(0deg);
            z-index: 3;
          }
          75% {
            transform: translate(50px, -20px) rotate(10deg);
            z-index: 2;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
}

    