import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Trophy,
  TrendingUp,
  Plus,
  Target,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import Card from "../../components/Card/Card";
import Badge from "../../components/Badge/Badge";
import Loader from "../../components/Loader/Loader";

import "./Overview.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      // Get authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("User not found.");
      }

      setUser(user);

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          selected_charity_id,
          charity_percentage
        `)
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Get latest 5 scores
      const { data: scoreData, error: scoreError } = await supabase
        .from("scores")
        .select("id, score, played_at")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (scoreError) {
        throw scoreError;
      }3

      setScores(scoreData || []);

      // Get selected charity
      if (profileData?.selected_charity_id) {
        const { data: charityData, error: charityError } = await supabase
          .from("charities")
          .select("id, name, description, image_url")
          .eq("id", profileData.selected_charity_id)
          .single();

        if (charityError) {
          console.error("Charity error:", charityError);
        } else {
          setCharity(charityData);
        }
      }

      // Get active subscription
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select(`
            id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            subscription_plans (
              name,
              billing_interval,
              price
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (subscriptionError) {
        console.error("Subscription error:", subscriptionError);
      } else {
        setSubscription(subscriptionData);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="dashboard-page">

      {/* Header */}
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            MEMBER DASHBOARD
          </p>

          <h1>
            Good evening, {firstName}{" "}
            <span>👋</span>
          </h1>

          <p className="dashboard-subtitle">
            Your game. Your impact. Your chance to win.
          </p>
        </div>

        <Link
          to="/dashboard/scores"
          className="dashboard-primary-action"
        >
          <Plus size={18} />
          Add Score
        </Link>
      </section>

      {/* Stats */}
      <section className="dashboard-stats">

        <Card className="dashboard-stat-card">
          <div className="stat-icon">
            <Trophy size={22} />
          </div>

          <div>
            <span>Subscription</span>

            <strong>
              {subscription?.status === "active"
                ? "Active"
                : "Inactive"}
            </strong>

            <small>
              {subscription?.subscription_plans?.name ||
                "No active plan"}
            </small>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="stat-icon">
            <Heart size={22} />
          </div>

          <div>
            <span>Charity Impact</span>

            <strong>
              {profile?.charity_percentage || 10}%
            </strong>

            <small>
              of your subscription
            </small>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="stat-icon">
            <Target size={22} />
          </div>

          <div>
            <span>Scores</span>

            <strong>{scores.length}/5</strong>

            <small>
              latest scores
            </small>
          </div>
        </Card>

        <Card className="dashboard-stat-card">
          <div className="stat-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Draw</span>

            <strong>Monthly</strong>

            <small>
              next draw
            </small>
          </div>
        </Card>

      </section>

      {/* Main Grid */}
      <section className="dashboard-main-grid">

        {/* Scores */}
        <Card className="dashboard-section-card">

          <div className="section-heading">
            <div>
              <span className="section-label">
                PERFORMANCE
              </span>

              <h2>Your Latest Scores</h2>
            </div>

            <Link to="/dashboard/scores">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {scores.length === 0 ? (
            <div className="empty-dashboard-state">
              <Target size={32} />

              <h3>No scores yet</h3>

              <p>
                Add your first Stableford score to start
                building your draw combination.
              </p>

              <Link to="/dashboard/scores">
                Add Score
              </Link>
            </div>
          ) : (
            <div className="score-list">

              {scores.map((score, index) => (
                <div
                  className="score-item"
                  key={score.id}
                >
                  <div className="score-number">
                    {score.score}
                  </div>

                  <div className="score-info">
                    <strong>
                      Score {index + 1}
                    </strong>

                    <span>
                      {new Date(
                        score.played_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <Badge>
                    {index === 0
                      ? "Latest"
                      : "Recorded"}
                  </Badge>
                </div>
              ))}

            </div>
          )}

        </Card>

        {/* Charity */}
        <Card className="dashboard-section-card charity-dashboard-card">

          <div className="section-heading">
            <div>
              <span className="section-label">
                YOUR IMPACT
              </span>

              <h2>Your Charity</h2>
            </div>

            <Link to="/dashboard/charity">
              Manage
              <ArrowRight size={16} />
            </Link>
          </div>

          {charity ? (
            <>
              <div className="charity-content">

                {charity.image_url ? (
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="charity-logo"
                  />
                ) : (
                  <div className="charity-icon">
                    <Heart size={28} />
                  </div>
                )}

                <div>
                  <h3>{charity.name}</h3>

                  <p>
                    {charity.description ||
                      "Your contribution is helping create positive change."}
                  </p>
                </div>

              </div>

              <div className="impact-progress">

                <div className="impact-progress-header">
                  <span>Your contribution</span>

                  <strong>
                    {profile?.charity_percentage || 10}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        profile?.charity_percentage || 10
                      }%`,
                    }}
                  />
                </div>

              </div>
            </>
          ) : (
            <div className="empty-dashboard-state">
              <Heart size={32} />

              <h3>Choose a charity</h3>

              <p>
                Select a charity and decide how much of
                your subscription supports it.
              </p>

              <Link to="/dashboard/charity">
                Choose Charity
              </Link>
            </div>
          )}

        </Card>

      </section>

      {/* Draw CTA */}
      <section className="dashboard-draw-banner">

        <div className="draw-banner-icon">
          <Trophy size={30} />
        </div>

        <div>
          <span className="section-label">
            MONTHLY DRAW
          </span>

          <h2>
            Your latest 5 scores form your draw numbers.
          </h2>

          <p>
            Keep your scores updated and stay in the game.
          </p>
        </div>

        <Link to="/dashboard/draws">
          View Draws
          <ArrowRight size={18} />
        </Link>

      </section>

    </div>
  );
}

export default Dashboard;