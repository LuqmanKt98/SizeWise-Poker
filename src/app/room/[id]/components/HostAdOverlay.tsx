
"use client";

import { useState, useEffect } from "react";
import GoogleAd from "@/components/GoogleAd";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

type HostAdOverlayProps = {
  onFinished: () => void;
};

const COUNTDOWN_SECONDS = 10;

export default function HostAdOverlay({ onFinished }: HostAdOverlayProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onFinished();
    }
  }, [countdown, onFinished]);

  const progress = (countdown / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-start animate-in fade-in duration-500 p-4 gap-8 pt-16">
        <div className="w-full max-w-md text-center">
            <p className="text-muted-foreground text-sm mb-2">You will be able to create and size a new story in...</p>
            <Progress value={progress} className="h-1.5 mb-2" />
            <span className="text-2xl font-bold text-primary tabular-nums tracking-tighter">
                {countdown} {countdown === 1 ? 'second' : 'seconds'}
            </span>
        </div>

        <div className="w-full max-w-3xl h-auto">
            <GoogleAd type="rewarded" />
        </div>
    </div>
  );
}
