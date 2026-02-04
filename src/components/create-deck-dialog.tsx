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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction } from "@/actions/decks";
import { toast } from "sonner";
import Link from "next/link";

type CreateDeckDialogProps = {
  trigger?: React.ReactNode;
  isLimitReached?: boolean;
  deckCount?: number;
};

export function CreateDeckDialog({ trigger, isLimitReached = false, deckCount = 0 }: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Deck name is required");
      return;
    }

    setIsLoading(true);

    try {
      await createDeckAction({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      toast.success("Deck created successfully!");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create deck"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If limit is reached, show upgrade prompt instead of opening dialog
  if (isLimitReached) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || <Button>Create New Deck</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Deck Limit Reached</DialogTitle>
            <DialogDescription>
              You've reached the free plan limit of 3 decks ({deckCount}/3 decks used).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro to unlock:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Unlimited flashcard decks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>AI-powered flashcard generation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span>Advanced study features</span>
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Link href="/pricing" className="w-full">
              <Button className="w-full">Upgrade to Pro</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create New Deck</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogDescription>
            Add a new flashcard deck to organize your learning materials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Title</Label>
              <Input
                id="name"
                placeholder="Enter deck title..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter deck description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={isLoading}
                maxLength={500}
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
              {isLoading ? "Creating..." : "Create Deck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
