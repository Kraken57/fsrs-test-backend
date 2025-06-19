export interface Card {
    id: string;
    question: string;
    answer: string;
    stability: number;
    difficulty: number;
    lastReviewed: number;
    retrievability?: number;
    nextReviewInterval?: number; 
  }

export const cards: Card[] = [
  {
    id: "1",
    question: "What is the capital of France?",
    answer: "Paris",
    stability: 1.5,
    difficulty: 6,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 24 * 5, // 3 days ago
  },
  {
    id: "2",
    question: "What is 2 + 2?",
    answer: "4",
    stability: 2,
    difficulty: 4,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 24 * 3, // 5 days ago
  },
  {
    id: "3",
    question: "What is the largest planet in the solar system?",
    answer: "Jupiter",
    stability: 3,
    difficulty: 5,
    lastReviewed: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
];
