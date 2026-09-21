import { useState } from "react";
import { supabase } from "../../lib/supabase";  

import "./Draws.css";

const API_URL = import.meta.env.VITE_API_URL;

const Draws = () => {
  const [drawType, setDrawType] = useState("random");
  const [drawMonth, setDrawMonth] = useState("2026-09-01");

  const [simulation, setSimulation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

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

  const simulateDraw = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setSimulation(null);

      if (!drawMonth) {
        throw new Error("Please select a draw month");
      }

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/draws/simulate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drawType,
          }),
        }
      );

      const result = await parseResponse(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Simulation failed"
        );
      }

      if (!result.draw) {
        throw new Error(
          "Invalid simulation response from server"
        );
      }

      setSimulation(result.draw);
      setSuccess(
        "Draw simulation generated successfully."
      );
    } catch (error) {
      console.error("Simulation error:", error);

      setError(
        error.message ||
        "Something went wrong while simulating the draw."
      );
    } finally {
      setLoading(false);
    }
  };

  const publishDraw = async () => {
    if (!simulation) {
      setError("Please simulate the draw first.");
      return;
    }

    if (!drawMonth) {
      setError("Please select a draw month.");
      return;
    }

    const confirmed = window.confirm(
      `Publish the ${drawMonth} draw?\n\n` +
      `Numbers: ${simulation.drawNumbers.join(", ")}`
    );

    if (!confirmed) return;

    try {
      setPublishing(true);
      setError("");
      setSuccess("");

      const token = await getToken();

      const response = await fetch(
        `${API_URL}/api/draws/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drawMonth,
            drawType,
            drawNumbers: simulation.drawNumbers,
          }),
        }
      );

      const result = await parseResponse(response);

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Publish failed"
        );
      }

      setSuccess("Draw published successfully!");
      setSimulation(null);
    } catch (error) {
      console.error("Publish error:", error);

      setError(
        error.message ||
        "Something went wrong while publishing the draw."
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleDrawTypeChange = (value) => {
    setDrawType(value);
    setSimulation(null);
    setError("");
    setSuccess("");
  };

  const handleMonthChange = (value) => {
    setDrawMonth(value);
    setSimulation(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="draws-page">
      <div className="draws-container">

        {/* Header */}
        <div className="draws-header">
          <p className="draws-eyebrow">
            ADMIN
          </p>

          <h1>
            Draw Management
          </h1>

          <p className="draws-description">
            Simulate, review and publish monthly draws.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="draws-alert draws-alert-error">
            <p>{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="draws-alert draws-alert-success">
            <p>{success}</p>
          </div>
        )}

        {/* Controls */}
        <div className="draws-card draws-controls">

          <h2>
            Create Monthly Draw
          </h2>

          <div className="draws-controls-grid">

            {/* Month */}
            <div className="draws-field">
              <label>
                Draw Month
              </label>

              <input
                type="date"
                value={drawMonth}
                onChange={(e) =>
                  handleMonthChange(e.target.value)
                }
              />
            </div>

            {/* Type */}
            <div className="draws-field">
              <label>
                Draw Type
              </label>

              <select
                value={drawType}
                onChange={(e) =>
                  handleDrawTypeChange(e.target.value)
                }
              >
                <option value="random">
                  Random Lottery
                </option>

                <option value="algorithmic">
                  Algorithmic
                </option>
              </select>
            </div>

          </div>

          <button
            className="draws-primary-btn"
            onClick={simulateDraw}
            disabled={loading || publishing}
          >
            {loading
              ? "Simulating..."
              : "Simulate Draw"}
          </button>

        </div>

        {/* Simulation */}
        {simulation && (
          <div className="draws-simulation">

            {/* Numbers */}
            <div className="draws-card draws-result-card">

              <div className="draws-result-header">

                <h2>
                  Simulation Result
                </h2>

                <span className="draws-simulated-badge">
                  SIMULATED
                </span>

              </div>

              <p className="draws-section-label">
                Draw Numbers
              </p>

              <div className="draws-numbers">
                {simulation.drawNumbers?.map(
                  (number) => (
                    <div
                      key={number}
                      className="draw-number"
                    >
                      {number}
                    </div>
                  )
                )}
              </div>

            </div>

            {/* Stats */}
            <div className="draws-stats-grid">

              <Stat
                title="Participants"
                value={
                  simulation.totalParticipants ?? 0
                }
              />

              <Stat
                title="5 Match"
                value={
                  simulation.winners?.fiveMatch?.length ?? 0
                }
              />

              <Stat
                title="4 Match"
                value={
                  simulation.winners?.fourMatch?.length ?? 0
                }
              />

              <Stat
                title="3 Match"
                value={
                  simulation.winners?.threeMatch?.length ?? 0
                }
              />

            </div>

            {/* Match Breakdown */}
            <div className="draws-card">

              <h2 className="draws-card-title">
                Match Breakdown
              </h2>

              <div className="match-list">

                <MatchRow
                  label="5 Match Jackpot"
                  count={
                    simulation.winners?.fiveMatch?.length ?? 0
                  }
                  percentage="40%"
                />

                <MatchRow
                  label="4 Match"
                  count={
                    simulation.winners?.fourMatch?.length ?? 0
                  }
                  percentage="35%"
                />

                <MatchRow
                  label="3 Match"
                  count={
                    simulation.winners?.threeMatch?.length ?? 0
                  }
                  percentage="25%"
                />

              </div>

            </div>

            {/* Publish */}
            <div className="draws-publish-card">

              <div className="draws-publish-content">

                <div>
                  <h3>
                    Ready to publish?
                  </h3>

                  <p>
                    Publishing will permanently create
                    the draw, entries, prize pools and
                    winners.
                  </p>
                </div>

                <button
                  className="draws-publish-btn"
                  onClick={publishDraw}
                  disabled={publishing || loading}
                >
                  {publishing
                    ? "Publishing..."
                    : "Publish Draw"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};


const Stat = ({ title, value }) => {
  return (
    <div className="draws-stat-card">
      <p>
        {title}
      </p>

      <strong>
        {value}
      </strong>
    </div>
  );
};


const MatchRow = ({
  label,
  count,
  percentage,
}) => {
  return (
    <div className="match-row">

      <div className="match-info">
        <p>
          {label}
        </p>

        <span>
          Prize allocation
        </span>
      </div>

      <div className="match-values">

        <span className="match-percentage">
          {percentage}
        </span>

        <strong>
          {count}
        </strong>

      </div>

    </div>
  );
};


export default Draws;