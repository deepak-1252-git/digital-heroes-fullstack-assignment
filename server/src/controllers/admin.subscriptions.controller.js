import supabase from "../config/supabase.js";

const getAdminSubscriptions = async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        id,
        user_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at,

        profiles (
          id,
          full_name,
          email
        ),

        subscription_plans (
          id,
          name,
          price,
          billing_interval,
          prize_pool_percentage,
          minimum_charity_percentage
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Get admin subscriptions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch subscriptions",
      });
    }

    return res.status(200).json({
      success: true,
      subscriptions: subscriptions || [],
    });
  } catch (error) {
    console.error(
      "Admin subscriptions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  getAdminSubscriptions,
};