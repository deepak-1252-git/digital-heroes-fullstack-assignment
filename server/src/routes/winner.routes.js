import express from "express";

import {
  getWinners,
  approveWinner,
  rejectWinner,
  markPayoutPaid,
} from "../controllers/winner.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  requireAdmin,
  getWinners
);

router.patch(
  "/:winnerId/approve",
  authenticateUser,
  requireAdmin,
  approveWinner
);

router.patch(
  "/:winnerId/reject",
  authenticateUser,
  requireAdmin,
  rejectWinner
);

router.patch(
  "/:winnerId/payout",
  authenticateUser,
  requireAdmin,
  markPayoutPaid
);

export default router;