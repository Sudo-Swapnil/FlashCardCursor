import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudySession } from "@/components/study-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type PageProps = {
  params: Promise<{ deckId: string }>;
};

export default async function StudyPage({ params }: PageProps) {
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

  // If no cards, show message
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Cards Available</CardTitle>
            <CardDescription>
              This deck doesn&apos;t have any cards yet. Add some cards before
              starting a study session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/decks/${deckIdNum}`}>
              <Button>Back to Deck</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <StudySession
          deckId={deckIdNum}
          deckName={deck.name}
          cards={cards}
        />
      </main>
    </div>
  );
}
