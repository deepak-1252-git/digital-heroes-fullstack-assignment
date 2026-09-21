import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Winners.css";

const API_URL = import.meta.env.VITE_API_URL;

const Winners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Please login again");
    }

    return session.access_token;
  };

  const parseResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();

    return {
      success: false,
      message:
        text ||
        `Request failed with status ${response.status}`,
    };
  };

  const loadWinners = async () => {
    try {
      setLoading(true);
      setError("");

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/winners`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await parseResponse(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to load winners"
        );
      }

      setWinners(result.winners || []);
    } catch (error) {
      console.error("Load winners error:", error);

      setError(
        error.message ||
          "Failed to load winners."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateWinner = async (
    winnerId,
    action
  ) => {
    try {
      setUpdatingId(winnerId);
      setError("");
      setSuccess("");

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/winners/${winnerId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await parseResponse(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Action failed"
        );
      }

      const messages = {
        approve: "Winner approved successfully.",
        reject: "Winner rejected successfully.",
        payout: "Payout marked as paid successfully.",
      };

      setSuccess(
        messages[action] || "Action completed successfully."
      );

      await loadWinners();
    } catch (error) {
      console.error("Winner update error:", error);

      setError(
        error.message ||
          "Failed to update winner."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAction = (
    winner,
    action
  ) => {
    const messages = {
      approve:
        "Are you sure you want to approve this winner?",
      reject:
        "Are you sure you want to reject this winner?",
      payout:
        "Are you sure you want to mark this payout as paid?",
    };

    const confirmed = window.confirm(
      messages[action]
    );

    if (!confirmed) return;

    updateWinner(winner.id, action);
  };

  useEffect(() => {
    loadWinners();
  }, []);

  if (loading) {
    return (
      <div className="winners-loading">
        <div className="winners-loader"></div>

        <p>
          Loading winners...
        </p>
      </div>
    );
  }

  return (
    <div className="winners-page">

      <div className="winners-container">

        {/* Header */}
        <div className="winners-header">

          <div>
            <p className="winners-eyebrow">
              ADMIN PANEL
            </p>

            <h1>
              Winner Verification
            </h1>

            <p className="winners-subtitle">
              Review winner proof and process payouts.
            </p>
          </div>

          <div className="winners-count">
            <span>Total Winners</span>

            <strong>
              {winners.length}
            </strong>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="winners-alert winners-alert-error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="winners-alert winners-alert-success">
            {success}
          </div>
        )}

        {/* Empty */}
        {winners.length === 0 ? (
          <div className="winners-empty">
            <div className="winners-empty-icon">
              🏆
            </div>

            <h2>
              No winners available
            </h2>

            <p>
              Winners will appear here after a draw
              is published.
            </p>
          </div>
        ) : (
          <div className="winners-list">

            {winners.map((winner) => {

              const isUpdating =
                updatingId === winner.id;

              const proof =
                winner.winner_proofs?.[0];

              return (
                <div
                  key={winner.id}
                  className="winner-card"
                >

                  {/* Top */}
                  <div className="winner-top">

                    <div className="winner-user">

                      <div className="winner-avatar">
                        {winner.profiles?.full_name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <h2>
                          {winner.profiles?.full_name ||
                            "Unknown User"}
                        </h2>

                        <p>
                          {winner.profiles?.email ||
                            "No email available"}
                        </p>
                      </div>

                    </div>

                    <div className="winner-prize">
                      ₹
                      {Number(
                        winner.prize_amount || 0
                      ).toLocaleString("en-IN")}
                    </div>

                  </div>

                  {/* Info */}
                  <div className="winner-info">

                    <div className="winner-info-item">
                      <span>
                        Match
                      </span>

                      <strong>
                        {winner.match_count}-Match
                      </strong>
                    </div>

                    <div className="winner-info-item">
                      <span>
                        Draw
                      </span>

                      <strong>
                        {winner.draws?.draw_month ||
                          "N/A"}
                      </strong>
                    </div>

                    <div className="winner-info-item">
                      <span>
                        Verification
                      </span>

                      <StatusBadge
                        type="verification"
                        value={
                          winner.verification_status
                        }
                      />
                    </div>

                    <div className="winner-info-item">
                      <span>
                        Payout
                      </span>

                      <StatusBadge
                        type="payout"
                        value={
                          winner.payout_status
                        }
                      />
                    </div>

                  </div>

                  {/* Proof */}
                  {proof && (
                    <div className="winner-proof">

                      <div className="proof-info">

                        <div className="proof-icon">
                          📸
                        </div>

                        <div>
                          <strong>
                            Proof submitted
                          </strong>

                          <p>
                            Winner has submitted
                            verification proof.
                          </p>
                        </div>

                      </div>

                      <a
                        href={proof.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="proof-link"
                      >
                        View Screenshot
                      </a>

                    </div>
                  )}

                  {/* No proof */}
                  {!proof && (
                    <div className="winner-no-proof">
                      <span>
                        No proof submitted yet.
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="winner-actions">

                    {winner.verification_status ===
                      "pending" && (
                      <>
                        <button
                          type="button"
                          className="winner-btn winner-approve"
                          disabled={isUpdating}
                          onClick={() =>
                            handleAction(
                              winner,
                              "approve"
                            )
                          }
                        >
                          {isUpdating
                            ? "Processing..."
                            : "✓ Approve"}
                        </button>

                        <button
                          type="button"
                          className="winner-btn winner-reject"
                          disabled={isUpdating}
                          onClick={() =>
                            handleAction(
                              winner,
                              "reject"
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {winner.verification_status ===
                      "approved" &&
                      winner.payout_status ===
                        "pending" && (
                      <button
                        type="button"
                        className="winner-btn winner-pay"
                        disabled={isUpdating}
                        onClick={() =>
                          handleAction(
                            winner,
                            "payout"
                          )
                        }
                      >
                        {isUpdating
                          ? "Processing..."
                          : "Mark as Paid"}
                      </button>
                    )}

                    {winner.verification_status ===
                      "rejected" && (
                      <span className="winner-action-status winner-rejected-text">
                        Verification rejected
                      </span>
                    )}

                    {winner.payout_status ===
                      "paid" && (
                      <span className="winner-action-status winner-paid-text">
                        ✓ Payout completed
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
};


/* =================================
   STATUS BADGE
================================= */

const StatusBadge = ({
  type,
  value,
}) => {

  const normalizedValue =
    value || "unknown";

  const label =
    normalizedValue.charAt(0).toUpperCase() +
    normalizedValue.slice(1);

  return (
    <span
      className={`winner-status winner-status-${type}-${normalizedValue}`}
    >
      {label}
    </span>
  );
};


export default Winners;