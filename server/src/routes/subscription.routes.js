import express from "express";

import {
  createSubscription,
  verifySubscriptionPayment,
} from "../controllers/subscription.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  authenticateUser,
  createSubscription
);

router.post(
  "/verify",
  authenticateUser,
  verifySubscriptionPayment
);

export default router;