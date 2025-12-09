
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/icons";
import { ModeToggle } from "@/components/mode-toggle";
import { Users, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth, useFirebase, useUser, initiateAnonymousSignIn } from "@/firebase";
import { doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import EntryDialog from "@/components/EntryDialog";
import { generateRoomId } from "@/lib/utils";

const SIZING_METHODS: Record<string, string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "20", "?", "Coffee"],
  "t-shirt": ["XS", "S", "M", "L", "XL", "?", "Coffee"],
};

export default function Home() {
  const [dialogAction, setDialogAction] = useState<"create" | "join" | null>(null);
  
  const router = useRouter();
  const { firestore } = useFirebase();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Sign in anonymously
  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleCreateRoom = async (name: string, avatarUrl: string, sizingMethod: string, customSizing: string) => {
    if (!name.trim() || !user || !firestore) return;

    localStorage.setItem("pokerUserName", name.trim());
    localStorage.setItem("pokerUserAvatar", avatarUrl);

    let options = SIZING_METHODS[sizingMethod];
    if (sizingMethod === 'custom') {
      options = customSizing.split(',').map(s => s.trim()).filter(Boolean);
    }

    const newRoomId = generateRoomId();
    const newRoomRef = doc(firestore, "rooms", newRoomId);

    const roomData = {
      name: `${name}'s Room`,
      hostId: user.uid,
      sizingOptions: options,
      isRevealed: false,
      currentStory: { title: "" },
      createdAt: serverTimestamp(),
      allowPlayerInvites: true, // Default to allowing invites
    };
    
    try {
        // Check if room ID already exists
        const docSnap = await getDoc(newRoomRef);
        if (docSnap.exists()) {
            // In a real-world app, you might want to retry with a new ID
            console.error("Generated Room ID already exists. Please try again.");
            // You could show a toast to the user here.
            return;
        }

        await setDoc(newRoomRef, roomData);
        
        // Add host as a player
        const playerRef = doc(firestore, `rooms/${newRoomRef.id}/players/${user.uid}`);
        await setDoc(playerRef, {
            name: name,
            avatarUrl: avatarUrl,
            isHost: true,
            voted: false
        }, { merge: true });

        router.push(`/room/${newRoomRef.id}`);
        
    } catch(error) {
        console.error("Error creating room: ", error);
    }
  };

  const handleJoinRoom = async (name: string, avatarUrl: string, roomId: string) => {
    if (!name.trim() || !roomId.trim() || !user || !firestore) return;
    
    localStorage.setItem("pokerUserName", name.trim());
    localStorage.setItem("pokerUserAvatar", avatarUrl);
    
    try {
      const roomRef = doc(firestore, 'rooms', roomId.trim());
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        console.error("Room does not exist!");
        // Optionally, show a toast to the user
        return;
      }
      
      // The user is not the host in this case
      const playerRef = doc(firestore, `rooms/${roomId.trim()}/players/${user.uid}`);
      await setDoc(playerRef, {
        name: name,
        avatarUrl: avatarUrl,
        isHost: false, 
        voted: false
      }, { merge: true });
      
      router.push(`/room/${roomId.trim()}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Logo className="w-10 h-10" />
            <h1 className="text-2xl font-bold tracking-tight font-headline">
              SizeWise Poker
            </h1>
          </div>
          <ModeToggle />
        </header>

        <main className="flex-1 flex flex-col items-center justify-start pt-16 p-4 sm:p-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight font-headline mt-16">Welcome to SizeWise Poker</h2>
                <p className="text-lg text-muted-foreground mt-2">The collaborative story sizing tool for agile teams.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <Card 
                    className={cn(
                        "p-8 text-center flex flex-col items-center justify-center cursor-pointer",
                        "hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1"
                    )}
                    onClick={() => setDialogAction("create")}
                >
                    <PlusCircle className="w-16 h-16 text-primary mb-4"/>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Create a Room</CardTitle>
                        <CardDescription className="text-base">
                        Start a new session and invite your team to start sizing stories.
                        </CardDescription>
                    </CardHeader>
                </Card>
                 <Card 
                    className={cn(
                        "p-8 text-center flex flex-col items-center justify-center cursor-pointer",
                        "hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1"
                    )}
                    onClick={() => setDialogAction("join")}
                >
                    <Users className="w-16 h-16 text-primary mb-4"/>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Join a Room</CardTitle>
                        <CardDescription className="text-base">
                        Enter an existing room using a Room ID to participate.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </main>

        <footer className="p-4 text-center text-sm text-muted-foreground border-t">
          <p>&copy; {new Date().getFullYear()} SizeWise Poker. All rights reserved.</p>
        </footer>
      </div>
      
      {dialogAction && (
         <EntryDialog
            open={!!dialogAction}
            onOpenChange={(isOpen) => !isOpen && setDialogAction(null)}
            action={dialogAction}
            onCreate={handleCreateRoom}
            onJoin={handleJoinRoom}
            isFirebaseLoading={isUserLoading || !firestore}
        />
      )}
    </>
  );
}
