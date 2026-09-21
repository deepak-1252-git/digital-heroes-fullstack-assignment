import supabase from "../config/supabase.js";

const isAdmin = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return false;

  return data.role === "admin";
};

export const getAdminDashboard = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const [
      users,
      subscriptions,
      scores,
      charities,
      winners,
      activeSubscriptions,
      draws,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("scores")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("charities")
        .select("*", { count: "exact", head: true })
        .eq("active", true),

      supabase
        .from("winners")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("draws")
        .select(`
          id,
          draw_month,
          draw_type,
          status,
          numbers,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const errors = [
      users,
      subscriptions,
      scores,
      charities,
      winners,
      activeSubscriptions,
      draws,
    ].filter((result) => result.error);

    if (errors.length) {
      throw errors[0].error;
    }

    res.json({
      success: true,
      stats: {
        users: users.count || 0,
        subscriptions: subscriptions.count || 0,
        activeSubscriptions: activeSubscriptions.count || 0,
        scores: scores.count || 0,
        charities: charities.count || 0,
        winners: winners.count || 0,
      },
      recentDraws: draws.data || [],
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};