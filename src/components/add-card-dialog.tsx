"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCardAction } from "@/actions/cards";
import { toast } from "sonner";

type AddCardDialogProps = {
  deckId: number;
  trigger?: React.ReactNode;
};

export function AddCardDialog({ deckId, trigger }: AddCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!front.trim() || !back.trim()) {
      toast.error("Please fill in both front and back of the card");
      return;
    }

    setIsLoading(true);

    try {
      await createCardAction({
        deckId,
        front: front.trim(),
        back: back.trim(),
      });

      toast.success("Card created successfully!");
      
      // Reset form and close dialog
      setFront("");
      setBack("");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create card"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Card</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
          <DialogDescription>
            Create a new flashcard for this deck. Add content for both front and
            back of the card.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                placeholder="Enter the question or prompt..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="back">Back</Label>
              <Textarea
                id="back"
                placeholder="Enter the answer or explanation..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={4}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
