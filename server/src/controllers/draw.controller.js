import supabase from "../config/supabase.js";

import {
  simulateDraw,
  publishDraw,
} from "../services/draw.service.js";


const isAdmin = async (userId) => {

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === "admin";
};


// SIMULATE
const simulate = async (req, res) => {

  try {

    const admin = await isAdmin(req.user.id);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { drawType = "random" } = req.body;

    const result = await simulateDraw({
      drawType,
    });

    return res.status(200).json({
      success: true,
      message: "Draw simulation completed",
      draw: result,
    });

  } catch (error) {

    console.error(
      "Draw simulation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Draw simulation failed",
    });
  }
};


// PUBLISH
const publish = async (req, res) => {

  try {

    const admin = await isAdmin(req.user.id);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const {
      drawMonth,
      drawType = "random",
      drawNumbers,
    } = req.body;

    const result = await publishDraw({
      drawMonth,
      drawType,
      drawNumbers,
    });

    return res.status(201).json({
      success: true,
      message: "Draw published successfully",
      result,
    });

  } catch (error) {

    console.error(
      "Draw publish error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Draw publish failed",
    });
  }
};


export {
  simulate,
  publish,
};