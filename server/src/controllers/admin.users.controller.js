import supabase from "../config/supabase.js";

const getAdminUsers = async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        role,
        selected_charity_id,
        charity_percentage,
        created_at,
        updated_at,
        charities (
          id,
          name
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Get admin users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    return res.status(200).json({
      success: true,
      users: profiles || [],
    });
  } catch (error) {
    console.error(
      "Admin users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!["subscriber", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Prevent an admin from accidentally removing
    // their own admin access.
    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin access",
      });
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id,
        full_name,
        email,
        role,
        selected_charity_id,
        charity_percentage,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Update user role error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user role",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  getAdminUsers,
  updateUserRole,
};