import supabase from "../config/supabase.js";

const isAdmin = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return !error && data?.role === "admin";
};

export const getUsers = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        role,
        charity_percentage,
        created_at,
        selected_charity_id
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      users: data || [],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};