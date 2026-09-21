import { useEffect, useState } from "react";
import {
  Trophy,
  CalendarDays,
  IndianRupee,
  ShieldCheck,
  Clock3,
  AlertCircle,
  Upload,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";

import "./Winnings.css";

const Winnings = () => {
  const [winnings, setWinnings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    loadWinnings();
  }, []);

  const loadWinnings = async () => {
    try {
      setLoading(true);
      setError("");

      // --------------------------------
      // Get logged-in user
      // --------------------------------
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        setError("Please login to view your winnings.");
        return;
      }

      // --------------------------------
      // Get user's winnings
      // --------------------------------
      const { data, error: winningsError } = await supabase
        .from("winners")
        .select(`
          id,
          draw_id,
          user_id,
          match_count,
          prize_amount,
          created_at,

          draws (
            id,
            draw_month,
            numbers,
            published_at
          ),

          winner_proofs (
            id,
            file_url,
            status,
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (winningsError) {
        throw winningsError;
      }

      setWinnings(data || []);
    } catch (err) {
      console.error("Winnings loading error:", err);

      setError(
        err.message || "Unable to load your winnings."
      );
    } finally {
      setLoading(false);
    }
  };


  // --------------------------------
  //  winning proofe
  // --------------------------------
  const handleProofUpload = async (winning, file) => {
    if (!file) return;

    try {
      setUploadingId(winning.id);
      setError("");
      setSuccessMessage("");

      // -----------------------------
      // Validate file type
      // -----------------------------

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Please upload a PNG, JPG, or WEBP image."
        );
      }

      // -----------------------------
      // Validate file size
      // Maximum: 5 MB
      // -----------------------------

      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Proof image must be smaller than 5 MB."
        );
      }

      // -----------------------------
      // Get logged-in user
      // -----------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error(
          "Please login before uploading proof."
        );
      }

      // -----------------------------
      // Create safe file name
      // -----------------------------

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${winning.id}-${Date.now()}.${extension}`;

      const filePath = `${user.id}/${fileName}`;

      // -----------------------------
      // Upload to Storage
      // -----------------------------

      const { error: uploadError } = await supabase.storage
        .from("winner-proofs")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // -----------------------------
      // Save proof record
      // -----------------------------

      const { error: proofError } = await supabase
        .from("winner_proofs")
        .insert({
          winner_id: winning.id,
          file_url: filePath,
          status: "pending",
        });

      if (proofError) {
        // If DB insert fails, remove uploaded file
        await supabase.storage
          .from("winner-proofs")
          .remove([filePath]);

        throw proofError;
      }

      setSuccessMessage(
        "Your winning proof has been uploaded successfully."
      );

      // Reload winnings
      await loadWinnings();

    } catch (err) {
      console.error("Proof upload error:", err);

      setError(
        err.message ||
        "Unable to upload your winning proof."
      );
    } finally {
      setUploadingId(null);
    }
  };

  // --------------------------------
  // Match label
  // --------------------------------
  const getMatchLabel = (matchCount) => {
    if (matchCount === 5) {
      return "5 Number Jackpot";
    }

    if (matchCount === 4) {
      return "4 Number Match";
    }

    if (matchCount === 3) {
      return "3 Number Match";
    }

    return `${matchCount} Number Match`;
  };

  // --------------------------------
  // Proof status
  // --------------------------------
  const getProofStatus = (winning) => {
    const proof = winning.winner_proofs?.[0];

    if (!proof) {
      return {
        label: "Proof Required",
        type: "pending",
      };
    }

    if (proof.status === "approved") {
      return {
        label: "Proof Approved",
        type: "approved",
      };
    }

    if (proof.status === "rejected") {
      return {
        label: "Proof Rejected",
        type: "rejected",
      };
    }

    return {
      label: "Proof Pending",
      type: "pending",
    };
  };

  // --------------------------------
  // Payout status
  // --------------------------------
  const getPayoutStatus = (winning) => {
    const payout = winning.payouts?.[0];

    if (!payout) {
      return "Pending";
    }

    return payout.status || "Pending";
  };

  if (loading) {
    return (
      <div className="winnings-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="winnings-page">

      {/* =================================
          HEADER
      ================================= */}

      <div className="winnings-header">

        <div>
          <span className="winnings-eyebrow">
            <Trophy size={16} />
            YOUR REWARDS
          </span>

          <h1>Winnings</h1>

          <p>
            View your draw winnings, submit proof,
            and track your payout status.
          </p>
        </div>

      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="winnings-message error">
          <AlertCircle size={18} />

          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="winnings-message success">
          <ShieldCheck size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* =================================
          EMPTY STATE
      ================================= */}

      {!error && winnings.length === 0 && (
        <Card>
          <div className="empty-winnings">

            <div className="empty-icon">
              <Trophy size={30} />
            </div>

            <h2>No winnings yet</h2>

            <p>
              Your winning entries will appear here
              when you match 3 or more draw numbers.
            </p>
          </div>
        </Card>
      )}

      {/* =================================
          WINNINGS LIST
      ================================= */}

      {winnings.length > 0 && (
        <div className="winnings-list">

          {winnings.map((winning) => {
            const draw = winning.draws;
            const proofStatus = getProofStatus(winning);
            const payoutStatus = getPayoutStatus(winning);

            const winningNumbers = Array.isArray(
              draw?.numbers
            )
              ? draw.numbers
              : [];

            return (
              <Card
                key={winning.id}
                className="winning-card"
              >

                {/* Card Header */}

                <div className="winning-card-header">

                  <div className="winning-title">

                    <div className="winning-icon">
                      <Trophy size={20} />
                    </div>

                    <div>
                      <span>
                        {getMatchLabel(
                          winning.match_count
                        )}
                      </span>

                      <h2>
                        {draw?.draw_month ||
                          "Monthly Draw"}
                      </h2>
                    </div>

                  </div>

                  <div className="prize-amount">
                    <span>Prize</span>

                    <strong>
                      ₹
                      {Number(
                        winning.prize_amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                </div>

                {/* Draw Information */}

                <div className="winning-info-grid">

                  <div className="winning-info-item">

                    <span>
                      <CalendarDays size={15} />
                      Draw Date
                    </span>

                    <strong>
                      {draw?.published_at
                        ? new Date(
                          draw.published_at
                        ).toLocaleDateString()
                        : "—"}
                    </strong>

                  </div>

                  <div className="winning-info-item">

                    <span>
                      <Trophy size={15} />
                      Match
                    </span>

                    <strong>
                      {winning.match_count} / 5
                    </strong>

                  </div>

                  <div className="winning-info-item">

                    <span>
                      <IndianRupee size={15} />
                      Payout
                    </span>

                    <strong>
                      {payoutStatus}
                    </strong>

                  </div>

                </div>

                {/* Winning Numbers */}

                <div className="winning-numbers-section">

                  <span className="numbers-label">
                    Winning Numbers
                  </span>

                  <div className="winning-numbers">

                    {winningNumbers.map(
                      (number, index) => (
                        <span
                          key={`${number}-${index}`}
                          className="winning-number"
                        >
                          {number}
                        </span>
                      )
                    )}

                  </div>

                </div>

                {/* Proof */}

                <div className="proof-section">

                  <div className="proof-header">

                    <div>
                      <span className="proof-label">
                        <ShieldCheck size={15} />
                        WINNER VERIFICATION
                      </span>

                      <h3>
                        {proofStatus.label}
                      </h3>
                    </div>

                    {!winning.winner_proofs?.length && (
                      <>
                        <input
                          id={`proof-${winning.id}`}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (file) {
                              handleProofUpload(winning, file);
                            }

                            event.target.value = "";
                          }}
                        />

                        <label
                          htmlFor={`proof-${winning.id}`}
                          className={`proof-button ${uploadingId === winning.id
                            ? "uploading"
                            : ""
                            }`}
                        >
                          <Upload size={16} />

                          {uploadingId === winning.id
                            ? "Uploading..."
                            : "Upload Proof"}
                        </label>
                      </>
                    )}

                  </div>

                  <p className="proof-description">
                    Upload a screenshot showing your
                    winning entry for admin verification.
                  </p>

                  <div
                    className={`proof-status ${proofStatus.type}`}
                  >
                    {proofStatus.type === "approved" && (
                      <ShieldCheck size={15} />
                    )}

                    {proofStatus.type === "pending" && (
                      <Clock3 size={15} />
                    )}

                    <span>
                      {proofStatus.label}
                    </span>
                  </div>

                </div>

              </Card>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default Winnings;