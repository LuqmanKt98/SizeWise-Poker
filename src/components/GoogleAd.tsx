
"use client";

import { Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { cn } from "@/lib/utils";

type GoogleAdProps = {
    type: 'native' | 'rewarded';
    className?: string;
}

export default function GoogleAd({ type, className }: GoogleAdProps) {
  
  if (type === 'native') {
    return (
      <Card className={cn("bg-muted/50 border-dashed animate-in fade-in-50", className)}>
        <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 bg-background rounded-lg">
                <Newspaper className="w-6 h-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-base font-semibold">Placeholder for Native Ad</CardTitle>
                <CardDescription className="text-xs">This ad will blend in with your content.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <div className="h-24 bg-background rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Your Google Ad will appear here.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'rewarded') {
    return (
         <div className={cn("w-full h-full bg-background rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center p-8", className)}>
            <Newspaper className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-2xl font-bold">Placeholder for Rewarded Ad</h3>
            <p className="text-muted-foreground mt-2">A full-screen video or interactive ad will be shown here. <br/> You can replace this with your Google Ad code.</p>
        </div>
    )
  }

  return null;
}
