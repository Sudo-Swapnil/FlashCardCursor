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
import { getDecksByUserId } from "@/db/queries/decks";
import Link from "next/link";

export default async function DecksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks using query function
  const decks = await getDecksByUserId(userId);

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
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Decks</h2>
            <p className="text-muted-foreground mt-2">
              View and manage all your flashcard decks
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
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
              <Button>Create Deck</Button>
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
                  <Button className="w-full" variant="outline">
                    Study
                  </Button>
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
