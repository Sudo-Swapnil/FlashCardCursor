"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  createCard,
  updateCard,
  deleteCard,
  getCardById,
  getCardWithDeck,
} from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";

// ============================================
// ZOD SCHEMAS
// ============================================

const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, "Front side is required").max(1000, "Front side is too long"),
  back: z.string().min(1, "Back side is required").max(1000, "Back side is too long"),
});

const updateCardSchema = z.object({
  id: z.number().int().positive(),
  front: z.string().min(1, "Front side is required").max(1000, "Front side is too long").optional(),
  back: z.string().min(1, "Back side is required").max(1000, "Back side is too long").optional(),
});

const deleteCardSchema = z.object({
  id: z.number().int().positive(),
});

// ============================================
// TYPE INFERENCE
// ============================================

type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;
type DeleteCardInput = z.infer<typeof deleteCardSchema>;

// ============================================
// SERVER ACTIONS
// ============================================

export async function createCardAction(input: CreateCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = createCardSchema.parse(input);

  // 3. Verify ownership using query function
  const deck = await getDeckById(validatedData.deckId);

  if (!deck || deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this deck");
  }

  // 4. Call mutation function
  const newCard = await createCard({
    deckId: validatedData.deckId,
    front: validatedData.front,
    back: validatedData.back,
  });

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/decks/${validatedData.deckId}`);

  // 6. Return result
  return { success: true, card: newCard };
}

export async function updateCardAction(input: UpdateCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = updateCardSchema.parse(input);

  // 3. Verify ownership using query function
  const cardWithDeck = await getCardWithDeck(validatedData.id);

  if (!cardWithDeck || cardWithDeck.deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this card");
  }

  // 4. Call mutation function
  const updatedCard = await updateCard(validatedData.id, {
    front: validatedData.front,
    back: validatedData.back,
  });

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/decks/${cardWithDeck.deck.id}`);

  // 6. Return result
  return { success: true, card: updatedCard };
}

export async function deleteCardAction(input: DeleteCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate input
  const validatedData = deleteCardSchema.parse(input);

  // 3. Verify ownership using query function
  const cardWithDeck = await getCardWithDeck(validatedData.id);

  if (!cardWithDeck || cardWithDeck.deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this card");
  }

  // 4. Call mutation function
  await deleteCard(validatedData.id);

  // 5. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/decks/${cardWithDeck.deck.id}`);

  // 6. Return result
  return { success: true };
}
