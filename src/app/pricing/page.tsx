import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Unlock premium features and take your flashcard learning to the next level
          </p>
        </div>

        {/* Pricing Table */}
        <div className="mx-auto max-w-4xl">
          <PricingTable />
        </div>

        {/* Features Comparison */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            What's Included
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Free Plan Features */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-2xl font-semibold">Free Plan</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Up to 3 flashcard decks</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Unlimited cards per deck</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Manual card creation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Study mode with progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Cloud sync across devices</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan Features */}
            <div className="rounded-lg border-2 border-primary bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Pro Plan</h3>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  POPULAR
                </span>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span className="font-semibold text-foreground">Unlimited flashcard decks</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span className="font-semibold text-foreground">AI-powered flashcard generation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Everything in Free plan</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Can I switch plans later?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                What happens to my decks if I downgrade?
              </h3>
              <p className="text-muted-foreground">
                Your existing decks remain accessible, but you won't be able to create new decks beyond the free plan limit of 3 until you upgrade again.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                How does the AI flashcard generation work?
              </h3>
              <p className="text-muted-foreground">
                Our AI analyzes your topic and automatically generates relevant flashcards with questions and answers, saving you hours of manual work.
              </p>
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Is there a refund policy?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact support for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
