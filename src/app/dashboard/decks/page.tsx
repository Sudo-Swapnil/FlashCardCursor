import { redirect } from "next/navigation";

export default function DecksPage() {
  // Redirect to main dashboard since decks are now shown there
  redirect("/dashboard");
}
