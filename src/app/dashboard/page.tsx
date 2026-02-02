import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDeckCount } from "@/db/queries/decks";
import { getCardCount } from "@/db/queries/cards";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch stats using query functions
  const [deckCount, cardCount] = await Promise.all([
    getDeckCount(userId),
    getCardCount(userId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Welcome back! Manage your flashcard decks and start learning.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>My Decks</CardTitle>
              <CardDescription>
                View and manage all your flashcard decks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Decks</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Deck</CardTitle>
              <CardDescription>
                Start a new flashcard deck from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                New Deck
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Mode</CardTitle>
              <CardDescription>
                Practice with your flashcards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Start Studying
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
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
      </main>
    </div>
  );
}
