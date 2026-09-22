import express from "express";

import authenticateUser from "../middleware/auth.middleware.js";
import requireAdmin from "../middleware/admin.middleware.js";

import {
  getAdminCharities,
  createAdminCharity,
  updateAdminCharity,
  deleteAdminCharity,
} from "../controllers/admin.charities.controller.js";

const router = express.Router();


// GET all charities
router.get(
  "/",
  authenticateUser,
  requireAdmin,
  getAdminCharities
);


// ADD charity
router.post(
  "/",
  authenticateUser,
  requireAdmin,
  createAdminCharity
);


// EDIT charity
router.put(
  "/:id",
  authenticateUser,
  requireAdmin,
  updateAdminCharity
);


// DELETE charity
router.delete(
  "/:id",
  authenticateUser,
  requireAdmin,
  deleteAdminCharity
);


export default router;