import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckByIdAndUserId } from "@/db/queries/decks";
import { getCardsByDeckIdAndUserId } from "@/db/queries/cards";
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

  // Fetch deck using query function with userId filter
  const deck = await getDeckByIdAndUserId(deckIdNum, userId);

  // Check if deck exists and user has access (combined check)
  if (!deck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Deck Not Found</CardTitle>
            <CardDescription>
              This deck doesn&apos;t exist or you don&apos;t have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Back to My Decks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch cards for this deck with userId verification
  const cards = await getCardsByDeckIdAndUserId(deckIdNum, userId);

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
