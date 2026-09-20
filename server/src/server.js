import "dotenv/config";

import express from "express";
import cors from "cors";

import subscriptionRoutes from "./routes/subscription.routes.js";
import razorpayWebhookRoutes from "./routes/razorpay.webhook.routes.js";
import drawRoutes from "./routes/draw.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Razorpay webhook MUST come before express.json()
app.use(
  "/api/razorpay/webhook",
  razorpayWebhookRoutes
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Digital Heroes API is running",
  });
});

app.use(
  "/api/subscriptions",
  subscriptionRoutes
);

app.use(
  "/api/draws",
  drawRoutes
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});