import supabase from "../config/supabase.js";

/*
|--------------------------------------------------------------------------
| GET ALL WINNERS
|--------------------------------------------------------------------------
*/

const getWinners = async (req, res) => {
  try {
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
          id,
          full_name,
          email
        ),

        draws (
          id,
          draw_month,
          numbers
        ),

        prize_pools (
          id,
          tier,
          percentage,
          total_amount
        ),

        winner_proofs (
          id,
          file_url,
          status,
          admin_note,
          created_at
        ),

        payouts (
          id,
          amount,
          status,
          paid_at,
          created_at
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Get winners error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch winners",
      });
    }

    return res.status(200).json({
      success: true,
      winners: data || [],
    });
  } catch (error) {
    console.error("Get winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/*
|--------------------------------------------------------------------------
| APPROVE WINNER
|--------------------------------------------------------------------------
*/

const approveWinner = async (req, res) => {
  try {
    const { winnerId } = req.params;

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        message: "Winner ID is required",
      });
    }

    const { data: winner, error: winnerError } =
      await supabase
        .from("winners")
        .select(`
          id,
          verification_status
        `)
        .eq("id", winnerId)
        .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found",
      });
    }

    if (winner.verification_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Winner is not pending verification",
      });
    }

    const { data: updatedWinner, error } =
      await supabase
        .from("winners")
        .update({
          verification_status: "approved",
        })
        .eq("id", winnerId)
        .select()
        .single();

    if (error) {
      console.error("Approve winner error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to approve winner",
      });
    }

    /*
     * If a proof exists, mark the proof as approved too.
     */
    const { error: proofError } = await supabase
      .from("winner_proofs")
      .update({
        status: "approved",
      })
      .eq("winner_id", winnerId);

    if (proofError) {
      console.error(
        "Winner proof update error:",
        proofError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Winner approved successfully",
      winner: updatedWinner,
    });
  } catch (error) {
    console.error("Approve winner error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/*
|--------------------------------------------------------------------------
| REJECT WINNER
|--------------------------------------------------------------------------
*/

const rejectWinner = async (req, res) => {
  try {
    const { winnerId } = req.params;

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        message: "Winner ID is required",
      });
    }

    const { data: winner, error: winnerError } =
      await supabase
        .from("winners")
        .select(`
          id,
          verification_status
        `)
        .eq("id", winnerId)
        .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found",
      });
    }

    if (winner.verification_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Winner is not pending verification",
      });
    }

    const { data: updatedWinner, error } =
      await supabase
        .from("winners")
        .update({
          verification_status: "rejected",
        })
        .eq("id", winnerId)
        .select()
        .single();

    if (error) {
      console.error("Reject winner error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to reject winner",
      });
    }

    /*
     * Keep proof status synchronized.
     */
    const { error: proofError } = await supabase
      .from("winner_proofs")
      .update({
        status: "rejected",
      })
      .eq("winner_id", winnerId);

    if (proofError) {
      console.error(
        "Winner proof update error:",
        proofError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Winner rejected successfully",
      winner: updatedWinner,
    });
  } catch (error) {
    console.error("Reject winner error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/*
|--------------------------------------------------------------------------
| MARK PAYOUT AS PAID
|--------------------------------------------------------------------------
*/

const markPayoutPaid = async (req, res) => {
  try {
    const { winnerId } = req.params;

    if (!winnerId) {
      return res.status(400).json({
        success: false,
        message: "Winner ID is required",
      });
    }

    const { data: winner, error: winnerError } =
      await supabase
        .from("winners")
        .select(`
          id,
          prize_amount,
          verification_status,
          payout_status
        `)
        .eq("id", winnerId)
        .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found",
      });
    }

    if (winner.verification_status !== "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Winner must be approved before payout",
      });
    }

    if (winner.payout_status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payout is already marked as paid",
      });
    }

    /*
     * Update winner payout status.
     */
    const { data: updatedWinner, error } =
      await supabase
        .from("winners")
        .update({
          payout_status: "paid",
        })
        .eq("id", winnerId)
        .select()
        .single();

    if (error) {
      console.error("Payout update error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update payout status",
      });
    }

    /*
     * If payout records exist, synchronize them.
     *
     * This query is intentionally separate so that the
     * winner status remains the source of truth even if
     * no payout row exists yet.
     */
    const { error: payoutError } = await supabase
      .from("payouts")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("winner_id", winnerId);

    if (payoutError) {
      console.error(
        "Payout record update error:",
        payoutError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payout marked as paid successfully",
      winner: updatedWinner,
    });
  } catch (error) {
    console.error("Mark payout paid error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  getWinners,
  approveWinner,
  rejectWinner,
  markPayoutPaid,
};