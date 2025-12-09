
"use client";

import { useState, useMemo } from "react";
import { Check, MessageSquare, Lightbulb, Ban, Coffee, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";


type Vote = {
  player: string;
  vote: string;
  comment?: string;
  avatarUrl: string;
};

type VotingResultsProps = {
  storyTitle: string;
  votes: Vote[];
  sizingOptions: string[];
  isHost?: boolean;
  onNextStory?: (finalSize: string) => void;
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const PRO_TIPS = [
    {
        title: "Discuss Outliers",
        description: "If there are high and low votes, ask those players to explain their reasoning. It's a great way to uncover hidden assumptions."
    },
    {
        title: "Focus on Relative Sizing",
        description: "Try not to think in terms of hours or days. Compare the current story to a story that the team has already sized and completed."
    },
    {
        title: "Use Comments",
        description: "A quick comment with your vote can add valuable context and speed up the discussion phase."
    },
    {
        title: "It's a Conversation",
        description: "The goal of sizing isn't just to get a number, but to reach a shared understanding of the work involved."
    }
];

export default function VotingResults({ storyTitle, votes, sizingOptions, isHost, onNextStory }: VotingResultsProps) {
  const cardClassName = "bg-card/80 backdrop-blur-sm";

  const [finalSize, setFinalSize] = useState<string>('');

  const chartData = useMemo(() => {
    const groupedVotes = votes.reduce((acc, vote) => {
      const voteValue = vote.vote || '';
      if (!acc[voteValue]) {
        acc[voteValue] = {
          count: 0,
          players: [],
        };
      }
      acc[voteValue].count++;
      acc[voteValue].players.push(vote.player);
      return acc;
    }, {} as Record<string, { count: number; players: string[] }>);

    return Object.entries(groupedVotes)
      .map(([name, data], index) => ({
        name,
        value: data.count,
        players: data.players,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.name);
        const bNum = parseInt(b.name);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        if (a.name === '') return 1;
        if (b.name === '') return -1;
        if (a.name === '?') return 1;
        if (b.name === '?') return -1;
        if (a.name === 'Coffee') return 1;
        if (b.name === 'Coffee') return -1;
        return a.name.localeCompare(b.name);
      });
  }, [votes]);

  const comments = useMemo(() => {
    return votes.filter(v => v.comment && v.comment.trim() !== "");
  }, [votes]);
  
  const handleSubmitFinalSize = () => {
      if (finalSize && onNextStory) {
          onNextStory(finalSize);
      }
  }

  const maxVotes = useMemo(() => Math.max(...chartData.map(d => d.value), 0), [chartData]);


  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
            <p className="text-sm text-muted-foreground">Story</p>
            <h2 className="text-2xl font-bold font-headline">{storyTitle}</h2>
        </div>
      </div>

       <Card className={cn(cardClassName)}>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center"><BarChart className="mr-2 h-4 w-4" />Vote Cloud</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-2 pt-0 space-y-2">
          <div className="flex items-center justify-center flex-wrap gap-4 min-h-[120px]">
            {chartData.map((item) => {
              const scale = maxVotes > 0 ? 0.6 + (item.value / maxVotes) * 0.9 : 1;
              const renderContent = () => {
                if(item.name === '') return <Ban className="w-full h-full text-destructive" />;
                if(item.name === 'Coffee') return <Coffee className="w-full h-full" />;
                return item.name;
              }
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center group"
                >
                   <div
                    className={cn(
                      "aspect-[3/4] flex items-center justify-center rounded-lg border-2 transition-all duration-300 relative p-2"
                    )}
                    style={{
                        width: `${scale * 5}rem`,
                        height: `${scale * 6.66}rem`,
                        backgroundColor: `hsla(var(--${item.fill.slice(4, -1).replace(/ /g, ', ').split(',')[0]}), 80%, 55%, 0.1)`,
                        borderColor: `${item.fill}`
                    }}
                  >
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center border-4 border-background"
                         style={{ 
                            transform: `scale(${scale > 0.8 ? 1 : 0.8})`,
                            backgroundColor: item.fill,
                        }}
                    >
                        {item.value}
                    </div>
                    <span
                      className="font-bold"
                      style={{ fontSize: `${scale * 1.5}rem`}}
                    >
                      {renderContent()}
                    </span>
                  </div>
                  <div className="text-center text-xs mt-1 transition-opacity opacity-0 group-hover:opacity-100">
                    <p className="font-bold">{item.value} vote{item.value > 1 ? 's' : ''}</p>
                    <p className="text-muted-foreground max-w-[100px] truncate">{item.players.join(', ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-0 pb-[10px]">
              {chartData.map((item, index) => {
                const renderBadgeContent = () => {
                  if(item.name === '') return <Ban className="w-4 h-4 text-primary-foreground" />;
                  if(item.name === 'Coffee') return <Coffee className="h-5 w-5 text-primary-foreground" />;
                  return item.name;
                }
                return (
                  <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="font-bold text-base h-8 w-8 flex-shrink-0 items-center justify-center" style={{ backgroundColor: item.fill, color: 'hsl(var(--primary-foreground))' }}>{renderBadgeContent()}</Badge>
                      <div className="flex-1">
                          <p className="font-semibold">{item.players.join(', ')}</p>
                      </div>
                  </div>
                )
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-4">
        {isHost && (
          <Card className={cn(cardClassName)}>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2"><Check className="text-primary"/>Final Story Size</CardTitle>
              <CardDescription>Submit a final size before you can create a new story to vote on.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                 <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {[...sizingOptions, "NA"].map((option) => (
                            <button
                              key={option}
                              onClick={() => setFinalSize(option)}
                              className={cn(
                                "h-10 w-10 flex items-center justify-center text-sm font-bold rounded-full border-2 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary/50",
                                finalSize === option
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                  : "bg-card hover:bg-muted border-dashed",
                              )}
                            >
                              {option === 'Coffee' ? <Coffee className="h-5 w-5" /> : option}
                            </button>
                        ))}
                    </div>
                     <Button 
                        onClick={handleSubmitFinalSize}
                        disabled={!finalSize}
                        className="bg-primary/90 text-primary-foreground hover:bg-primary"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Submit Final Size
                    </Button>
                </div>
            </CardContent>
          </Card>
        )}

        {comments.length > 0 ? (
          <Card className={cn(cardClassName)}>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center text-base"><MessageSquare className="mr-2" />Comments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className={cn("px-4", isHost ? "h-[300px]" : "h-full")}>
                <div className="space-y-4 py-4">
                  {comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 border bg-muted">
                        <AvatarImage src={c.avatarUrl} className="object-cover" />
                        <AvatarFallback>{getInitials(c.player || '')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 p-3 rounded-lg bg-muted">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{c.player}</p>
                           <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center font-bold text-lg text-primary">
                            {c.vote === 'Coffee' ? <Coffee className="h-5 w-5" /> : c.vote}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card className={cn("flex flex-col items-center justify-center p-4 min-h-[150px]", cardClassName)}>
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No comments were left.</p>
          </Card>
        )}
      </div>

       <Card className={cn(cardClassName)}>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 p-6">
          <div className="md:col-span-1 flex flex-col items-center justify-center">
               <CardTitle className="text-base flex flex-col items-center gap-2 mb-2"><Lightbulb className="w-12 h-12 text-yellow-400" />Pro Tips</CardTitle>
          </div>
          <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {PRO_TIPS.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                               <Check className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                              <p className="font-semibold">{tip.title}</p>
                              <p className="text-sm text-muted-foreground">{tip.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
