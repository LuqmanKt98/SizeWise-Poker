
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Copy,
  Plus,
  Eye,
  Users,
  CheckCircle2,
  Share2,
  Send,
  Link as LinkIcon,
  LogOut,
  Pencil,
  Crown,
  Sparkles,
  Settings,
  UserX,
  Zap,
  Rocket,
  UserCheck,
  UserPlus,
  UserMinus,
  Vote,
  Activity,
  AlertTriangle,
  Coffee,
} from "lucide-react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/icons";
import PlayerChip from "./PlayerChip";
import VotingResults from "./VotingResults";
import SessionSummaryDialog from "./SessionSummaryDialog";
import { cn, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AvatarPickerDialog from "@/components/AvatarPickerDialog";
import { useUserSafe, useDoc, useCollection, useFirebaseSafe, useMemoFirebase } from "@/firebase";
import { doc, collection, serverTimestamp, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import RoomSettingsDialog from "./RoomSettingsDialog";
import GoogleAd from "@/components/GoogleAd";
import HostAdOverlay from "./HostAdOverlay";
import Loader from './Loader';
import EndingSession from "./EndingSession";

// Firestore data types
type Player = {
  id: string;
  name: string;
  avatarUrl: string;
  voted: boolean;
  vote: string | null;
  comment?: string;
  isHost: boolean;
};

type Story = {
  id: string;
  title: string;
  finalSize: string;
  votes: { player: string; vote: string; comment?: string; avatarUrl: string }[];
};

type Room = {
  id: string;
  hostId: string;
  sizingOptions: string[];
  currentStory: { title: string, finalSize?: string };
  isRevealed: boolean;
  lastMessage?: string;
  allowPlayerInvites?: boolean;
};

// Type for storing final data before exit
type FinalRoomState = {
  players: Player[];
  history: Story[];
  currentStory: {
    title: string;
    votes: { player: string; vote: string; comment?: string; avatarUrl: string }[];
  };
};

export default function PokerRoom({ roomId }: { roomId: string }) {
  const firebase = useFirebaseSafe();
  const firestore = firebase?.firestore ?? null;
  const { user, isUserLoading } = useUserSafe();
  const router = useRouter();
  const { toast } = useToast();
  const previousIsRevealed = useRef<boolean | undefined>();
  const storyInputRef = useRef<HTMLTextAreaElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Memoize Firestore references
  const roomRef = useMemoFirebase(() => firestore ? doc(firestore, "rooms", roomId) : null, [firestore, roomId]);
  const playersRef = useMemoFirebase(() => firestore ? collection(firestore, "rooms", roomId, "players") : null, [firestore, roomId]);
  const storiesRef = useMemoFirebase(() => firestore ? collection(firestore, "rooms", roomId, "stories") : null, [firestore, roomId]);
  const currentUserRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, `rooms/${roomId}/players/${user.uid}`) : null, [firestore, roomId, user]);


  // Fetch real-time data from Firestore
  const { data: roomData, isLoading: isRoomLoading } = useDoc<Room>(roomRef);
  const { data: players, isLoading: arePlayersLoading } = useCollection<Player>(playersRef);
  const { data: history, isLoading: isHistoryLoading } = useCollection<Story>(storiesRef);

  const [votedValue, setVotedValue] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const [storyInput, setStoryInput] = useState("");
  const [roomUrl, setRoomUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [finalRoomState, setFinalRoomState] = useState<FinalRoomState | null>(null);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [showHostAd, setShowHostAd] = useState(false);
  const [showSubmitSizeAlert, setShowSubmitSizeAlert] = useState(false);


  const currentUserData = useMemo(() => players?.find(p => p.id === user?.uid), [players, user]);
  const isHost = useMemo(() => currentUserData?.isHost ?? false, [currentUserData]);
  const currentStory = roomData?.currentStory;

  const hostPlayer = useMemo(() => players?.find(p => p.isHost), [players]);
  const otherPlayers = useMemo(() => players?.filter(p => !p.isHost) ?? [], [players]);


  // --- Effects ---

  // Handle room URL generation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRoomUrl(`${window.location.origin}/room/${roomId}`);
    }
  }, [roomId]);

  // Handle session end for players
  useEffect(() => {
    if (!isRoomLoading && hasLoadedOnce && !roomData) {
      const votesForResults = players?.map(p => ({
        player: p.name,
        vote: p.vote || '',
        comment: p.comment,
        avatarUrl: p.avatarUrl
      })) ?? [];

      setFinalRoomState({
        players: players || [],
        history: history || [],
        currentStory: { title: currentStory?.title || '', votes: votesForResults },
      });
      setIsRoomClosed(true);
    }

    if (!isRoomLoading && !arePlayersLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [isRoomLoading, arePlayersLoading, roomData, hasLoadedOnce, players, history, currentStory?.title]);


  // Effect to handle state resets when moving to a new story
  useEffect(() => {
    // Only run if the revealed state has changed from true to false
    if (previousIsRevealed.current === true && roomData?.isRevealed === false) {
      // All players reset their local voting UI state
      setVotedValue(null);
      setComment("");

      // This part should ONLY be run by the host to reset votes in Firestore.
      if (isHost) {
        players?.forEach(p => {
          if (p.voted && firestore && p.id) {
            const playerDocRef = doc(firestore, `rooms/${roomId}/players/${p.id}`);
            updateDoc(playerDocRef, {
              voted: false,
              vote: null,
              comment: "",
            });
          }
        });
      }
    }
    // Update the ref for the next render
    previousIsRevealed.current = roomData?.isRevealed;
  }, [roomData?.isRevealed, isHost, firestore, players, roomId]);

  // Show global toast messages
  useEffect(() => {
    if (roomData?.lastMessage && roomRef) {
      toast({
        title: "Host Update",
        description: roomData.lastMessage,
      });
      // Each client is responsible for clearing the message for themselves
      // to prevent race conditions. The security rules allow this specific update.
      updateDoc(roomRef, { lastMessage: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.lastMessage, roomRef]);

  const hasSubmitted = useMemo(() => currentUserData?.voted ?? false, [currentUserData]);

  // Ensure user has profile info, and auto-open invite dialog for host
  useEffect(() => {
    if (user && !arePlayersLoading && currentUserData) {
      if (!currentUserData.name) {
        setIsAvatarPickerOpen(true);
      }

      // If the user is the host and they are the only player, open the invite dialog.
      if (isHost && players && players.length === 1) {
        const hasBeenOpened = sessionStorage.getItem(`invite-dialog-${roomId}`);
        if (!hasBeenOpened) {
          setIsInviteDialogOpen(true);
          sessionStorage.setItem(`invite-dialog-${roomId}`, 'true');
        }
      }
    }
  }, [user, arePlayersLoading, currentUserData, isHost, players, roomId]);

  // Autofocus story input when it appears
  useEffect(() => {
    if (isHost && !currentStory?.title && storyInputRef.current) {
      storyInputRef.current.focus();
    }
  }, [isHost, currentStory]);


  // --- Loading and Edge Case Renders ---

  const isLoading = isUserLoading || isRoomLoading || arePlayersLoading || !hasLoadedOnce;

  if (isExiting) {
    return <EndingSession />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (isRoomClosed && finalRoomState) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">The host has ended the session.</h2>
          <p className="text-muted-foreground mb-6">
            You can download the session summary or return home.
          </p>
          <div className="flex gap-4 justify-center">
            <Dialog open={openSummary} onOpenChange={setOpenSummary}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setOpenSummary(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Download Summary
                </Button>
              </DialogTrigger>
              <SessionSummaryDialog roomData={finalRoomState} />
            </Dialog>
            <Button asChild>
              <Link href="/">
                <LogOut className="mr-2 h-4 w-4" />
                Exit to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomData && hasLoadedOnce) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Room not found</h2>
          <p className="text-muted-foreground mb-4">
            The room you are trying to join does not exist or has been deleted.
          </p>
          <Button asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const {
    sizingOptions,
    isRevealed,
  } = roomData!;

  const playersVoted = players?.filter((p) => p.voted) ?? [];
  const playersWaiting = players?.filter((p) => !p.voted) ?? [];

  // --- Event Handlers ---

  const handleVote = (value: string) => {
    if (hasSubmitted) {
      toast({
        title: "Vote Already Cast",
        description: "You have already cast your vote for this story.",
      });
      return;
    }
    setVotedValue(value);
    commentInputRef.current?.focus();
  };

  const handleSubmitVote = () => {
    if (votedValue && currentUserRef) {
      updateDoc(currentUserRef, {
        voted: true,
        vote: votedValue,
        comment: comment,
      });
    }
  };

  const handleReveal = () => {
    if (roomRef) {
      updateDoc(roomRef, { isRevealed: true });
    }
  }

  const handleNextStory = (finalSize: string) => {
    if (!isHost || !roomRef || !currentStory?.title) return;

    // Immediately reset the room state for all players
    updateDoc(roomRef, {
      currentStory: { title: "" },
      isRevealed: false,
    });

    // Show the ad overlay to the host
    setShowHostAd(true);

    // Prepare the data for archiving in the background
    const storyToArchive = {
      title: currentStory.title,
      finalSize: finalSize,
      votes: players?.map(p => ({
        player: p.name,
        vote: p.vote || '',
        comment: p.comment || '',
        avatarUrl: p.avatarUrl
      })) ?? [],
      createdAt: serverTimestamp(),
    };

    // Define the function that will run after the ad finishes
    const proceedAfterAd = () => {
      if (!storiesRef) return;

      // 1. Archive the completed story
      addDoc(storiesRef, storyToArchive);

      // 2. Reset host's local state
      setStoryInput("");
      setShowHostAd(false);
    };

    // Make the function available globally for the overlay to call
    (window as any).proceedAfterAd = proceedAfterAd;
  };

  const handleCreateNewStoryClick = () => {
    if (isRevealed && !roomData?.currentStory?.finalSize) {
      setShowSubmitSizeAlert(true);
    } else {
      handleNextStory(roomData?.currentStory?.finalSize || "Not Sized");
    }
  };

  const handleStartVoting = () => {
    if (storyInput.trim().length >= 5 && roomRef) {
      const newStoryTitle = storyInput.trim();
      updateDoc(roomRef, {
        currentStory: { title: newStoryTitle },
        isRevealed: false
      });
      setStoryInput("");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleProfileSave = (newName: string, newAvatarUrl: string) => {
    if (currentUserRef) {
      const newNameTrimmed = newName.trim();
      if (newNameTrimmed) {
        updateDoc(currentUserRef, { name: newNameTrimmed });
        localStorage.setItem("pokerUserName", newNameTrimmed);
      }
      if (newAvatarUrl !== undefined) {
        updateDoc(currentUserRef, { avatarUrl: newAvatarUrl });
        localStorage.setItem("pokerUserAvatar", newAvatarUrl);
      }
    }
    setIsAvatarPickerOpen(false);
  };

  const handleHostExit = async () => {
    if (!roomRef || !isHost) return;

    setIsExiting(true);
    try {
      await deleteDoc(roomRef);
      router.push('/');
    } catch (error) {
      console.error("Error deleting room:", error);
      setIsExiting(false); // Reset on failure
    }
  };

  const handleInviteToggle = (checked: boolean) => {
    if (roomRef && isHost) {
      updateDoc(roomRef, { allowPlayerInvites: checked });
    }
  };

  const cardClassName = "bg-card/80 backdrop-blur-sm";

  const usedAvatars = players?.map(p => p.avatarUrl).filter(Boolean) ?? [];

  const votesForResults = players?.map(p => ({
    player: p.name,
    vote: p.vote || '',
    comment: p.comment,
    avatarUrl: p.avatarUrl
  })) ?? [];

  const hasCurrentStory = !!currentStory?.title;

  const canInvite = isHost || roomData?.allowPlayerInvites !== false;

  const handleRevealClick = () => {
    if (playersWaiting.length === 0) {
      handleReveal();
    }
    // If there are players waiting, the AlertDialog will be triggered by the button,
    // and the `onConfirm` of the dialog will call `handleReveal`.
  };

  const totalPlayers = players?.length ?? 0;
  const votedCount = playersVoted.length;
  const voteProgress = totalPlayers > 0 ? (votedCount / totalPlayers) * 100 : 0;


  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b shrink-0 h-20">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-bold tracking-tight font-headline">
              SizeWise Poker
            </h1>
            {canInvite && (
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-12">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Invite Players
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite Players</DialogTitle>
                    <DialogDescription>
                      Share the room ID or link to invite your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-6 py-4">
                    {isHost && (
                      <div className="flex items-center justify-between p-3 rounded-md bg-primary/10">
                        <Label htmlFor="allow-invites" className="pr-4">Allow players to invite others</Label>
                        <Switch
                          id="allow-invites"
                          checked={roomData?.allowPlayerInvites !== false}
                          onCheckedChange={handleInviteToggle}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Share Room ID</h4>
                        <p className="text-sm text-muted-foreground">
                          Join with the ID on the home page.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input value={roomId} readOnly className="h-9 font-mono tracking-widest bg-background" />
                        <Button onClick={handleCopyId} variant="secondary" size="sm" className="px-3">
                          <span className="sr-only">Copy ID</span>
                          {copiedId ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Share Room Link</h4>
                        <p className="text-sm text-muted-foreground">
                          Anyone with this link can also join.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input value={roomUrl} readOnly className="h-9 bg-background" />
                        <Button onClick={handleCopyLink} variant="secondary" size="sm" className="px-3">
                          <span className="sr-only">Copy Link</span>
                          {copiedLink ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" className="w-full">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Dialog open={openSummary} onOpenChange={setOpenSummary}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-12">
                      <Share2 className="mr-2 h-4 w-4" />
                      Session Summary
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Session Summary</p>
                </TooltipContent>
              </Tooltip>
              {currentStory && <SessionSummaryDialog roomData={{ players: players ?? [], history: history ?? [], currentStory: { title: currentStory.title, votes: votesForResults } }} />}
            </Dialog>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-12 justify-start px-3" onClick={() => setIsAvatarPickerOpen(true)}>
              <Avatar className="h-8 w-8">
                {currentUserData?.avatarUrl ? (
                  <AvatarImage src={currentUserData.avatarUrl} className="object-cover" />
                ) : null}
                <AvatarFallback>{getInitials(currentUserData?.name || '')}</AvatarFallback>
              </Avatar>
              <div className="ml-2 text-left">
                <p className="font-semibold leading-tight text-sm flex items-center gap-1.5">
                  {currentUserData?.name}
                  {isHost && <Crown className="w-3 h-3 text-accent" />}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isHost ? 'Host' : 'Player'}
                </p>
              </div>
              <Pencil className="w-4 h-4 ml-2 text-muted-foreground" />
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Settings />
                </Button>
              </DialogTrigger>
              <RoomSettingsDialog isHost={isHost} />
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive h-12">
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isHost
                      ? "This will end the session for all players and delete the room."
                      : "You can rejoin anytime from the home page."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  {isHost ? (
                    <AlertDialogAction onClick={handleHostExit}>End Session</AlertDialogAction>
                  ) : (
                    <AlertDialogAction asChild>
                      <Link href="/">Exit Room</Link>
                    </AlertDialogAction>
                  )}
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <div className="flex-1 grid md:grid-cols-[1fr_280px] overflow-hidden">
          <main className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex flex-col flex-1 p-4 md:p-6 pb-[160px]">
              {currentStory && currentStory.title ? (
                isRevealed ? (
                  <VotingResults
                    storyTitle={currentStory.title}
                    votes={votesForResults}
                    isHost={isHost}
                    onNextStory={handleNextStory}
                    sizingOptions={sizingOptions}
                  />
                ) : (
                  <div className="flex flex-col flex-1 items-center w-full max-w-4xl mx-auto">
                    <div className="w-full mb-4">
                      <div className="text-left w-full">
                        <h2 className="text-xl font-bold font-headline whitespace-pre-wrap">{currentStory.title}</h2>
                      </div>
                    </div>

                    <Card className={cn(cardClassName, "w-full")}>
                      <CardContent className="p-6">
                        {hasSubmitted ? (
                          <div className="flex flex-row items-center justify-center gap-2 text-center animate-in fade-in duration-500 p-4 mb-4 rounded-lg bg-primary/10 w-full">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            <p className="text-sm font-semibold text-primary">
                              Your vote is cast. Waiting for others to vote.
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground mb-4">Select a card to cast your vote.</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                          <div className="grid grid-cols-5 gap-2">
                            {sizingOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleVote(option)}
                                disabled={hasSubmitted}
                                className={cn(
                                  "transition-all duration-300",
                                  !hasSubmitted && "hover:-translate-y-1"
                                )}
                              >
                                <Card className={cn(
                                  "aspect-[3/4] flex items-center justify-center text-xl font-bold focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary/50",
                                  votedValue === option
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card border-dashed",
                                  !hasSubmitted && "hover:bg-primary/90 hover:text-primary-foreground",
                                  hasSubmitted ? "cursor-default" : "cursor-pointer"
                                )}>
                                  {option === 'Coffee' ? <Coffee className="h-8 w-8" /> : option}
                                </Card>
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col gap-2 h-full">
                            <Textarea
                              ref={commentInputRef}
                              id="comment"
                              placeholder="Explain your vote..."
                              disabled={!votedValue || hasSubmitted}
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className={cn("transition-all duration-300 bg-background flex-1", votedValue ? 'focus-visible:ring-primary' : '')}
                            />
                            <Button onClick={handleSubmitVote} variant="outline" disabled={!votedValue || hasSubmitted}>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Vote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              ) : (
                <div className="flex flex-col flex-1 items-center text-center pt-8">
                  <div className="w-full max-w-md mx-auto px-8 pb-8 pt-4">
                    <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto mb-6 text-primary opacity-20">
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <path d="M 10,90 Q 50,10 90,90 T 170,90" stroke="url(#grad1)" fill="transparent" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 20,80 Q 50,30 80,80 T 140,80" stroke="url(#grad1)" fill="transparent" strokeWidth="2" strokeDasharray="5" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="5" fill="hsl(var(--primary))" />
                      <circle cx="90" cy="50" r="3" fill="hsl(var(--accent))" opacity="0.6" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2">Ready for the next story!</h2>
                    {isHost ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground mb-2">Add a new story to start voting.</p>
                        <Textarea
                          id="story-title"
                          ref={storyInputRef}
                          placeholder="e.g. As a user, I want to be able to filter search results by category so that I can find relevant items more easily."
                          value={storyInput}
                          onChange={(e) => setStoryInput(e.target.value)}
                          className="bg-background"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-left">
                          Minimum 5 characters required.
                        </p>
                        <Button onClick={handleStartVoting} disabled={storyInput.trim().length < 5} className="w-full">
                          <Plus size={16} className="mr-2" /> Start
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">The host will add a story to start voting.</p>
                        <GoogleAd type="native" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>

          <aside className="border-l bg-muted/30 p-4 flex flex-col gap-6 overflow-y-auto">
            {hasCurrentStory && (
              <div className="flex flex-col gap-4">
                <h2 className="font-bold text-lg flex items-center">
                  <Vote className="mr-2 h-5 w-5" />
                  Voting Status
                </h2>
                <div
                  className="relative h-20 w-20 shrink-0 rounded-full mx-auto"
                  style={{
                    // @ts-ignore
                    "--progress": `${voteProgress}%`,
                    background: `
                            radial-gradient(hsl(var(--card)) 65%, transparent 66%),
                            conic-gradient(hsl(var(--primary)) calc(var(--progress)), hsl(var(--muted)) 0deg)
                        `
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {votedCount}/{totalPlayers}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-center text-muted-foreground">Players Voted</p>

                {isHost && (
                  <div className="flex items-center gap-4">
                    {!isRevealed ? (
                      playersWaiting.length > 0 ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="w-full">
                              <Eye className="mr-2 h-4 w-4" />
                              Reveal Votes
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-4">
                                <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                              </div>
                              <AlertDialogTitle className="text-center">{playersWaiting.length} player(s) have not voted yet.</AlertDialogTitle>
                              <AlertDialogDescription className="text-center">
                                Are you sure you want to proceed? Their votes won't be counted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="flex flex-wrap items-center justify-center gap-4">
                                {playersWaiting.map((player) => (
                                  <div key={player.id} className="flex flex-col items-center gap-1">
                                    <Avatar>
                                      <AvatarImage src={player.avatarUrl} className="object-cover" />
                                      <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-xs text-muted-foreground">{player.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <AlertDialogFooter className="sm:justify-center pt-4">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleReveal}>
                                Reveal Anyway
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button onClick={handleRevealClick} className="w-full">
                          <Eye className="mr-2 h-4 w-4" />
                          Reveal Votes
                        </Button>
                      )
                    ) : (
                      <Button onClick={handleCreateNewStoryClick} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Story
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
            {hostPlayer && (
              <div>
                <h2 className="font-bold text-lg flex items-center mb-2">
                  <Crown className="mr-2 h-5 w-5 text-accent" />
                  Host
                </h2>
                <PlayerChip
                  key={hostPlayer.id}
                  name={hostPlayer.name}
                  avatarUrl={hostPlayer.avatarUrl}
                  hasVoted={hostPlayer.voted}
                  vote={hostPlayer.vote}
                  isHost={hostPlayer.isHost}
                  isRevealed={isRevealed}
                  hasCurrentStory={hasCurrentStory}
                />
              </div>
            )}


            <div>
              <h2 className="font-bold text-lg flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                Players
                <Badge variant="secondary">{otherPlayers.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {otherPlayers.map((player) => (
                  <PlayerChip
                    key={player.id}
                    name={player.name}
                    avatarUrl={player.avatarUrl}
                    hasVoted={player.voted}
                    vote={player.vote}
                    isHost={player.isHost}
                    isRevealed={isRevealed}
                    hasCurrentStory={hasCurrentStory}
                  />
                ))}
                {otherPlayers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Waiting for players to join...</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {currentUserData && <AvatarPickerDialog
        open={isAvatarPickerOpen}
        onOpenChange={setIsAvatarPickerOpen}
        onSave={handleProfileSave}
        currentAvatarUrl={currentUserData?.avatarUrl || ''}
        currentName={currentUserData?.name || ''}
        usedAvatars={usedAvatars}
      />}
      {isHost && showHostAd && <HostAdOverlay onFinished={() => (window as any).proceedAfterAd()} />}

      <AlertDialog open={showSubmitSizeAlert} onOpenChange={setShowSubmitSizeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <AlertDialogTitle className="text-center">Final Size Not Submitted</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You have not submitted a final size for the current story. Proceeding will archive this story as "Not Sized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center pt-4">
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleNextStory("Not Sized")}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
