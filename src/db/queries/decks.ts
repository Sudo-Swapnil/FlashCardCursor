import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// QUERY FUNCTIONS (Read Operations)
// ============================================

export async function getDecksByUserId(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.createdAt);
}

export async function getDeckById(deckId: number) {
  const result = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId))
    .limit(1);
  
  return result[0] || null;
}

export async function getDeckCount(userId: string) {
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
  
  return decks.length;
}

// ============================================
// MUTATION FUNCTIONS (Write Operations)
// ============================================

export async function createDeck(data: {
  userId: string;
  name: string;
  description: string | null;
}) {
  const [newDeck] = await db
    .insert(decksTable)
    .values(data)
    .returning();
  
  return newDeck;
}

export async function updateDeck(
  deckId: number,
  data: { name?: string; description?: string | null }
) {
  const [updatedDeck] = await db
    .update(decksTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(decksTable.id, deckId))
    .returning();
  
  return updatedDeck;
}

export async function deleteDeck(deckId: number) {
  await db.delete(decksTable).where(eq(decksTable.id, deckId));
}
