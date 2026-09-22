import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  getAdminSubscriptions,
} from "../controllers/admin.subscriptions.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  requireAdmin,
  getAdminSubscriptions
);

export default router;