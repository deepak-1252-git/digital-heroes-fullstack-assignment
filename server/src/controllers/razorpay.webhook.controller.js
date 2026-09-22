import crypto from "crypto";
import supabase from "../config/supabase.js";

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature =
      req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature",
      });
    }

    // Razorpay webhook body must remain raw
    const rawBody = req.body.toString("utf8");

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.error(
        "Invalid Razorpay webhook signature"
      );

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(rawBody);

    console.log(
      "Razorpay webhook event:",
      event.event
    );

    const subscription =
      event.payload?.subscription?.entity;

    // Some Razorpay webhook events may not contain
    // subscription information.
    if (!subscription) {
      return res.status(200).json({
        success: true,
        message: "Webhook received",
      });
    }

    const razorpaySubscriptionId =
      subscription.id;

    // ----------------------------------------
    // Map Razorpay status → our DB status
    // ----------------------------------------

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
      case "created":
        status = "inactive";
        break;

      case "completed":
        status = "inactive";
        break;

      default:
        status = "inactive";
    }

    // ----------------------------------------
    // Convert Razorpay timestamps
    // ----------------------------------------

    const currentPeriodStart =
      subscription.current_start
        ? new Date(
            subscription.current_start * 1000
          ).toISOString()
        : null;

    const currentPeriodEnd =
      subscription.current_end
        ? new Date(
            subscription.current_end * 1000
          ).toISOString()
        : null;

    // ----------------------------------------
    // Cancellation state
    // ----------------------------------------

    const cancelAtPeriodEnd =
      event.event === "subscription.cancelled"
        ? true
        : false;

    // ----------------------------------------
    // Update Supabase
    // ----------------------------------------

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status,
        current_period_start:
          currentPeriodStart,
        current_period_end:
          currentPeriodEnd,
        cancel_at_period_end:
          cancelAtPeriodEnd,
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
        message:
          "Failed to update subscription",
      });
    }

    console.log(
      `Subscription ${razorpaySubscriptionId} updated:`,
      {
        event: event.event,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error(
      "Webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

export default handleRazorpayWebhook;