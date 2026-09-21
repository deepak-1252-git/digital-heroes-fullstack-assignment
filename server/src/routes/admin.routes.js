import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getAdminDashboard } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getAdminDashboard);

export default router;