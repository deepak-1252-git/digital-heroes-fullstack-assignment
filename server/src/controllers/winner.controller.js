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


// GET ALL WINNERS
export const getWinners = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { data, error } = await supabase
      .from("winners")
      .select(`
        id,
        user_id,
        match_count,
        prize_amount,
        verification_status,
        payout_status,
        created_at,

        profiles (
          full_name,
          email
        ),

        draws (
          draw_month,
          numbers
        ),

        prize_pools (
          tier,
          percentage,
          total_amount
        ),

        winner_proofs (
          id,
          file_url,
          status,
          admin_note
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      winners: data,
    });

  } catch (error) {
    console.error("Get winners error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// APPROVE WINNER
export const approveWinner = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { winnerId } = req.params;

    const { data, error } = await supabase
      .from("winners")
      .update({
        verification_status: "approved",
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Winner approved",
      winner: data,
    });

  } catch (error) {
    console.error("Approve winner error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// REJECT WINNER
export const rejectWinner = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { winnerId } = req.params;

    const { data, error } = await supabase
      .from("winners")
      .update({
        verification_status: "rejected",
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Winner rejected",
      winner: data,
    });

  } catch (error) {
    console.error("Reject winner error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// MARK PAYOUT AS PAID
export const markPayoutPaid = async (req, res) => {
  try {
    if (!(await isAdmin(req.user.id))) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { winnerId } = req.params;

    const { data, error } = await supabase
      .from("winners")
      .update({
        payout_status: "paid",
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Payout marked as paid",
      winner: data,
    });

  } catch (error) {
    console.error("Payout error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};