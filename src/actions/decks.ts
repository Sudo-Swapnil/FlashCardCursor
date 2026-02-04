"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createDeck,
  updateDeck,
  deleteDeck,
  getDeckById,
} from "@/db/queries/decks";

// ============================================
// ZOD SCHEMAS
// ============================================

const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

const updateDeckSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  description: z.string().max(500, "Description is too long").optional(),
});

const deleteDeckSchema = z.object({
  id: z.number().int().positive(),
});

// ============================================
// TYPE INFERENCE
// ============================================

type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

// ============================================
// SERVER ACTIONS
// ============================================

export async function createDeckAction(input: CreateDeckInput) {
  // 1. Authenticate
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = createDeckSchema.parse(input);

  // 3. Check deck limit for free users
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  
  if (!hasUnlimitedDecks) {
    const { getDeckCount } = await import("@/db/queries/decks");
    const deckCount = await getDeckCount(userId);
    
    if (deckCount >= 3) {
      throw new Error("You've reached the 3 deck limit. Upgrade to Pro for unlimited decks.");
    }
  }

  // 4. Call mutation function
  const newDeck = await createDeck({
    userId,
    name: validatedData.name,
    description: validatedData.description || null,
  });

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath("/decks");

  // 6. Return result
  return { success: true, deck: newDeck };
}

export async function updateDeckAction(input: UpdateDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = updateDeckSchema.parse(input);

  // 3. Verify ownership using query function
  const deck = await getDeckById(validatedData.id);

  if (!deck || deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this deck");
  }

  // 4. Call mutation function
  const updatedDeck = await updateDeck(validatedData.id, {
    name: validatedData.name,
    description: validatedData.description,
  });

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath("/decks");
  revalidatePath(`/decks/${validatedData.id}`);

  // 6. Return result
  return { success: true, deck: updatedDeck };
}

export async function deleteDeckAction(input: DeleteDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = deleteDeckSchema.parse(input);

  // 3. Verify ownership using query function
  const deck = await getDeckById(validatedData.id);

  if (!deck || deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this deck");
  }

  // 4. Call mutation function
  await deleteDeck(validatedData.id);

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath("/decks");

  // 6. Return result
  return { success: true };
}
