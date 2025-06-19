import express, { Request, Response } from "express";
import { cards } from "../models/card";
import { updateMemoryState, getNextCard } from "../services/fsrsService";
import { FSRSItem, FSRSReview, FSRS, MemoryState } from "fsrs-rs-nodejs";

const router = express.Router();
const fsrs = new FSRS();

// Get all cards
router.get("/", (_req: Request, res: Response) => {
  // Calculate retrievability for all cards
  const cardsWithRetrievability = cards.map((card) => {
    const deltaT = (Date.now() - card.lastReviewed) / (1000 * 60 * 60 * 24);
    const retrievability = fsrs.memoryState(
      new FSRSItem([new FSRSReview(3, deltaT)]),
      new MemoryState(card.stability, card.difficulty)
    ).stability;
    return {
      ...card,
      retrievability,
    };
  });
  res.json(cardsWithRetrievability);
});

// Get the next card to review
router.get("/next", (_req: Request, res: Response) => {
  const nextCard = getNextCard(cards);
  if (!nextCard) {
    res.status(404).json({ message: "No cards to review" });
    return;
  }
  res.json(nextCard);
});

// Submit a review for a card
router.post("/:id/review", (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (typeof rating !== "number" || rating < 1 || rating > 4) {
    res
      .status(400)
      .json({ message: "Invalid rating. Must be a number between 1 and 4." });
    return;
  }

  const card = cards.find((c) => c.id === id);
  if (!card) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  const updatedState = updateMemoryState(card, rating);
  card.stability = updatedState.stability;
  card.difficulty = updatedState.difficulty;
  card.lastReviewed = Date.now();
  card.retrievability = updatedState.retrievability;
  card.nextReviewInterval = updatedState.nextReviewInterval;

  // Format nextReviewDate to YYYY-MM-DD (without time)
  const nextReviewDate = new Date(Date.now() + updatedState.nextReviewInterval * 24 * 60 * 60 * 1000);
  const formattedDate = nextReviewDate.toISOString().split('T')[0]; // Extracts "YYYY-MM-DD"

  res.json({
    message: "Review submitted",
    card,
    nextReviewDate: new Date(
      Date.now() + updatedState.nextReviewInterval * 24 * 60 * 60 * 1000
    ),
  });
});

export default router;
