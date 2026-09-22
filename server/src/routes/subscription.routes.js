import express from "express";

import {
  createSubscription,
  verifySubscriptionPayment,
  getMySubscription,
  cancelSubscription,
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

router.get(
  "/me",
  authenticateUser,
  getMySubscription
);

router.post(
  "/cancle",
  authenticateUser,
  cancelSubscription
);

export default router;