import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Target,
  UserRound,
  CalendarDays,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Loader from "../../components/Loader/Loader";

import "./Scores.css";

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

export default function Scores() {
  const [scores, setScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  const [error, setError] = useState("");

  const loadScores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const { data, error: queryError } = await supabase
        .from("scores")
        .select(`
          id,
          user_id,
          score,
          played_at,
          created_at,

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

      if (queryError) {
        throw queryError;
      }

      setScores(data || []);
    } catch (err) {
      console.error("ADMIN SCORES ERROR:", err);

      setError(
        err.message || "Unable to load scores."
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
                </tr>
              </thead>

              <tbody>
                {filteredScores.map((item) => {
                  const profile =
                    item.profiles;

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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}