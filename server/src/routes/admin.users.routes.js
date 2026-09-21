import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getUsers } from "../controllers/admin.users.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);

export default router;