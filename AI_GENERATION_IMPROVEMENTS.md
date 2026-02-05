# AI Flashcard Generation - Context-Aware Improvements

## Overview

The "Generate Cards with AI" button now features a sophisticated, context-aware prompt system that intelligently adapts to different types of learning content.

## Key Improvements

### 1. **Domain-Specific Adaptation**

The AI now analyzes the deck name and description to understand the subject domain and adapts card generation accordingly:

- **Languages**: Vocabulary, grammar, phrases, cultural context, usage examples
- **Technical/Programming**: Concepts, syntax, best practices, patterns, real-world applications
- **Sciences**: Definitions, formulas, experiments, processes, cause-effect relationships
- **History/Social Studies**: Dates, events, key figures, causes/effects, significance
- **Mathematics**: Formulas, theorems, problem-solving steps, example applications
- **General Knowledge**: Facts, definitions, relationships, contextual information

### 2. **Diverse Question Types**

The system now generates varied question formats appropriate for each domain:

- Definition questions ("What is X?")
- Explanation questions ("How does X work?", "Why does X happen?")
- Application questions ("When would you use X?")
- Comparison questions ("What's the difference between X and Y?")
- Example questions ("Give an example of X")
- Process questions ("What are the steps to X?")
- Cause-effect questions ("What happens when X?")

### 3. **Difficulty Level Distribution**

Cards are now generated with intentional difficulty progression:

- 30% foundational concepts
- 50% intermediate applications
- 20% advanced connections

### 4. **Existing Card Awareness**

The AI now:

- Fetches all existing cards in the deck before generating new ones
- Reviews existing content to avoid duplication
- Builds upon and complements what's already there
- Fills gaps in knowledge coverage
- Progresses to related but uncovered topics

### 5. **Pedagogically Sound Design**

The prompt ensures:

- Building on prerequisite knowledge
- Logical concept connections
- Key principle reinforcement through varied questioning
- Support for long-term retention through meaningful learning

### 6. **Quality Assurance**

Each generated card follows strict quality guidelines:

- Clear, specific, and unambiguous questions
- Comprehensive yet concise answers (typically 2-4 sentences)
- Examples and context where helpful
- Avoids overly broad or vague questions
- Testable and verifiable content

## Technical Implementation

### Location
`src/actions/cards.ts` - `generateCardsWithAIAction` function

### Key Changes

1. **Import Addition**: Added `getCardsByDeckId` to fetch existing cards
2. **Context Building**: Fetches and formats existing cards for AI context
3. **Enhanced Prompt**: Comprehensive, structured prompt with domain-specific instructions
4. **Duplication Prevention**: Explicitly instructs AI to avoid duplicating existing content

### Example Prompt Structure

```typescript
const contextAwarePrompt = `You are an expert educational content creator...

TOPIC: "${topic}"
DESCRIPTION/CONTEXT: ${description}
EXISTING CARDS IN THIS DECK (${existingCards.length} cards):
[List of existing cards]

INSTRUCTIONS:
1. ANALYZE the topic and description...
2. ADAPT your card generation based on the domain...
3. CREATE DIVERSE QUESTION TYPES...
4. VARY DIFFICULTY LEVELS...
5. ENSURE QUALITY...
6. BE PEDAGOGICALLY SOUND...
7. AVOID DUPLICATION...
`;
```

## User Experience Benefits

1. **Smarter Content**: AI generates cards that truly match the learning domain
2. **No Duplicates**: Subsequent generations build upon existing content
3. **Better Learning**: Varied question types and difficulty levels support effective learning
4. **Relevance**: Cards are specifically tailored to the deck's topic and description
5. **Comprehensive Coverage**: AI fills knowledge gaps intelligently

## Usage Tips for Users

To get the best AI-generated cards:

1. **Provide a clear deck title** that indicates the subject domain
2. **Write a detailed description** explaining:
   - What you want to learn
   - The difficulty level you're targeting
   - Any specific focus areas or subtopics
3. **Review generated cards** and use the generation feature multiple times to expand coverage
4. **Edit cards** if needed to match your learning style

## Example Use Cases

### Language Learning
- **Deck**: "Spanish - Travel Phrases"
- **Description**: "Common phrases for traveling in Spanish-speaking countries, focusing on hotels, restaurants, and transportation"
- **Result**: AI generates conversational phrases, cultural context, and usage scenarios

### Programming
- **Deck**: "React Hooks"
- **Description**: "Understanding React hooks including useState, useEffect, useContext, useMemo, and custom hooks. Focus on practical examples and common patterns."
- **Result**: AI generates concept definitions, syntax examples, use cases, best practices, and comparison questions

### Science
- **Deck**: "Cellular Respiration"
- **Description**: "The process of cellular respiration including glycolysis, Krebs cycle, and electron transport chain. Biology 101 level."
- **Result**: AI generates process steps, definitions, formulas, cause-effect relationships, and intermediate-level questions

## Future Enhancements

Potential improvements for consideration:

- Allow users to specify the number of cards to generate
- Add difficulty level selection (beginner/intermediate/advanced)
- Support for image-based flashcards
- Multi-language card generation
- Spaced repetition optimization based on card generation
