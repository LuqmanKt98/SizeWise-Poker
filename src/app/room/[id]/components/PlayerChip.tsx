
"use client";

import { Crown, Ban, Coffee, Check } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type PlayerChipProps = {
  name: string;
  avatarUrl: string;
  hasVoted: boolean;
  vote?: string | null;
  isHost?: boolean;
  isRevealed?: boolean;
  hasCurrentStory?: boolean;
};

export default function PlayerChip({
  name,
  avatarUrl,
  hasVoted,
  vote,
  isHost = false,
  isRevealed = false,
  hasCurrentStory = false,
}: PlayerChipProps) {
  const getStatus = () => {
    if (isRevealed) {
      return null;
    }
    if (hasVoted) {
      return <p className="text-xs font-medium text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Voted</p>;
    }
    if (hasCurrentStory) {
        return <p className="text-xs text-muted-foreground">Waiting for vote</p>;
    }
    return <p className="text-xs text-muted-foreground">Waiting for story</p>;
  };

  const voteToDisplay = () => {
    if (!isRevealed) return null;
    if (vote === 'Coffee') return <Coffee className="h-5 w-5" />;
    if (!vote) return <Ban className="h-5 w-5 text-destructive" />;
    return vote;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg border transition-all",
        hasVoted && !isRevealed
          ? "bg-primary/10 border-primary/20"
          : "bg-card border-transparent",
        isHost && "bg-accent/10 border-accent/20"
      )}
    >
      <Avatar className={cn(
        "h-10 w-10 border-2 border-primary/20 bg-muted",
        isHost && "border-accent/80"
      )}>
        {avatarUrl ? <AvatarImage src={avatarUrl} className="object-cover" /> : null}
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate flex items-center gap-2">
            {name}
            {isHost && <Crown className="w-4 h-4 text-accent shrink-0" />}
          </p>
        </div>
        <div className="text-xs text-muted-foreground">{getStatus()}</div>
      </div>
      {isRevealed && (
        <div className="shrink-0">
          <Badge
            variant="secondary"
            className="font-bold text-base bg-background h-8 w-8 flex items-center justify-center"
          >
            {voteToDisplay()}
          </Badge>
        </div>
      )}
    </div>
  );
}
