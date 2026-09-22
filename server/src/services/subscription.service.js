import { supabase } from "../lib/supabas.jse";

export const getActiveSubscription = async (userId) => {
  if (!userId) {
    return {
      subscription: null,
      error: new Error("User ID is required"),
    };
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      id,
      user_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      created_at,
      plan:subscription_plans (
        id,
        name,
        price,
        billing_interval,
        prize_pool_percentage,
        minimum_charity_percentage
      )
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    subscription: data,
    error,
  };
};