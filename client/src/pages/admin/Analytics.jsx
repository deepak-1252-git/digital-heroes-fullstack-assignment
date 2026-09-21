import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./Analytics.css";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
};

const getScoreBand = (score) => {
  const value = Number(score);

  if (value >= 36) return "High";
  if (value >= 28) return "Medium";
  return "Low";
};

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    users: [],
    subscriptions: [],
    scores: [],
    draws: [],
    winners: [],
    donations: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        usersResult,
        subscriptionsResult,
        scoresResult,
        drawsResult,
        winnersResult,
        donationsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, role, created_at"),

        supabase
          .from("subscriptions")
          .select(`
            id,
            user_id,
            status,
            
            current_period_start,
            current_period_end,
            created_at,
            subscription_plans (
              name,
              price,
              billing_interval,
              prize_pool_percentage,
              minimum_charity_percentage
            )
          `),

        supabase
          .from("scores")
          .select("id, user_id, score, played_at, created_at"),

        supabase
          .from("draws")
          .select("id, draw_month, status, numbers, created_at"),

        supabase
          .from("winners")
          .select("id, user_id, match_count, prize_amount, created_at"),

        supabase
          .from("donations")
          .select("id, user_id, charity_id, amount, created_at"),
      ]);

      const results = [
        usersResult,
        subscriptionsResult,
        scoresResult,
        drawsResult,
        winnersResult,
        donationsResult,
      ];

      const failedResult = results.find((result) => result.error);

      if (failedResult) {
        throw new Error(failedResult.error.message);
      }

      setData({
        users: usersResult.data || [],
        subscriptions: subscriptionsResult.data || [],
        scores: scoresResult.data || [],
        draws: drawsResult.data || [],
        winners: winnersResult.data || [],
        donations: donationsResult.data || [],
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const users = data.users;
    const subscriptions = data.subscriptions;
    const scores = data.scores;
    const draws = data.draws;
    const winners = data.winners;
    const donations = data.donations;

    const subscribers = users.filter(
      (user) => user.role === "subscriber"
    );

    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active"
    );

    const cancelledSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "cancelled"
    );

    const paidSubscriptions = subscriptions.filter((subscription) =>
      ["active", "cancelled", "past_due", "trialing"].includes(
        subscription.status
      )
    );

    const subscriptionRevenue = paidSubscriptions.reduce(
      (total, subscription) => {
        const price =
          subscription.price ??
          subscription.subscription_plans?.price ??
          0;

        return total + Number(price);
      },
      0
    );

    const charityContribution = donations.reduce(
      (total, donation) => total + Number(donation.amount || 0),
      0
    );

    const totalPrizeMoney = winners.reduce(
      (total, winner) => total + Number(winner.prize_amount || 0),
      0
    );

    const publishedDraws = draws.filter(
      (draw) => draw.status === "published"
    );

    const highScores = scores.filter((score) => Number(score.score) >= 36);
    const mediumScores = scores.filter(
      (score) => Number(score.score) >= 28 && Number(score.score) <= 35
    );
    const lowScores = scores.filter((score) => Number(score.score) <= 27);

    const scoreAverage =
      scores.length > 0
        ? scores.reduce((total, score) => total + Number(score.score || 0), 0) /
          scores.length
        : 0;

    const matchCounts = {
      5: winners.filter((winner) => Number(winner.match_count) === 5).length,
      4: winners.filter((winner) => Number(winner.match_count) === 4).length,
      3: winners.filter((winner) => Number(winner.match_count) === 3).length,
    };

    const monthlySubscriptions = subscriptions.filter((subscription) => {
      return (
        subscription.subscription_plans?.billing_interval === "monthly"
      );
    }).length;

    const yearlySubscriptions = subscriptions.filter((subscription) => {
      return (
        subscription.subscription_plans?.billing_interval === "yearly"
      );
    }).length;

    const recentSubscriptions = [...subscriptions]
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      )
      .slice(0, 6);

    return {
      totalUsers: users.length,
      subscribers: subscribers.length,
      activeSubscriptions: activeSubscriptions.length,
      cancelledSubscriptions: cancelledSubscriptions.length,
      subscriptionRevenue,
      charityContribution,
      totalPrizeMoney,
      totalDraws: draws.length,
      publishedDraws: publishedDraws.length,
      totalWinners: winners.length,
      totalScores: scores.length,
      scoreAverage,
      highScores: highScores.length,
      mediumScores: mediumScores.length,
      lowScores: lowScores.length,
      matchCounts,
      monthlySubscriptions,
      yearlySubscriptions,
      recentSubscriptions,
    };
  }, [data]);

  const maxScoreBand = Math.max(
    analytics.highScores,
    analytics.mediumScores,
    analytics.lowScores,
    1
  );

  const maxMatchCount = Math.max(
    analytics.matchCounts[5],
    analytics.matchCounts[4],
    analytics.matchCounts[3],
    1
  );

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <span className="analytics-eyebrow">ADMIN ANALYTICS</span>

          <h1>Performance Overview</h1>

          <p>
            Monitor subscribers, subscriptions, scores, draws,
            charity contributions and winnings.
          </p>
        </div>

        <button
          className="analytics-refresh"
          onClick={loadAnalytics}
          type="button"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="analytics-alert analytics-alert-error">
          <strong>Unable to load analytics</strong>
          <span>{error}</span>
        </div>
      )}

      {/* Main Stats */}
      <section className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">👥</div>

          <div>
            <span>Total Users</span>
            <strong>{formatNumber(analytics.totalUsers)}</strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">💳</div>

          <div>
            <span>Active Subscriptions</span>
            <strong>
              {formatNumber(analytics.activeSubscriptions)}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">₹</div>

          <div>
            <span>Subscription Revenue</span>
            <strong>
              {formatCurrency(analytics.subscriptionRevenue)}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">❤️</div>

          <div>
            <span>Charity Contribution</span>
            <strong>
              {formatCurrency(analytics.charityContribution)}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">🎟️</div>

          <div>
            <span>Published Draws</span>
            <strong>
              {formatNumber(analytics.publishedDraws)}
            </strong>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon">🏆</div>

          <div>
            <span>Total Winners</span>
            <strong>
              {formatNumber(analytics.totalWinners)}
            </strong>
          </div>
        </div>
      </section>

      {/* Secondary Stats */}
      <section className="analytics-mini-grid">
        <div className="analytics-mini-card">
          <span>Total Scores</span>
          <strong>{formatNumber(analytics.totalScores)}</strong>
        </div>

        <div className="analytics-mini-card">
          <span>Average Stableford</span>
          <strong>{analytics.scoreAverage.toFixed(1)}</strong>
        </div>

        <div className="analytics-mini-card">
          <span>Prize Money</span>
          <strong>{formatCurrency(analytics.totalPrizeMoney)}</strong>
        </div>

        <div className="analytics-mini-card">
          <span>Cancelled</span>
          <strong>{formatNumber(analytics.cancelledSubscriptions)}</strong>
        </div>
      </section>

      {/* Charts */}
      <section className="analytics-chart-grid">
        {/* Score Distribution */}
        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Score Distribution</h2>
              <p>Stableford score performance</p>
            </div>
          </div>

          <div className="analytics-bars">
            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>High</span>
                <strong>{analytics.highScores}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar high"
                  style={{
                    width: `${
                      (analytics.highScores / maxScoreBand) * 100
                    }%`,
                  }}
                />
              </div>

              <small>36–45</small>
            </div>

            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>Medium</span>
                <strong>{analytics.mediumScores}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar medium"
                  style={{
                    width: `${
                      (analytics.mediumScores / maxScoreBand) * 100
                    }%`,
                  }}
                />
              </div>

              <small>28–35</small>
            </div>

            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>Low</span>
                <strong>{analytics.lowScores}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar low"
                  style={{
                    width: `${
                      (analytics.lowScores / maxScoreBand) * 100
                    }%`,
                  }}
                />
              </div>

              <small>1–27</small>
            </div>
          </div>
        </div>

        {/* Winners */}
        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Winner Breakdown</h2>
              <p>Winning entries by matched numbers</p>
            </div>
          </div>

          <div className="analytics-bars">
            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>5 Matches</span>
                <strong>{analytics.matchCounts[5]}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar jackpot"
                  style={{
                    width: `${
                      (analytics.matchCounts[5] / maxMatchCount) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>4 Matches</span>
                <strong>{analytics.matchCounts[4]}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar four-match"
                  style={{
                    width: `${
                      (analytics.matchCounts[4] / maxMatchCount) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="analytics-bar-row">
              <div className="analytics-bar-label">
                <span>3 Matches</span>
                <strong>{analytics.matchCounts[3]}</strong>
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar three-match"
                  style={{
                    width: `${
                      (analytics.matchCounts[3] / maxMatchCount) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Overview */}
      <section className="analytics-chart-grid">
        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Subscription Plans</h2>
              <p>Monthly vs yearly subscriptions</p>
            </div>
          </div>

          <div className="subscription-overview">
            <div className="subscription-type">
              <span className="subscription-dot monthly" />

              <div>
                <span>Monthly</span>
                <strong>{analytics.monthlySubscriptions}</strong>
              </div>
            </div>

            <div className="subscription-type">
              <span className="subscription-dot yearly" />

              <div>
                <span>Yearly</span>
                <strong>{analytics.yearlySubscriptions}</strong>
              </div>
            </div>
          </div>

          <div className="subscription-total">
            <span>Total subscriptions</span>
            <strong>{subscriptionsTotal(data.subscriptions)}</strong>
          </div>
        </div>

        {/* Recent Subscriptions */}
        <div className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Recent Subscriptions</h2>
              <p>Latest subscription activity</p>
            </div>
          </div>

          {analytics.recentSubscriptions.length === 0 ? (
            <div className="analytics-empty-small">
              No subscription activity yet.
            </div>
          ) : (
            <div className="recent-subscriptions">
              {analytics.recentSubscriptions.map((subscription) => (
                <div
                  className="recent-subscription"
                  key={subscription.id}
                >
                  <div>
                    <strong>
                      {subscription.subscription_plans?.name ||
                        "Subscription"}
                    </strong>

                    <span>
                      {subscription.subscription_plans
                        ?.billing_interval || "—"}
                    </span>
                  </div>

                  <div className="recent-subscription-right">
                    <strong>
                      {formatCurrency(
                        subscription.price ??
                          subscription.subscription_plans?.price ??
                          0
                      )}
                    </strong>

                    <span
                      className={`analytics-status ${subscription.status}`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Summary */}
      <section className="analytics-summary">
        <div>
          <span>Draws created</span>
          <strong>{analytics.totalDraws}</strong>
        </div>

        <div>
          <span>Registered subscribers</span>
          <strong>{analytics.subscribers}</strong>
        </div>

        <div>
          <span>Charity contribution</span>
          <strong>{formatCurrency(analytics.charityContribution)}</strong>
        </div>

        <div>
          <span>Total prize money</span>
          <strong>{formatCurrency(analytics.totalPrizeMoney)}</strong>
        </div>
      </section>
    </div>
  );
}

const subscriptionsTotal = (subscriptions) => {
  return new Intl.NumberFormat("en-IN").format(
    subscriptions.length
  );
};

export default Analytics;