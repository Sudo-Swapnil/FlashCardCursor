import 'dotenv/config';
import {
  createDeck,
  getDecksByUserId,
  updateDeck,
  deleteDeck,
} from './db/queries/decks';
import {
  createCard,
  getCardsByDeckId,
  updateCard,
  deleteCard,
} from './db/queries/cards';

/**
 * Test script demonstrating the use of centralized query functions
 * All database operations are done through helper functions in db/queries
 */
async function main() {
  const testUserId = 'test-user-123';

  console.log('=== Testing Deck Operations ===\n');

  // Create a deck using mutation function
  console.log('1. Creating a new deck...');
  const newDeck = await createDeck({
    userId: testUserId,
    name: 'JavaScript Fundamentals',
    description: 'Core concepts of JavaScript',
  });
  console.log('New deck created:', newDeck);

  // Get decks using query function
  console.log('\n2. Getting all decks for user...');
  const decks = await getDecksByUserId(testUserId);
  console.log('User decks:', decks);

  // Update deck using mutation function
  console.log('\n3. Updating deck...');
  const updatedDeck = await updateDeck(newDeck.id, {
    name: 'JavaScript Advanced',
    description: 'Advanced JavaScript concepts',
  });
  console.log('Deck updated:', updatedDeck);

  console.log('\n=== Testing Card Operations ===\n');

  // Create cards using mutation function
  console.log('4. Creating cards...');
  const card1 = await createCard({
    deckId: newDeck.id,
    front: 'What is a closure?',
    back: 'A closure is a function that has access to variables in its outer scope',
  });
  console.log('Card 1 created:', card1);

  const card2 = await createCard({
    deckId: newDeck.id,
    front: 'What is hoisting?',
    back: 'Hoisting is JavaScript\'s default behavior of moving declarations to the top',
  });
  console.log('Card 2 created:', card2);

  // Get cards using query function
  console.log('\n5. Getting all cards for deck...');
  const cards = await getCardsByDeckId(newDeck.id);
  console.log('Deck cards:', cards);

  // Update card using mutation function
  console.log('\n6. Updating card...');
  const updatedCard = await updateCard(card1.id, {
    front: 'What is a JavaScript closure?',
  });
  console.log('Card updated:', updatedCard);

  console.log('\n=== Cleanup ===\n');

  // Delete cards using mutation function
  console.log('7. Deleting cards...');
  await deleteCard(card1.id);
  await deleteCard(card2.id);
  console.log('Cards deleted!');

  // Delete deck using mutation function
  console.log('8. Deleting deck...');
  await deleteDeck(newDeck.id);
  console.log('Deck deleted!');

  console.log('\n=== Test Complete ===');
}

main();
