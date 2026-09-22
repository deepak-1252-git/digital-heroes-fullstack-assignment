import supabase from "../config/supabase.js";

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", req.user.id)
      .single();

    if (error) {
      console.error("Admin role check error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to verify admin access",
      });
    }

    if (profile?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin authorization failed",
    });
  }
};

export default requireAdmin;