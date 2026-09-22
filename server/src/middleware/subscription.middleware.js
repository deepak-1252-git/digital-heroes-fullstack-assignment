import { supabaseAdmin } from "../config/supabase.js";

export const requireActiveSubscription = async (
  req,
  res,
  next
) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        user_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        plan:subscription_plans (
          id,
          name,
          price,
          billing_interval
        )
      `)
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Database error
    if (error) {
      console.error(
        "Subscription access check error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to verify subscription",
      });
    }

    // No active subscription
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "Active subscription required",
        code: "SUBSCRIPTION_REQUIRED",
      });
    }

    // Check subscription expiry
    const periodEnd = subscription.current_period_end;

    if (
      periodEnd &&
      new Date(periodEnd).getTime() <= Date.now()
    ) {
      return res.status(403).json({
        success: false,
        message: "Subscription has expired",
        code: "SUBSCRIPTION_EXPIRED",
      });
    }

    // Attach subscription to request
    req.subscription = subscription;

    next();
  } catch (error) {
    console.error(
      "Subscription middleware error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Subscription verification failed",
    });
  }
};