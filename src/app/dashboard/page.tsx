import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDecksByUserId, getDeckCount } from "@/db/queries/decks";
import { getCardCount } from "@/db/queries/cards";
import Link from "next/link";
import { CreateDeckDialog } from "@/components/create-deck-dialog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks and stats using query functions
  const [decks, deckCount, cardCount] = await Promise.all([
    getDecksByUserId(userId),
    getDeckCount(userId),
    getCardCount(userId),
  ]);

  // Format date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Decks</h2>
            <p className="text-muted-foreground mt-2">
              View and manage all your flashcard decks
            </p>
          </div>
          <CreateDeckDialog />
        </div>

        {/* Stats Section */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{deckCount}</CardTitle>
              <CardDescription>Total Decks</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{cardCount}</CardTitle>
              <CardDescription>Total Cards</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">0</CardTitle>
              <CardDescription>Cards Reviewed</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No decks yet</CardTitle>
              <CardDescription>
                Create your first deck to start learning!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateDeckDialog trigger={<Button>Create Deck</Button>} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <Card key={deck.id}>
                <CardHeader className="min-h-20 overflow-y-auto">
                  <CardTitle>{deck.name}</CardTitle>
                  <CardDescription>
                    {deck.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Link href={`/dashboard/decks/${deck.id}`}>
                    <Button className="w-full" variant="default">
                      View Deck
                    </Button>
                  </Link>
                   <Link href={`/dashboard/decks/${deck.id}/study`}>
                    <Button className="w-full" variant="outline">
                      Study
                    </Button>
                  </Link>
                </CardContent>
                <CardFooter>
                  <CardDescription>
                    Last modified: {formatDate(deck.updatedAt)}
                  </CardDescription>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
