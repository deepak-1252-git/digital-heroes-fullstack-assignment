import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  getAdminScores,
  updateAdminScore,
  deleteAdminScore,
} from "../controllers/admin.scores.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  requireAdmin,
  getAdminScores
);

router.put(
  "/:id",
  authenticateUser,
  requireAdmin,
  updateAdminScore
);

router.delete(
  "/:id",
  authenticateUser,
  requireAdmin,
  deleteAdminScore
);

export default router;