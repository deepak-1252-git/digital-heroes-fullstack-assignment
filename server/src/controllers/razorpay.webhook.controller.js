import crypto from "crypto";
import supabase from "../config/supabase.js";

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature",
      });
    }

    // req.body is RAW Buffer
    const rawBody = req.body.toString("utf8");

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.error("Invalid Razorpay webhook signature");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(rawBody);

    console.log("Razorpay webhook:", event.event);

    const subscription =
      event.payload?.subscription?.entity;

    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    const razorpaySubscriptionId = subscription.id;

    /*
      Map Razorpay subscription states
      to our existing Supabase status values.
    */

    let status;

    switch (subscription.status) {
      case "active":
        status = "active";
        break;

      case "pending":
        status = "past_due";
        break;

      case "halted":
        status = "inactive";
        break;

      case "cancelled":
        status = "cancelled";
        break;

      case "authenticated":
        // User has completed authorization,
        // but subscription has not started yet.
        status = "inactive";
        break;

      default:
        status = "inactive";
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status,
      })
      .eq(
        "stripe_subscription_id",
        razorpaySubscriptionId
      );

    if (error) {
      console.error(
        "Failed to update subscription:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update subscription",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

export default handleRazorpayWebhook;