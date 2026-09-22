import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  getAdminUsers,
  updateUserRole,
} from "../controllers/admin.users.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  requireAdmin,
  getAdminUsers
);

router.patch(
  "/:id/role",
  authenticateUser,
  requireAdmin,
  updateUserRole
);

export default router;