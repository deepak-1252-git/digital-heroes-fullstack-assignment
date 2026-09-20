import express from "express";

import {
  simulate,
  publish,
} from "../controllers/draw.controller.js";

import authenticateUser from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/simulate",
  authenticateUser,
  simulate
);

router.post(
  "/publish",
  authenticateUser,
  publish
);

export default router;