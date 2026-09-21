import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hash,
  Trophy,
  AlertCircle,
} from "lucide-react";

import {supabase} from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Loader from "../../components/Loader/Loader";

import "./Draws.css";

const Draws = () => {
  const [draws, setDraws] = useState([]);
  const [scores, setScores] = useState([]);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDrawData();
  }, []);

  const loadDrawData = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setError("Please login to view your draws.");
        return;
      }

      // -----------------------------
      // Load user profile
      // -----------------------------
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // -----------------------------
      // Load user's latest 5 scores
      // -----------------------------
      const { data: scoreData, error: scoreError } = await supabase
        .from("scores")
        .select("id,score, played_at")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoreError) throw scoreError;

      setScores(scoreData || []);

      // -----------------------------
      // Load published draws
      // -----------------------------
      const { data: drawData, error: drawError } = await supabase
        .from("draws")
        .select(`
          id,
          draw_month,
          numbers,
          status,
          published_at,
          created_at
        `)
        .eq("status", "published")
        .order("draw_month", { ascending: false })
        .limit(12);

      if (drawError) throw drawError;

      setDraws(drawData || []);
    } catch (err) {
      console.error("Draw page error:", err);
      setError(err.message || "Unable to load draw information.");
    } finally {
      setLoading(false);
    }
  };

  // Latest published draw
  const latestDraw = draws[0] || null;

  // User's 5 scores become their draw combination
  const userNumbers = useMemo(() => {
    return scores
      .map((score) => Number(score.score))
      .filter((score) => Number.isInteger(score));
  }, [scores]);

  // Calculate matching numbers
  const matchCount = useMemo(() => {
    if (!latestDraw || userNumbers.length === 0) {
      return 0;
    }

    const winningNumbers = Array.isArray(latestDraw.numbers)
      ? latestDraw.numbers
      : [];

    return userNumbers.filter((number) =>
      winningNumbers.includes(number)
    ).length;
  }, [latestDraw, userNumbers]);

  const getMatchLabel = (count) => {
    if (count >= 5) return "Jackpot Match";
    if (count === 4) return "4 Number Match";
    if (count === 3) return "3 Number Match";
    if (count > 0) return `${count} Number Match`;

    return "No Match";
  };

  if (loading) {
    return (
      <div className="draws-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="draws-page">

      {/* Header */}
      <div className="draws-header">
        <div>
          <span className="draws-eyebrow">
            <Trophy size={16} />
            MONTHLY DRAW
          </span>

          <h1>Your Draws</h1> 

          <p>
            Track monthly draw results and see how your latest
            Stableford scores performed.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="draws-message error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Current / Latest Draw */}
      <section className="latest-draw-section">

        <div className="section-heading">
          <div>
            <h2>Latest Draw</h2>
            <p>Your latest published monthly draw</p>
          </div>
        </div>

        {!latestDraw ? (
          <Card>
            <div className="empty-draw">
              <Clock3 size={34} />

              <h3>No published draw yet</h3>

              <p>
                The first monthly draw has not been published yet.
                Check back after the next draw.
              </p>
            </div>
          </Card>
        ) : (
          <div className="draw-result-grid">

            {/* Winning Numbers */}
            <Card className="winning-card">
              <div className="card-top">
                <div>
                  <span className="card-label">
                    <Hash size={15} />
                    WINNING NUMBERS
                  </span>

                  <h3>
                    {latestDraw.draw_month}
                  </h3>
                </div>

                <span className="published-badge">
                  <CheckCircle2 size={14} />
                  Published
                </span>
              </div>

              <div className="number-row">
                {(Array.isArray(latestDraw.numbers)
                  ? latestDraw.numbers
                  : []
                ).map((number, index) => (
                  <div className="draw-number" key={`${number}-${index}`}>
                    {number}
                  </div>
                ))}
              </div>

              {latestDraw.published_at && (
                <div className="draw-date">
                  <CalendarDays size={15} />

                  Published{" "}
                  {new Date(
                    latestDraw.published_at
                  ).toLocaleDateString()}
                </div>
              )}
            </Card>

            {/* User Entry */}
            <Card className="entry-card">
              <div className="card-top">
                <div>
                  <span className="card-label">
                    YOUR ENTRY
                  </span>

                  <h3>
                    {profile?.full_name || "Your Scores"}
                  </h3>
                </div>
              </div>

              {userNumbers.length === 0 ? (
                <div className="entry-empty">
                  <p>
                    Add your Stableford scores to participate
                    in the draw.
                  </p>
                </div>
              ) : (
                <>
                  <div className="number-row user-numbers">
                    {userNumbers.map((number, index) => (
                      <div
                        className="draw-number user-number"
                        key={`${number}-${index}`}
                      >
                        {number}
                      </div>
                    ))}
                  </div>

                  <div className="match-result">
                    <span>Match Result</span>

                    <strong>
                      {getMatchLabel(matchCount)}
                    </strong>
                  </div>
                </>
              )}
            </Card>

          </div>
        )}
      </section>

      {/* Draw History */}
      <section className="draw-history-section">

        <div className="section-heading">
          <div>
            <h2>Draw History</h2>
            <p>Previous monthly draw results</p>
          </div>
        </div>

        {draws.length === 0 ? (
          <Card>
            <div className="empty-draw">
              <Clock3 size={30} />

              <h3>No draw history</h3>

              <p>
                Published monthly draws will appear here.
              </p>
            </div>
          </Card>
        ) : (
          <div className="draw-history-list">

            {draws.map((draw) => {
              const numbers = Array.isArray(draw.numbers)
                ? draw.numbers
                : [];

              return (
                <Card
                  key={draw.id}
                  className="history-card"
                >
                  <div className="history-month">
                    <CalendarDays size={17} />

                    <div>
                      <strong>
                        {draw.draw_month}
                      </strong>

                      <span>
                        Monthly Draw
                      </span>
                    </div>
                  </div>

                  <div className="history-numbers">
                    {numbers.map((number, index) => (
                      <span
                        key={`${number}-${index}`}
                        className="history-number"
                      >
                        {number}
                      </span>
                    ))}
                  </div>

                  <span className="history-status">
                    Published
                  </span>
                </Card>
              );
            })}

          </div>
        )}
      </section>

    </div>
  );
};

export default Draws;