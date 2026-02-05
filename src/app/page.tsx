import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Note: Middleware handles redirecting authenticated users to /dashboard
  // This page only renders for unauthenticated users
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted">
      <main className="flex flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            Flash Cardy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI powered personal flashcard platform
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg" className="min-w-[140px]">
              Sign In
            </Button>
          </SignInButton>
          
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline" size="lg" className="min-w-[140px]">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
