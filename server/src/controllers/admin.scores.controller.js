import supabase from "../config/supabase.js";

const getAdminScores = async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from("scores")
      .select(`
        id,
        user_id,
        score,
        played_at,
        created_at,
        updated_at,

        profiles (
          id,
          full_name,
          email
        )
      `)
      .order("played_at", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Get admin scores error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch scores",
      });
    }

    return res.status(200).json({
      success: true,
      scores: scores || [],
    });
  } catch (error) {
    console.error(
      "Admin scores error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateAdminScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, played_at } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Score ID is required",
      });
    }

    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stableford score must be an integer between 1 and 45",
      });
    }

    if (!played_at) {
      return res.status(400).json({
        success: false,
        message: "Played date is required",
      });
    }

    const playedDate = new Date(played_at);

    if (Number.isNaN(playedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid played date",
      });
    }

    const { data: existingScore, error: findError } =
      await supabase
        .from("scores")
        .select("id, user_id")
        .eq("id", id)
        .single();

    if (findError || !existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    const { data: duplicateScore, error: duplicateError } =
      await supabase
        .from("scores")
        .select("id")
        .eq("user_id", existingScore.user_id)
        .eq("played_at", played_at)
        .neq("id", id)
        .maybeSingle();

    if (duplicateError) {
      console.error(
        "Duplicate score check error:",
        duplicateError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to validate score date",
      });
    }

    if (duplicateScore) {
      return res.status(409).json({
        success: false,
        message:
          "This user already has a score for this date",
      });
    }

    const { data: updatedScore, error: updateError } =
      await supabase
        .from("scores")
        .update({
          score: numericScore,
          played_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          id,
          user_id,
          score,
          played_at,
          created_at,
          updated_at,

          profiles (
            id,
            full_name,
            email
          )
        `)
        .single();

    if (updateError) {
      console.error(
        "Update admin score error:",
        updateError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to update score",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      score: updatedScore,
    });
  } catch (error) {
    console.error(
      "Admin score update error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteAdminScore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Score ID is required",
      });
    }

    const { data: existingScore, error: findError } =
      await supabase
        .from("scores")
        .select("id")
        .eq("id", id)
        .maybeSingle();

    if (findError) {
      console.error(
        "Find score error:",
        findError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to find score",
      });
    }

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    const { error: deleteError } = await supabase
      .from("scores")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "Delete admin score error:",
        deleteError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete score",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin score delete error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {
  getAdminScores,
  updateAdminScore,
  deleteAdminScore,
};