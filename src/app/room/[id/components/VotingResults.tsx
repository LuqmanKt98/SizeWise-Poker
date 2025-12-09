
"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart, Check } from "lucide-react";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Cell,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";


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

// Sample data for demonstration purposes
const sampleVotes: Vote[] = [
    { player: "David", vote: "8", avatarUrl: "https://images.unsplash.com/photo-1649135527406-f1cabde17570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxrb2FsYSUyMERKfGVufDB8fHx8MTc2NDc4NDMyMXww&ixlib=rb-4.1.0&q=80&w=1080" },
    { player: "Eva", vote: "5", avatarUrl: "https://images.unsplash.com/photo-1595495745866-982640a7d46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxmb3glMjB3aXphcmR8ZW58MHx8fHwxNzY0Nzg0MzIyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { player: "Frank", vote: "13", avatarUrl: "https://images.unsplash.com/photo-1640455686335-9b546193b8d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bGlvbiUyMGtuaWdodHxlbnwwfHx8fDE3NjQ3ODQzMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { player: "Grace", vote: "8", avatarUrl: "https://images.unsplash.com/photo-1729523105106-60277cac975a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxwZW5ndWluJTIwcGlyYXRlfGVufDB8fHx8MTc2NDc4NDMyMnww&ixlib=rb-4.1.0&q=80&w=1080" },
    { player: "Heidi", vote: "5", avatarUrl: "https://images.unsplash.com/photo-1742909622626-33047bd667ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzbG90aCUyMHNjaWVudGlzdHxlbnwwfHx8fDE3NjQ3ODQzMjN8MA&ixlib=rb-4.1.0&q=80&w=1080" },
];

export default function VotingResults({ storyTitle, votes, sizingOptions, isHost, onNextStory }: VotingResultsProps) {
  const cardClassName = "bg-card/80 backdrop-blur-sm";

  const [finalSize, setFinalSize] = useState<string>('');

  const allVotes = useMemo(() => [...votes, ...sampleVotes], [votes]);

  const chartData = useMemo(() => {
    const groupedVotes = allVotes.reduce((acc, vote) => {
      const voteValue = vote.vote || '⏳';
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
        if (a.name === '⏳') return 1;
        if (b.name === '⏳') return -1;
        if (a.name === '?') return 1;
        if (b.name === '?') return -1;
        if (a.name === '☕') return 1;
        if (b.name === '☕') return -1;
        return a.name.localeCompare(b.name);
      });
  }, [allVotes]);

  const average = useMemo(() => {
    const numericVotes = allVotes
      .map(v => parseInt(v.vote, 10))
      .filter(v => !isNaN(v));
    if (numericVotes.length === 0) return "N/A";
    const sum = numericVotes.reduce((acc, v) => acc + v, 0);
    return (sum / numericVotes.length).toFixed(1);
  }, [allVotes]);

  const comments = useMemo(() => {
    return allVotes.filter(v => v.comment && v.comment.trim() !== "");
  }, [allVotes]);
  
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
          <CardTitle className="text-base">Vote Cloud</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-center flex-wrap gap-4 min-h-[120px]">
            {chartData.map((item) => {
              const scale = maxVotes > 0 ? 0.6 + (item.value / maxVotes) * 0.9 : 1;
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center group"
                >
                   <div
                    className={cn(
                      "aspect-[3/4] flex items-center justify-center rounded-lg border-2 border-dashed bg-card/80 transition-all duration-300"
                    )}
                    style={{
                        width: `${scale * 5}rem`,
                        height: `${scale * 6.66}rem`,
                    }}
                  >
                    <span
                      className="font-bold"
                      style={{ fontSize: `${scale * 1.5}rem`}}
                    >
                      {item.name}
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={cn(cardClassName)}>
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle className="flex items-center text-base"><BarChart className="mr-2" />Vote Distribution</CardTitle>
            <Badge variant="secondary" className="text-base">
              Avg: {average}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border) / 0.5)',
                    borderRadius: 'var(--radius)',
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2">
                          <p className="font-bold">{data.name} ({data.value} votes)</p>
                          <p className="text-sm text-muted-foreground">{data.players.join(", ")}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" name="Votes" radius={[4, 4, 0, 0]}>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="font-bold text-base h-8 w-8 flex-shrink-0 items-center justify-center" style={{ backgroundColor: item.fill, color: 'hsl(var(--primary-foreground))' }}>{item.name}</Badge>
                        <div className="flex-1">
                            <p className="font-semibold">{item.players.join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        {comments.length > 0 ? (
          <Card className={cardClassName}>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center text-base"><MessageSquare className="mr-2" />Comments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] px-4">
                <div className="space-y-4 py-4">
                  {comments.map((c, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 border bg-muted">
                        <AvatarImage src={c.avatarUrl} className="object-cover" />
                        <AvatarFallback>{c.player?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 p-3 rounded-lg bg-muted">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{c.player}</p>
                          <p className="font-bold text-primary text-lg">{c.vote}</p>
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
          <Card className={cn("flex flex-col items-center justify-center p-4 h-full", cardClassName)}>
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No comments were left.</p>
          </Card>
        )}

        {isHost && (
          <Card className={cn(cardClassName, "md:col-span-2")}>
            <CardHeader className="p-4">
               <CardTitle className="text-base">Final Story Size</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex flex-col md:flex-row items-center justify-start gap-4">
              <Tabs value={finalSize} onValueChange={setFinalSize} className="w-auto">
                  <TabsList className="h-auto bg-transparent p-0 flex flex-wrap gap-2">
                  {[...sizingOptions, "Not decided"].map(option => (
                      <TabsTrigger 
                      key={option} 
                      value={option}
                      className="data-[state=active]:shadow-md data-[state=active]:ring-2 data-[state=active]:ring-ring data-[state=active]:ring-offset-2 border border-input h-9"
                      >
                          {option}
                      </TabsTrigger>
                  ))}
                  </TabsList>
              </Tabs>
              <Button onClick={handleSubmitFinalSize} disabled={!finalSize}>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Final Size
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
