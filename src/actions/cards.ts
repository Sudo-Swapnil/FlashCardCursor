"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  createCard,
  updateCard,
  deleteCard,
  getCardById,
  getCardWithDeck,
  getCardsByDeckId,
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

const generateCardsWithAISchema = z.object({
  deckId: z.number().int().positive(),
});

// ============================================
// TYPE INFERENCE
// ============================================

type CreateCardInput = z.infer<typeof createCardSchema>;
type UpdateCardInput = z.infer<typeof updateCardSchema>;
type DeleteCardInput = z.infer<typeof deleteCardSchema>;
type GenerateCardsWithAIInput = z.infer<typeof generateCardsWithAISchema>;

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
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);

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
  revalidatePath(`/dashboard/decks/${cardWithDeck.deck.id}`);

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
  revalidatePath(`/dashboard/decks/${cardWithDeck.deck.id}`);

  // 6. Return result
  return { success: true };
}

export async function generateCardsWithAIAction(input: GenerateCardsWithAIInput) {
  // 1. Authenticate
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Check feature access
  const hasAIGeneration = has({ feature: "ai_flashcard_generation" });
  if (!hasAIGeneration) {
    throw new Error("AI generation is only available for Pro users. Please upgrade.");
  }

  // 3. Validate input
  const validatedData = generateCardsWithAISchema.parse(input);

  // 4. Verify ownership using query function
  const deck = await getDeckById(validatedData.deckId);
  if (!deck || deck.userId !== userId) {
    throw new Error("Forbidden: You don't own this deck");
  }

  // 5. Generate flashcards with AI
  const flashcardSchema = z.object({
    cards: z.array(
      z.object({
        front: z.string().describe("The question or prompt on the front of the card"),
        back: z.string().describe("The answer or explanation on the back of the card"),
      })
    ),
  });

  const topic = deck.name;
  const description = deck.description || "";
  const numberOfCards = 20;

  // Fetch existing cards to avoid duplication and build upon existing content
  const existingCards = await getCardsByDeckId(validatedData.deckId);
  const existingCardsContext = existingCards.length > 0
    ? `\n\nEXISTING CARDS IN THIS DECK (${existingCards.length} cards - avoid duplicating these topics):\n${existingCards
        .map((card, idx) => `${idx + 1}. Q: ${card.front}\n   A: ${card.back}`)
        .join("\n\n")}`
    : "\n\nThis deck currently has no cards. You're creating the first batch!";

  // Build context-aware prompt
  const contextAwarePrompt = `You are an expert educational content creator. Generate exactly ${numberOfCards} high-quality flashcards for the following topic:

TOPIC: "${topic}"
${description ? `DESCRIPTION/CONTEXT: ${description}` : ""}${existingCardsContext}

INSTRUCTIONS:
1. ANALYZE the topic and description carefully to understand:
   - The subject domain (e.g., language learning, technical concepts, history, science, mathematics, etc.)
   - The learning level (beginner, intermediate, advanced)
   - The specific focus or goals mentioned in the description

2. ADAPT your card generation based on the domain:
   - For LANGUAGES: Include vocabulary, grammar, common phrases, cultural context, and usage examples
   - For TECHNICAL/PROGRAMMING: Include concepts, syntax, best practices, common patterns, and real-world applications
   - For SCIENCES: Include definitions, formulas, experiments, processes, and cause-effect relationships
   - For HISTORY/SOCIAL STUDIES: Include dates, events, key figures, causes/effects, and significance
   - For MATHEMATICS: Include formulas, theorems, problem-solving steps, and example applications
   - For GENERAL KNOWLEDGE: Include facts, definitions, relationships, and contextual information

3. CREATE DIVERSE QUESTION TYPES appropriate for the domain:
   - Definition questions ("What is X?")
   - Explanation questions ("How does X work?", "Why does X happen?")
   - Application questions ("When would you use X?")
   - Comparison questions ("What's the difference between X and Y?")
   - Example questions ("Give an example of X")
   - Process questions ("What are the steps to X?")
   - Cause-effect questions ("What happens when X?")

4. VARY DIFFICULTY LEVELS:
   - Mix foundational concepts (30%)
   - Intermediate applications (50%)
   - Advanced connections (20%)

5. ENSURE QUALITY:
   - Questions should be clear, specific, and unambiguous
   - Answers should be comprehensive yet concise (2-4 sentences typically)
   - Include examples or context where helpful
   - Avoid overly broad or vague questions
   - Make questions testable and verifiable

6. BE PEDAGOGICALLY SOUND:
   - Build on prerequisite knowledge
   - Connect concepts logically
   - Reinforce key principles through varied questioning
   - Support long-term retention through meaningful learning

7. AVOID DUPLICATION:
   ${existingCards.length > 0 
     ? `- Review the ${existingCards.length} existing card(s) above
   - Do NOT create cards with duplicate or very similar questions
   - Build upon and complement the existing content
   - Fill gaps in knowledge coverage
   - Progress to related but uncovered topics`
     : "- This is the first batch of cards, so cover fundamental concepts first"}

Generate cards that would genuinely help someone master this topic effectively.`;

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({
      schema: flashcardSchema,
    }),
    prompt: contextAwarePrompt,
  });

  // 6. Insert generated cards into database
  const createdCards = [];
  for (const card of output.cards) {
    const newCard = await createCard({
      deckId: validatedData.deckId,
      front: card.front,
      back: card.back,
    });
    createdCards.push(newCard);
  }

  // 7. Revalidate cache
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/decks/${validatedData.deckId}`);

  // 8. Return result
  return { success: true, cards: createdCards };
}
