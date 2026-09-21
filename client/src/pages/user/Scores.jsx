import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Edit3,
  Plus,
  Target,
  Trash2,
  X,
} from "lucide-react";

import {supabase} from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import Loader from "../../components/Loader/Loader";

import "./Scores.css";

function Scores() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);

  const [score, setScore] = useState("");
  const [playedAt, setPlayedAt] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadScores();
  }, []);

  async function loadScores() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("You must be logged in.");
      }

      setUser(user);

      const { data, error: scoresError } = await supabase
        .from("scores")
        .select("id, score, played_at, created_at")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoresError) {
        throw scoresError;
      }

      setScores(data || []);
    } catch (err) {
      console.error("Load scores error:", err);
      setError(err.message || "Unable to load scores.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setScore("");
    setPlayedAt("");
    setEditingId(null);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setScore(String(item.score));
    setPlayedAt(item.played_at);

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validateForm() {
    const numericScore = Number(score);

    if (!score) {
      return "Please enter your Stableford score.";
    }

    if (!Number.isInteger(numericScore)) {
      return "Score must be a whole number.";
    }

    if (numericScore < 1 || numericScore > 45) {
      return "Stableford score must be between 1 and 45.";
    }

    if (!playedAt) {
      return "Please select the date you played.";
    }

    if (playedAt > today) {
      return "Score date cannot be in the future.";
    }

    const duplicate = scores.some(
      (item) =>
        item.played_at === playedAt &&
        item.id !== editingId
    );

    if (duplicate) {
      return "You already have a score for this date.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const { error: updateError } = await supabase
          .from("scores")
          .update({
            score: Number(score),
            played_at: playedAt,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Score updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("scores")
          .insert({
            user_id: user.id,
            score: Number(score),
            played_at: playedAt,
          });

        if (insertError) {
          if (insertError.code === "23505") {
            throw new Error(
              "You already have a score for this date."
            );
          }

          throw insertError;
        }

        setSuccess("Score added successfully.");
      }

      resetForm();
      await loadScores();
    } catch (err) {
      console.error("Save score error:", err);
      setError(err.message || "Unable to save score.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess("Score deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await loadScores();
    } catch (err) {
      console.error("Delete score error:", err);
      setError(err.message || "Unable to delete score.");
    } finally {
      setDeletingId(null);
    }
  }

  const averageScore = useMemo(() => {
    if (!scores.length) {
      return 0;
    }

    const total = scores.reduce(
      (sum, item) => sum + Number(item.score),
      0
    );

    return Math.round((total / scores.length) * 10) / 10;
  }, [scores]);

  const latestScore = scores[0]?.score || "--";

  if (loading) {
    return (
      <div className="scores-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div className="scores-page">

      {/* Header */}
      <div className="scores-header">
        <div>
          <span className="scores-eyebrow">
            PERFORMANCE
          </span>

          <h1>Your Scores</h1>

          <p>
            Keep your latest Stableford scores updated.
            Your five latest scores form your draw combination.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="scores-stats">

        <Card className="score-stat">
          <div className="score-stat-icon">
            <Target size={21} />
          </div>

          <div>
            <span>Scores Recorded</span>
            <strong>{scores.length}/5</strong>
          </div>
        </Card>

        <Card className="score-stat">
          <div className="score-stat-icon">
            <Check size={21} />
          </div>

          <div>
            <span>Average Score</span>
            <strong>
              {scores.length ? averageScore : "--"}
            </strong>
          </div>
        </Card>

        <Card className="score-stat">
          <div className="score-stat-icon">
            <CalendarDays size={21} />
          </div>

          <div>
            <span>Latest Score</span>
            <strong>{latestScore}</strong>
          </div>
        </Card>

      </section>

      {/* Messages */}
      {error && (
        <div className="scores-message scores-error">
          <X size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="scores-message scores-success">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Add / Edit */}
      <Card className="score-form-card">

        <div className="score-form-heading">
          <div>
            <span className="scores-eyebrow">
              {editingId ? "UPDATE SCORE" : "ADD SCORE"}
            </span>

            <h2>
              {editingId
                ? "Edit your score"
                : "Record a new score"}
            </h2>
          </div>

          {editingId && (
            <button
              type="button"
              className="cancel-edit-btn"
              onClick={resetForm}
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>

        <form
          className="score-form"
          onSubmit={handleSubmit}
        >
          <div className="score-form-field">
            <label htmlFor="stableford-score">
              Stableford Score
            </label>

            <input
              id="stableford-score"
              type="number"
              min="1"
              max="45"
              step="1"
              value={score}
              onChange={(event) => {
                setScore(event.target.value);
                setError("");
                setSuccess("");
              }}
              placeholder="e.g. 36"
            />

            <small>
              Enter a score between 1 and 45.
            </small>
          </div>

          <div className="score-form-field">
            <label htmlFor="played-date">
              Played Date
            </label>

            <input
              id="played-date"
              type="date"
              max={today}
              value={playedAt}
              onChange={(event) => {
                setPlayedAt(event.target.value);
                setError("");
                setSuccess("");
              }}
            />

            <small>
              Only one score is allowed per date.
            </small>
          </div>

          <button
            type="submit"
            className="save-score-btn"
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : editingId ? (
              <>
                <Check size={18} />
                Update Score
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Score
              </>
            )}
          </button>
        </form>

      </Card>

      {/* Score History */}
      <Card className="score-history-card">

        <div className="score-history-heading">
          <div>
            <span className="scores-eyebrow">
              SCORE HISTORY
            </span>

            <h2>Latest 5 Scores</h2>
          </div>

          <Badge>
            {scores.length}/5 recorded
          </Badge>
        </div>

        {scores.length === 0 ? (
          <div className="scores-empty">

            <div className="scores-empty-icon">
              <Target size={32} />
            </div>

            <h3>No scores recorded yet</h3>

            <p>
              Add your first Stableford score above.
            </p>

          </div>
        ) : (
          <div className="scores-table">

            <div className="scores-table-header">
              <span>Score</span>
              <span>Date</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {scores.map((item, index) => (
              <div
                className="scores-table-row"
                key={item.id}
              >
                <div className="table-score">
                  <span>{item.score}</span>

                  {index === 0 && (
                    <Badge>Latest</Badge>
                  )}
                </div>

                <div className="table-date">
                  <CalendarDays size={16} />

                  {new Date(
                    `${item.played_at}T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                <div>
                  <span className="recorded-status">
                    <Check size={14} />
                    Recorded
                  </span>
                </div>

                <div className="score-actions">

                  <button
                    type="button"
                    title="Edit score"
                    onClick={() => startEdit(item)}
                  >
                    <Edit3 size={16} />
                  </button>

                  <button
                    type="button"
                    title="Delete score"
                    className="delete-score-btn"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

      </Card>

      {/* Draw info */}
      <div className="score-draw-info">

        <div className="score-draw-info-icon">
          <Target size={24} />
        </div>

        <div>
          <strong>
            Your 5 scores power your draw entry
          </strong>

          <p>
            Keep five recent scores recorded to create
            your monthly draw combination.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Scores;