import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================
// QUERY FUNCTIONS (Read Operations)
// ============================================

export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.createdAt);
}

export async function getCardById(cardId: number) {
  const result = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  
  return result[0] || null;
}

export async function getCardWithDeck(cardId: number) {
  const result = await db
    .select({
      card: cardsTable,
      deck: decksTable,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(cardsTable.id, cardId))
    .limit(1);
  
  return result[0] || null;
}

export async function getCardCount(userId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(decksTable.userId, userId));
  
  return result[0]?.count || 0;
}

export async function getCardCountByDeckId(deckId: number) {
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
  
  return cards.length;
}

// ============================================
// MUTATION FUNCTIONS (Write Operations)
// ============================================

export async function createCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  const [newCard] = await db
    .insert(cardsTable)
    .values(data)
    .returning();
  
  return newCard;
}

export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  const [updatedCard] = await db
    .update(cardsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(cardsTable.id, cardId))
    .returning();
  
  return updatedCard;
}

export async function deleteCard(cardId: number) {
  await db.delete(cardsTable).where(eq(cardsTable.id, cardId));
}

export async function deleteCardsByDeckId(deckId: number) {
  await db.delete(cardsTable).where(eq(cardsTable.deckId, deckId));
}
