import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Target,
  UserRound,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Loader from "../../components/Loader/Loader";

import "./Scores.css";

const API_URL = import.meta.env.VITE_API_URL;

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getScoreClass(score) {
  if (score >= 36) return "score-high";
  if (score >= 28) return "score-medium";
  return "score-low";
}

function getInputDate(date) {
  if (!date) return "";

  return new Date(date).toISOString().split("T")[0];
}

export default function Scores() {
  const [scores, setScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit modal
  const [editingScore, setEditingScore] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editPlayedAt, setEditPlayedAt] = useState("");

  // Action loading states
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadScores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Admin session not found.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/scores`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load scores."
        );
      }

      setScores(result.scores || []);
    } catch (error) {
      console.error("ADMIN SCORES ERROR:", error);

      setError(
        error.message || "Unable to load scores."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, []);

  const filteredScores = useMemo(() => {
    const query = search.trim().toLowerCase();

    return scores.filter((item) => {
      const profile = item.profiles;

      const matchesSearch =
        !query ||
        profile?.full_name
          ?.toLowerCase()
          .includes(query) ||
        profile?.email
          ?.toLowerCase()
          .includes(query);

      let matchesScore = true;

      if (scoreFilter === "high") {
        matchesScore = Number(item.score) >= 36;
      }

      if (scoreFilter === "medium") {
        matchesScore =
          Number(item.score) >= 28 &&
          Number(item.score) < 36;
      }

      if (scoreFilter === "low") {
        matchesScore = Number(item.score) < 28;
      }

      return matchesSearch && matchesScore;
    });
  }, [scores, search, scoreFilter]);

  const averageScore = useMemo(() => {
    if (!scores.length) return 0;

    const total = scores.reduce(
      (sum, item) =>
        sum + Number(item.score || 0),
      0
    );

    return (total / scores.length).toFixed(1);
  }, [scores]);

  const highestScore = useMemo(() => {
    if (!scores.length) return 0;

    return Math.max(
      ...scores.map((item) =>
        Number(item.score || 0)
      )
    );
  }, [scores]);

  const uniquePlayers = useMemo(() => {
    return new Set(
      scores.map((item) => item.user_id)
    ).size;
  }, [scores]);

  // ----------------------------------------
  // OPEN EDIT MODAL
  // ----------------------------------------

  const openEditModal = (item) => {
    setEditingScore(item);

    setEditScore(String(item.score));

    setEditPlayedAt(
      getInputDate(item.played_at)
    );

    setError("");
    setSuccess("");
  };

  // ----------------------------------------
  // CLOSE EDIT MODAL
  // ----------------------------------------

  const closeEditModal = () => {
    if (updatingId) return;

    setEditingScore(null);
    setEditScore("");
    setEditPlayedAt("");
  };

  // ----------------------------------------
  // UPDATE SCORE
  // ----------------------------------------

  const handleUpdateScore = async (
    scoreId,
    score,
    playedAt
  ) => {
    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      setError(
        "Stableford score must be between 1 and 45."
      );

      return;
    }

    if (!playedAt) {
      setError("Please select a played date.");

      return;
    }

    try {
      setUpdatingId(scoreId);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/scores/${scoreId}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            score: numericScore,
            played_at: playedAt,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Unable to update score."
        );
      }

      setScores((currentScores) =>
        currentScores.map((item) =>
          item.id === scoreId
            ? result.score
            : item
        )
      );

      setEditingScore(null);
      setEditScore("");
      setEditPlayedAt("");

      setSuccess(
        "Score updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE SCORE ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to update score."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ----------------------------------------
  // DELETE SCORE
  // ----------------------------------------

  const handleDeleteScore = async (scoreId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(scoreId);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/scores/${scoreId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Unable to delete score."
        );
      }

      setScores((currentScores) =>
        currentScores.filter(
          (item) => item.id !== scoreId
        )
      );

      setSuccess(
        "Score deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE SCORE ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to delete score."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ----------------------------------------
  // LOADING
  // ----------------------------------------

  if (loading) {
    return (
      <div className="admin-scores-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-scores-page">

      {/* Header */}
      <div className="admin-scores-header">
        <div>
          <span className="admin-page-eyebrow">
            Administration
          </span>

          <h1>Scores</h1>

          <p>
            Monitor Stableford scores submitted by
            subscribers.
          </p>
        </div>

        <button
          type="button"
          className="scores-refresh-button"
          onClick={() => loadScores(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "spin" : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="scores-alert">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="scores-alert-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="scores-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="scores-alert-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="scores-summary">

        <div className="score-summary-card">
          <div className="score-summary-icon">
            <Target size={19} />
          </div>

          <div>
            <strong>{scores.length}</strong>
            <span>Total Score Records</span>
          </div>
        </div>

        <div className="score-summary-card">
          <div className="score-summary-icon">
            <UserRound size={19} />
          </div>

          <div>
            <strong>{uniquePlayers}</strong>
            <span>Players</span>
          </div>
        </div>

        <div className="score-summary-card">
          <div className="score-summary-icon">
            <TrendingUp size={19} />
          </div>

          <div>
            <strong>{averageScore}</strong>
            <span>Average Score</span>
          </div>
        </div>

        <div className="score-summary-card">
          <div className="score-summary-icon">
            <Target size={19} />
          </div>

          <div>
            <strong>{highestScore}</strong>
            <span>Highest Score</span>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="scores-toolbar">

        <div className="scores-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search player or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          className="scores-filter"
          value={scoreFilter}
          onChange={(event) =>
            setScoreFilter(event.target.value)
          }
        >
          <option value="all">
            All Scores
          </option>

          <option value="high">
            High — 36 to 45
          </option>

          <option value="medium">
            Medium — 28 to 35
          </option>

          <option value="low">
            Low — 1 to 27
          </option>
        </select>

      </div>

      <div className="scores-result-count">
        Showing{" "}
        <strong>
          {filteredScores.length}
        </strong>{" "}
        of{" "}
        <strong>{scores.length}</strong>{" "}
        score records
      </div>

      {/* Table */}
      {filteredScores.length === 0 ? (
        <div className="scores-empty">
          <Target size={34} />

          <h3>No scores found</h3>

          <p>
            Try changing your search or score
            filter.
          </p>
        </div>
      ) : (
        <div className="scores-table-card">

          <div className="scores-table-wrapper">

            <table className="scores-table">

              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Played Date</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredScores.map((item) => {
                  const profile =
                    item.profiles;

                  const isUpdating =
                    updatingId === item.id;

                  const isDeleting =
                    deletingId === item.id;

                  return (
                    <tr key={item.id}>

                      {/* Player */}
                      <td>
                        <div className="score-player">

                          <div className="score-avatar">
                            {profile?.full_name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>

                          <div className="score-player-details">

                            <strong>
                              {profile?.full_name ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              <UserRound
                                size={12}
                              />

                              {profile?.email ||
                                "No email"}
                            </span>

                          </div>

                        </div>
                      </td>

                      {/* Score */}
                      <td>
                        <div
                          className={`score-value ${getScoreClass(
                            Number(item.score)
                          )}`}
                        >
                          {item.score}
                        </div>
                      </td>

                      {/* Played */}
                      <td>
                        <div className="score-date">

                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            item.played_at
                          )}

                        </div>
                      </td>

                      {/* Created */}
                      <td>
                        <span className="score-created">
                          {formatDate(
                            item.created_at
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="score-actions">

                          <button
                            type="button"
                            className="score-action-button edit"
                            onClick={() =>
                              openEditModal(item)
                            }
                            disabled={
                              isUpdating ||
                              isDeleting
                            }
                            title="Edit score"
                          >
                            <Pencil size={10} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="score-action-button delete"
                            onClick={() =>
                              handleDeleteScore(
                                item.id
                              )
                            }
                            disabled={
                              isUpdating ||
                              isDeleting
                            }
                            title="Delete score"
                          >
                            <Trash2 size={15} />

                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* =====================================
          EDIT SCORE MODAL
          ===================================== */}

      {editingScore && (
        <div
          className="score-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >

          <div className="score-modal">

            {/* Modal Header */}
            <div className="score-modal-header">

              <div>
                <span className="admin-page-eyebrow">
                  Score Management
                </span>

                <h2>Edit Score</h2>

                <p>
                  Update the subscriber's
                  Stableford score.
                </p>
              </div>

              <button
                type="button"
                className="score-modal-close"
                onClick={closeEditModal}
                disabled={!!updatingId}
              >
                <X size={19} />
              </button>

            </div>

            {/* User Info */}
            <div className="score-modal-user">

              <div className="score-avatar">
                {editingScore.profiles?.full_name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div>
                <strong>
                  {editingScore.profiles?.full_name ||
                    "Unnamed User"}
                </strong>

                <span>
                  {editingScore.profiles?.email ||
                    "No email"}
                </span>
              </div>

            </div>

            {/* Form */}
            <div className="score-modal-form">

              <div className="score-form-group">

                <label htmlFor="admin-score">
                  Stableford Score
                </label>

                <input
                  id="admin-score"
                  type="number"
                  min="1"
                  max="45"
                  step="1"
                  value={editScore}
                  onChange={(event) =>
                    setEditScore(
                      event.target.value
                    )
                  }
                  disabled={!!updatingId}
                />

                <small>
                  Score must be between 1 and 45.
                </small>

              </div>

              <div className="score-form-group">

                <label htmlFor="admin-played-date">
                  Played Date
                </label>

                <input
                  id="admin-played-date"
                  type="date"
                  value={editPlayedAt}
                  onChange={(event) =>
                    setEditPlayedAt(
                      event.target.value
                    )
                  }
                  disabled={!!updatingId}
                />

                <small>
                  One score per user per date.
                </small>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="score-modal-footer">

              <button
                type="button"
                className="score-modal-cancel"
                onClick={closeEditModal}
                disabled={!!updatingId}
              >
                Cancel
              </button>

              <button
                type="button"
                className="score-modal-save"
                onClick={() =>
                  handleUpdateScore(
                    editingScore.id,
                    editScore,
                    editPlayedAt
                  )
                }
                disabled={!!updatingId}
              >
                {updatingId ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />

                    Save Changes
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}