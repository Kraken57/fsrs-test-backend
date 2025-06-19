import {
  FSRS,
  FSRSItem,
  FSRSReview,
  MemoryState,
  NextStates,
} from "fsrs-rs-nodejs";
import { Card } from "../models/card";

const fsrs = new FSRS();

/**
 * Update the memory state of a card based on the user's rating.
 * @param card The card to update.
 * @param rating The user's rating (e.g., 1 for "Again", 2 for "Hard", 3 for "Good", 4 for "Easy").
 * @returns The updated stability and difficulty.
 */

// Helper function to calculate retrievability
const calculateRetrievability = (card: Card): number => {
  const deltaT = (Date.now() - card.lastReviewed) / (1000 * 60 * 60 * 24);
  const memoryState = new MemoryState(card.stability, card.difficulty);
  return fsrs.memoryState(
    new FSRSItem([
      new FSRSReview(3, deltaT), // Using current memory state is better than dummy history
    ]),
    memoryState // Pass the actual memory state
  ).stability;
};

export const updateMemoryState = (
  card: Card,
  rating: number
): {
  stability: number;
  difficulty: number;
  nextReviewInterval: number;
  retrievability: number;
} => {
  const deltaT = (Date.now() - card.lastReviewed) / (1000 * 60 * 60 * 24); // Days since last review
  const currentMemoryState = new MemoryState(card.stability, card.difficulty);

  console.log(`Updating memory state for card: ${card.question}`);
  console.log(
    `Current stability: ${card.stability}, difficulty: ${card.difficulty}`
  );
  console.log(`Rating: ${rating}, Days since last review: ${deltaT}`);

  // Use nextStates to calculate the new memory state
  const nextStates: NextStates = fsrs.nextStates(
    currentMemoryState,
    0.9, // Desired retention (e.g., 90%)
    deltaT
  );

  // Calculate retrievability before updating
  //   const retrievability = fsrs.memoryState(
  //     new FSRSItem([
  //       new FSRSReview(3, deltaT), // Example review history
  //     ])
  //   ).stability;

  // Select the next state based on the rating
  let nextState;
  switch (rating) {
    case 1: // Again
      nextState = nextStates.again;
      break;
    case 2: // Hard
      nextState = nextStates.hard;
      break;
    case 3: // Good
      nextState = nextStates.good;
      break;
    case 4: // Easy
      nextState = nextStates.easy;
      break;
    default:
      throw new Error("Invalid rating");
  }

  console.log(
    `New stability: ${nextState.memory.stability}, New difficulty: ${nextState.memory.difficulty}`
  );

  return {
    stability: nextState.memory.stability,
    difficulty: nextState.memory.difficulty,
    nextReviewInterval: nextState.interval,
    retrievability: calculateRetrievability(card),
  };
};

/**
 * Get the next card to review based on retrievability.
 * @param cards The list of cards.
 * @returns The next card to review.
 */
export const getNextCard = (cards: Card[]): Card | null => {
  const now = Date.now();

  console.log("Determining the next card to review...");
  //   const nextCard = cards.reduce((mostDue, card) => {
  //     const deltaT = (now - card.lastReviewed) / (1000 * 60 * 60 * 24); // Days since last review
  //     const retrievability = fsrs.memoryState(
  //       new FSRSItem([
  //         new FSRSReview(3, deltaT), // Example review history
  //       ])
  //     ).stability;

  //     // Calculate next review interval
  //     const nextStates = fsrs.nextStates(
  //       new MemoryState(card.stability, card.difficulty),
  //       0.9,
  //       deltaT
  //     );
  //     const nextReviewInterval = nextStates.good.interval; // Using 'good' as default

  //     console.log(`Card: ${card.question}, Retrievability: ${retrievability}`);

  //     if (!mostDue || retrievability < mostDue.retrievability) {
  //       return {
  //         card: {
  //           ...card,
  //           retrievability,
  //           nextReviewInterval,
  //         },
  //         retrievability,
  //       };
  //     }

  //     return mostDue;
  //   }, null as { card: Card; retrievability: number } | null);

  const nextCard = cards.reduce((mostDue, card) => {
    const retrievability = calculateRetrievability(card);

    // Calculate next review interval
    const deltaT = (now - card.lastReviewed) / (1000 * 60 * 60 * 24);
    const nextStates = fsrs.nextStates(
      new MemoryState(card.stability, card.difficulty),
      0.9,
      deltaT
    );
    const nextReviewInterval = nextStates.good.interval;

    if (!mostDue || retrievability < mostDue.retrievability) {
      return {
        card: {
          ...card,
          retrievability,
          nextReviewInterval,
        },
        retrievability,
      };
    }

    return mostDue;
  }, null as { card: Card; retrievability: number } | null);

  if (nextCard) {
    console.log(`Next card to review: ${nextCard.card.question}`);
  } else {
    console.log("No cards to review.");
  }

  return nextCard ? nextCard.card : null;
};
