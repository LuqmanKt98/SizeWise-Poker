'use client';

import { useState, useMemo, useRef } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Clipboard } from 'lucide-react';

type Player = {
  name: string;
};

type Story = {
    title: string;
    finalSize: string;
    votes: { player: string; vote: string }[];
};

type RoomData = {
  players: Player[];
  history: Story[];
  currentStory: {
    title: string;
    votes: { player: string; vote: string }[];
  };
};

type SessionSummaryDialogProps = {
  roomData: RoomData;
};

export default function SessionSummaryDialog({ roomData }: SessionSummaryDialogProps) {
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    if (summaryRef.current) {
      navigator.clipboard.writeText(summaryRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fullHistory = useMemo(() => {
    const stories = [...roomData.history];
    if (roomData.currentStory.title) {
      stories.push({
        title: roomData.currentStory.title,
        finalSize: 'N/A',
        votes: roomData.currentStory.votes,
      });
    }
    return stories;
  }, [roomData.history, roomData.currentStory]);

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader className="text-center">
        <DialogTitle>Session Summary</DialogTitle>
        <DialogDescription>
          A complete overview of the SizeWise Poker session. Copy and share it with your team.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[60vh] pr-6">
        <div ref={summaryRef} className="space-y-6 text-sm text-left">
          <div>
            <h3 className="font-bold text-base mb-2">Participants ({roomData.players.length})</h3>
            <p>{roomData.players.map(p => p.name).join(', ')}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-bold text-base mb-2">Stories ({fullHistory.length})</h3>
            <div className="space-y-4">
              {fullHistory.map((story, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{story.title}</h4>
                    <p className="font-bold text-lg">Final Size: {story.finalSize}</p>
                  </div>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {story.votes.map((vote, vIndex) => (
                      <li key={vIndex}>
                        <span className="font-medium text-foreground">{vote.player}:</span> {vote.vote}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {fullHistory.length === 0 && (
                <p className="text-muted-foreground">No stories were sized in this session.</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="sm:justify-center">
        <Button onClick={handleCopy} className="w-full sm:w-auto">
          {copied ? <CheckCircle2 className="mr-2" /> : <Clipboard className="mr-2" />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </Button>
        <DialogClose asChild>
            <Button variant="outline">Close</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
