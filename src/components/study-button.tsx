"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type StudyButtonProps = {
  deckId: number;
  cardCount: number;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
};

export function StudyButton({
  deckId,
  cardCount,
  size = "default",
  className = "",
  children = (
    <>
      <span className="mr-2">📚</span>
      Start Study Session
    </>
  ),
}: StudyButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (cardCount === 0) {
      toast.error("Please add at least one card before starting a study session");
      return;
    }

    router.push(`/dashboard/decks/${deckId}/study`);
  };

  return (
    <Button
      size={size}
      className={`${className} ${cardCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleClick}
      aria-disabled={cardCount === 0}
    >
      {children}
    </Button>
  );
}
