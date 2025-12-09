
"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUserSafe, useFirebaseSafe } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const StarRating = ({
  rating,
  setRating,
  count = 5,
}: {
  rating: number;
  setRating: (rating: number) => void;
  count?: number;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(count)].map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            key={i}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-all duration-150 cursor-pointer"
            aria-label={`Rate ${starValue} out of ${count}`}
          >
            <Star
              className={cn(
                "w-8 h-8",
                starValue <= (hoverRating || rating)
                  ? "text-yellow-400 fill-yellow-400 scale-110"
                  : "text-muted-foreground/50",
                "hover:text-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};


export default function FeedbackDialog({
  open,
  onOpenChange,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firebase = useFirebaseSafe();
  const firestore = firebase?.firestore ?? null;
  const { user } = useUserSafe();

  const handleSubmit = async () => {
    if (rating === 0 || !firestore || !user) return;
    setIsSubmitting(true);

    try {
      const feedbackCollection = collection(firestore, 'feedback');
      await addDoc(feedbackCollection, {
        userId: user.uid,
        rating: rating,
        feedbackText: feedback,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        setTimeout(() => {
          setSubmitted(false);
          setFeedback("");
          setRating(0);
        }, 300);
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback: ", error);
      // Optionally, show an error toast to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center gap-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <DialogTitle>Thank you!</DialogTitle>
              <DialogDescription>Your feedback has been submitted.</DialogDescription>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center">
              <DialogTitle>Submit Feedback</DialogTitle>
              <DialogDescription>
                Thank you for helping us improve! Let us know how we did.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <p className="font-medium">Your Rating:</p>
                <StarRating rating={rating} setRating={setRating} />
              </div>
              <Textarea
                placeholder="Suggest a feature improvement or tell me about your experience"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
