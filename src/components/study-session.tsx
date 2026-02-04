"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

type CardType = {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
};

type StudySessionProps = {
  deckId: number;
  deckName: string;
  cards: CardType[];
};

export function StudySession({ deckId, deckName, cards }: StudySessionProps) {
  const [isShuffled, setIsShuffled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set()); // Track cards whose back has been seen
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextCardIndex, setNextCardIndex] = useState<number | null>(null);

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize the card order based on shuffle state
  const displayCards = useMemo(() => {
    return isShuffled ? shuffleArray(cards) : cards;
  }, [isShuffled, cards]);

  const currentCard = displayCards[currentIndex];
  const progress = (completedCards.size / displayCards.length) * 100;
  const isLastCard = currentIndex === displayCards.length - 1;
  const isFirstCard = currentIndex === 0;
  const hasViewedCurrentCard = viewedCards.has(currentCard.id);

  const handleFlip = () => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
    
    // If flipping to back side, mark this card as viewed
    if (newFlipState) {
      setViewedCards((prev) => new Set(prev).add(currentCard.id));
    }
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
    setViewedCards(new Set());
  };

  const handleNext = () => {
    if (isLastCard || isTransitioning) return;
    
    // Reset flip state immediately so next card shows front
    setIsFlipped(false);
    // Set the next card index and trigger slide animation
    setNextCardIndex(currentIndex + 1);
    setIsTransitioning(true);
    
    // Small delay to ensure state is set before animation starts
    requestAnimationFrame(() => {
      setSlideDirection("left");
    });
    
    // Wait for animation to complete before changing card
    setTimeout(() => {
      // Mark current card as completed
      setCompletedCards((prev) => new Set(prev).add(currentCard.id));
      // Reset animation state first
      setSlideDirection(null);
      // Then update the index
      setCurrentIndex(currentIndex + 1);
      setIsTransitioning(false);
      setNextCardIndex(null);
    }, 350);
  };

  const handlePrevious = () => {
    if (isFirstCard || isTransitioning) return;
    
    // Reset flip state immediately so next card shows front
    setIsFlipped(false);
    // Set the previous card index and trigger slide animation
    setNextCardIndex(currentIndex - 1);
    setIsTransitioning(true);
    
    // Small delay to ensure state is set before animation starts
    requestAnimationFrame(() => {
      setSlideDirection("right");
    });
    
    // Wait for animation to complete before changing card
    setTimeout(() => {
      // Reset animation state first
      setSlideDirection(null);
      // Then update the index
      setCurrentIndex(currentIndex - 1);
      setIsTransitioning(false);
      setNextCardIndex(null);
    }, 350);
  };

  const handleFinish = () => {
    // Mark the last card as completed
    setCompletedCards((prev) => new Set(prev).add(currentCard.id));
  };

  const isSessionComplete = completedCards.size === displayCards.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if session is complete or transitioning
      if (isSessionComplete || isTransitioning) return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
          // Next card (only if current card has been viewed)
          if (!isLastCard && hasViewedCurrentCard) {
            event.preventDefault();
            handleNext();
          }
          break;

        case "ArrowLeft":
          // Previous card
          if (!isFirstCard) {
            event.preventDefault();
            handlePrevious();
          }
          break;

        case "ArrowUp":
        case "ArrowDown":
        case " ": // Space bar
          // Flip card
          event.preventDefault();
          handleFlip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isSessionComplete,
    isTransitioning,
    isLastCard,
    isFirstCard,
    hasViewedCurrentCard,
    handleNext,
    handlePrevious,
    handleFlip,
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/dashboard/decks/${deckId}`}>
            <Button variant="outline">← Back to Deck</Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
            >
              {isShuffled ? "🔄 Unshuffle" : "🔀 Shuffle"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {displayCards.length}
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">{deckName}</h1>
        <p className="text-muted-foreground mb-4">
          Study Mode {isShuffled && <span className="text-xs">• Shuffled</span>}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-right">
            {completedCards.size} / {displayCards.length} cards completed
          </p>
        </div>
      </div>

      {/* Session Complete State */}
      {isSessionComplete ? (
        <Card className="bg-gradient-to-br from-background to-muted/20 animate-in fade-in duration-500">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 text-6xl animate-in zoom-in duration-700">🎉</div>
            <h2 className="text-3xl font-bold mb-4 animate-in slide-in-from-bottom duration-500">
              Session Complete!
            </h2>
            <p className="text-muted-foreground text-lg mb-8 animate-in slide-in-from-bottom duration-500 delay-100">
              You&apos;ve studied all {displayCards.length} cards in this deck.
            </p>
            <div className="flex flex-col gap-3 items-center animate-in slide-in-from-bottom duration-500 delay-200">
              <Button
                size="lg"
                className="w-64"
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setCompletedCards(new Set());
                  setViewedCards(new Set());
                }}
              >
                Start Over
              </Button>
              <Link href={`/dashboard/decks/${deckId}`} className="w-64">
                <Button variant="outline" size="lg" className="w-full">
                  View Current Deck
                </Button>
              </Link>
              <Link href="/dashboard" className="w-64">
                <Button variant="outline" size="lg" className="w-full">
                  View All Decks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Flashcard */}
          <div className="mb-8 relative overflow-hidden" style={{ perspective: "1000px", minHeight: "400px" }}>
            {/* Current Card - Exits during transition, static when not transitioning */}
            <div
              className={`relative ${
                isTransitioning && slideDirection
                  ? 'transition-all duration-300 ease-in-out'
                  : ''
              } ${
                isTransitioning && slideDirection === "left"
                  ? "-translate-x-full opacity-0"
                  : isTransitioning && slideDirection === "right"
                  ? "translate-x-full opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div
                className="relative min-h-[400px] transition-all duration-500 ease-in-out cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
                onClick={handleFlip}
              >
                {/* Front Face */}
                <Card
                  className="absolute inset-0 hover:shadow-lg min-h-[400px] flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <CardContent className="pt-12 pb-12 px-8 text-center w-full">
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Front
                      </span>
                    </div>
                    <div className="text-2xl font-medium leading-relaxed">
                      {currentCard.front}
                    </div>
                    <div className="mt-8 text-sm text-muted-foreground">
                      Click to reveal answer
                    </div>
                  </CardContent>
                </Card>

                {/* Back Face */}
                <Card
                  className="absolute inset-0 hover:shadow-lg min-h-[400px] flex items-center justify-center"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardContent className="pt-12 pb-12 px-8 text-center w-full">
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Back
                      </span>
                    </div>
                    <div className="text-2xl font-medium leading-relaxed">
                      {currentCard.back}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Next/Previous Card - Enters during transition */}
            {isTransitioning && nextCardIndex !== null && (
              <div
                className="absolute inset-0"
                style={{
                  animation:
                    slideDirection === "left"
                      ? "slideInFromRight 300ms ease-in-out forwards"
                      : slideDirection === "right"
                      ? "slideInFromLeft 300ms ease-in-out forwards"
                      : "none",
                }}
              >
                <div
                  className="relative min-h-[400px] cursor-pointer"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Show the next/previous card front */}
                  <Card
                    className="absolute inset-0 hover:shadow-lg min-h-[400px] flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    <CardContent className="pt-12 pb-12 px-8 text-center w-full">
                      <div className="mb-4">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Front
                        </span>
                      </div>
                      <div className="text-2xl font-medium leading-relaxed">
                        {displayCards[nextCardIndex]?.front}
                      </div>
                      <div className="mt-8 text-sm text-muted-foreground">
                        Click to reveal answer
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <style jsx>{`
            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            @keyframes slideInFromLeft {
              from {
                transform: translateX(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={isFirstCard || isTransitioning}
              className="w-32"
            >
              ← Previous
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleFlip}
              disabled={isTransitioning}
              className="flex-1"
            >
              {isFlipped ? "Show Front" : "Show Back"}
            </Button>

            {isLastCard ? (
              <Button size="lg" onClick={handleFinish} className="w-32" disabled={isTransitioning}>
                Finish
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!hasViewedCurrentCard || isTransitioning}
                className="w-32"
              >
                Next →
              </Button>
            )}
          </div>

          {/* Keyboard Shortcuts Tip */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              ⌨️ <span className="font-semibold">Keyboard shortcuts:</span> Use{" "}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">←</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">→</kbd> to navigate,{" "}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">Space</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">↓</kbd> to flip
            </p>
          </div>

          {/* Hint */}
          {!hasViewedCurrentCard && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                💡 Tip: Reveal the answer before moving to the next card
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
