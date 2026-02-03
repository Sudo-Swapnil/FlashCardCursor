import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId, getCardCountByDeckId } from "@/db/queries/cards";
import { AddCardDialog } from "@/components/add-card-dialog";
import Link from "next/link";

type PageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function DeckDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Get deckId from params
  const { deckId } = await params;
  const deckIdNum = parseInt(deckId, 10);

  if (isNaN(deckIdNum)) {
    notFound();
  }

  // Fetch deck using query function
  const deck = await getDeckById(deckIdNum);

  // Check if deck exists
  if (!deck) {
    notFound();
  }

  // Verify ownership
  if (deck.userId !== userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view this deck.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/decks">
              <Button>Back to My Decks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch cards for this deck
  const cards = await getCardsByDeckId(deckIdNum);
  const cardCount = await getCardCountByDeckId(deckIdNum);

  // Format date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard/decks">
              <Button variant="outline">← Back to Decks</Button>
            </Link>
          </div>

          {/* Deck Info & Metadata - Main Card */}
          <Card className="bg-gradient-to-br from-background to-muted/20">
            <CardContent className="pt-6 pb-6">
              {/* Deck Title and Action Buttons */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  {deck.name}
                </h1>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline">Edit Deck</Button>
                  <AddCardDialog deckId={deckIdNum} />
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-lg mb-3">
                {deck.description || "No description"}
              </p>

              {/* Metadata - Card Count and Created Date */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-muted/50 px-3 py-1.5 rounded-md border text-sm">
                  <span className="font-medium">{cardCount}</span>
                  <span className="ml-1 text-muted-foreground">
                    {cardCount === 1 ? "card" : "cards"}
                  </span>
                </div>
                <div className="bg-muted/50 px-3 py-1.5 rounded-md border text-sm text-muted-foreground">
                  Created {formatDate(deck.createdAt)}
                </div>
              </div>

              {/* Study Progress Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Study progress
                  </h3>
                </div>
                
                <Progress value={0} className="h-2 mb-4" />
                
                <div className="flex justify-center">
                  <Button 
                    size="lg" 
                    className="w-[20%] text-lg py-6"
                    disabled={cardCount === 0}
                  >
                    <span className="mr-2">📚</span>
                    Start Study Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>

          {cards.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No cards yet</CardTitle>
                <CardDescription>
                  Add your first card to start studying this deck.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddCardDialog deckId={deckIdNum} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Card #{card.id}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        FRONT
                      </h3>
                      <p className="text-base">{card.front}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        BACK
                      </h3>
                      <p className="text-base">{card.back}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Study Mode Button */}
        {cards.length > 0 && (
          <div className="flex justify-center">
            <Button size="lg" className="px-8">
              Start Study Session
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
