"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCardsWithAIAction } from "@/actions/cards";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type GenerateAICardsButtonProps = {
  deckId: number;
  hasAIGeneration: boolean;
  deckName: string | null;
  deckDescription: string | null;
};

export function GenerateAICardsButton({
  deckId,
  hasAIGeneration,
  deckName,
  deckDescription,
}: GenerateAICardsButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const hasTitleAndDescription = 
    deckName && 
    deckName.trim() !== "" && 
    deckDescription && 
    deckDescription.trim() !== "";

  async function handleGenerate() {
    if (!hasAIGeneration || !hasTitleAndDescription) {
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateCardsWithAIAction({ deckId });

      if (result.success) {
        toast.success(`Successfully generated ${result.cards.length} cards with AI!`);
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate cards"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (!hasAIGeneration) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                disabled
                className="gap-2 opacity-60 cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                Generate Cards With AI
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>This is a paid feature.</p>
            <p className="font-semibold">Subscribe to Pro plan to unlock AI generation.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!hasTitleAndDescription) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                disabled
                className="gap-2 opacity-60 cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Generate Cards With AI
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-semibold">Title and description required</p>
            <p>Please add both a title and description to your deck to use AI generation.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate Cards With AI
        </>
      )}
    </Button>
  );
}
