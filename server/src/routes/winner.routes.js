import express from "express";

import {
  getWinners,
  approveWinner,
  rejectWinner,
  markPayoutPaid,
} from "../controllers/winner.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getWinners);

router.patch(
  "/:winnerId/approve",
  authMiddleware,
  approveWinner
);

router.patch(
  "/:winnerId/reject",
  authMiddleware,
  rejectWinner
);

router.patch(
  "/:winnerId/payout",
  authMiddleware,
  markPayoutPaid
);

export default router;