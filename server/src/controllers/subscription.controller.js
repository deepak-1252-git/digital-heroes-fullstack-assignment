import razorpay from "../config/razorpay.js";
import supabase from "../config/supabase.js";
import crypto from "crypto";

const createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    let razorpayPlanId;
    let billingInterval;

    if (plan === "monthly") {
      razorpayPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID;
      billingInterval = "monthly";
    } else if (plan === "yearly") {
      razorpayPlanId = process.env.RAZORPAY_YEARLY_PLAN_ID;
      billingInterval = "yearly";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // Get our Supabase plan
    const { data: subscriptionPlan, error: planError } =
      await supabase
        .from("subscription_plans")
        .select("*")
        .eq("billing_interval", billingInterval)
        .eq("active", true)
        .single();

    if (planError || !subscriptionPlan) {
      console.error("Plan error:", planError);

      return res.status(404).json({
        success: false,
        message: "Subscription plan not found",
      });
    }

    // Create Razorpay subscription
    const razorpaySubscription =
      await razorpay.subscriptions.create({
        plan_id: razorpayPlanId,
        customer_notify: 1,
        total_count: 12,

        notes: {
          user_id: user.id,
          plan_id: subscriptionPlan.id,
        },
      });

    console.log(
      "Razorpay subscription:",
      razorpaySubscription.id
    );

    // Check if user already has a subscription row
    const { data: existingSubscription, error: existingError } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingError) {
      console.error(
        "Existing subscription lookup error:",
        existingError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to check existing subscription",
      });
    }

    let dbResult;

    if (existingSubscription) {
      // Update existing record
      dbResult = await supabase
        .from("subscriptions")
        .update({
          plan_id: subscriptionPlan.id,
          stripe_subscription_id: razorpaySubscription.id,
          status: "inactive",
          cancel_at_period_end: false,
        })
        .eq("id", existingSubscription.id);
    } else {
      // Create new record
      dbResult = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_id: subscriptionPlan.id,
          stripe_subscription_id: razorpaySubscription.id,
          status: "inactive",
          cancel_at_period_end: false,
        });
    }

    if (dbResult.error) {
      console.error(
        "SUBSCRIPTION DB ERROR:",
        dbResult.error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to save subscription",
        error: dbResult.error.message,
      });
    }

    return res.status(201).json({
      success: true,

      subscription: {
        id: razorpaySubscription.id,
        plan: plan,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
};

// ----------------------------------------------------
// ----------------------------------------------------

const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        `${razorpay_payment_id}|${razorpay_subscription_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Find user's subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq(
        "stripe_subscription_id",
        razorpay_subscription_id
      )
      .eq("user_id", req.user.id)
      .maybeSingle();

    console.log("VERIFY USER:", req.user.id);

    console.log(
      "VERIFY RAZORPAY SUBSCRIPTION:",
      razorpay_subscription_id
    );

    console.log(
      "DB SUBSCRIPTION:",
      subscription
    );

    console.log(
      "DB ERROR:",
      error
    );

    if (error || !subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription record not found",
      });
    }

    // Store Razorpay payment/subscription information
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
      })
      .eq("id", subscription.id)
      .eq("user_id", req.user.id);

    if (updateError) {
      console.error("Subscription update error:", updateError);

      return res.status(500).json({
        success: false,
        message: "Failed to activate subscription",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// --------------------------------------------------
// --------------------------------------------------

const getMySubscription = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        subscription_plans (
          name,
          billing_interval,
          price
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Get subscription error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch subscription",
      });
    }

    return res.status(200).json({
      success: true,
      subscription: data,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  createSubscription,
  verifySubscriptionPayment,
  getMySubscription,
};