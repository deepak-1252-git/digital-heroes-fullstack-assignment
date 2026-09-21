import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Trophy,
  Heart,
  Target,
  IndianRupee,
  CalendarDays,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../../lib/supabase";
import Loader from "../../components/Loader/Loader";

import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}) {
  const content = (
    <div className="admin-stat-card">
      <div className="admin-stat-top">
        <div className="admin-stat-icon">
          <Icon size={20} />
        </div>

        {href && (
          <ArrowRight
            size={17}
            className="admin-stat-arrow"
          />
        )}
      </div>

      <div className="admin-stat-value">{value}</div>

      <div className="admin-stat-title">{title}</div>

      {description && (
        <div className="admin-stat-description">
          {description}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="admin-stat-link">
        {content}
      </Link>
    );
  }

  return content;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("Admin session not found.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load admin dashboard."
        );
      }

      setStats(result.stats || result.data || {});
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
      setError(
        err.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <Loader />
      </div>
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <span className="admin-eyebrow">
            ADMIN CONTROL CENTER
          </span>

          <h1>Dashboard</h1>

          <p>
            Monitor subscribers, scores, draws, charities,
            winners and payouts from one place.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={loadDashboard}
        >
          <Activity size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <strong>Unable to load dashboard</strong>
          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Try Again
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="admin-stats-grid">
            <StatCard
              title="Total Users"
              value={stats?.users ?? stats?.totalUsers ?? 0}
              description="Registered accounts"
              icon={Users}
              href="/admin/users"
            />

            <StatCard
              title="Active Subscribers"
              value={
                stats?.activeSubscriptions ??
                stats?.activeSubscribers ??
                0
              }
              description="Currently active plans"
              icon={UserCheck}
              href="/admin/subscriptions"
            />

            <StatCard
              title="Total Scores"
              value={stats?.scores ?? stats?.totalScores ?? 0}
              description="Stableford score entries"
              icon={Target}
              href="/admin/scores"
            />

            <StatCard
              title="Charities"
              value={
                stats?.charities ??
                stats?.totalCharities ??
                0
              }
              description="Active charity listings"
              icon={Heart}
              href="/admin/charities"
            />

            <StatCard
              title="Winners"
              value={
                stats?.winners ??
                stats?.totalWinners ??
                0
              }
              description="Recorded winning entries"
              icon={Trophy}
              href="/admin/winners"
            />

            <StatCard
              title="Pending Payouts"
              value={
                stats?.pendingPayouts ??
                stats?.pending_payouts ??
                0
              }
              description="Awaiting admin action"
              icon={IndianRupee}
              href="/admin/winners"
            />
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-panel-label">
                    DRAW SYSTEM
                  </span>

                  <h2>Recent Draws</h2>
                </div>

                <Link
                  to="/admin/draws"
                  className="admin-view-link"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {stats?.recentDraws?.length > 0 ? (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Numbers</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.recentDraws.map((draw) => (
                        <tr key={draw.id}>
                          <td>
                            <strong>
                              {draw.draw_month || "—"}
                            </strong>
                          </td>

                          <td>
                            <div className="draw-number-list">
                              {Array.isArray(draw.numbers)
                                ? draw.numbers.map(
                                    (number, index) => (
                                      <span key={index}>
                                        {number}
                                      </span>
                                    )
                                  )
                                : "—"}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`admin-status ${
                                draw.published_at
                                  ? "published"
                                  : "pending"
                              }`}
                            >
                              {draw.published_at
                                ? "Published"
                                : "Draft"}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              draw.published_at ||
                                draw.created_at
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty">
                  <CalendarDays size={28} />
                  <p>No draws available yet.</p>

                  <Link to="/admin/draws">
                    Open Draw Management
                  </Link>
                </div>
              )}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <span className="admin-panel-label">
                    PLATFORM
                  </span>

                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="admin-actions">
                <Link
                  to="/admin/users"
                  className="admin-action"
                >
                  <Users size={19} />

                  <div>
                    <strong>Manage Users</strong>
                    <span>
                      View and manage registered users
                    </span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/admin/subscriptions"
                  className="admin-action"
                >
                  <UserCheck size={19} />

                  <div>
                    <strong>Subscriptions</strong>
                    <span>
                      Monitor active subscription plans
                    </span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/admin/winners"
                  className="admin-action"
                >
                  <Trophy size={19} />

                  <div>
                    <strong>Winner Verification</strong>
                    <span>
                      Review proofs and payouts
                    </span>
                  </div>

                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/admin/analytics"
                  className="admin-action"
                >
                  <Activity size={19} />

                  <div>
                    <strong>Analytics</strong>
                    <span>
                      View platform performance
                    </span>
                  </div>

                  <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>

          <section className="admin-panel admin-summary-panel">
            <div className="admin-panel-header">
              <div>
                <span className="admin-panel-label">
                  FINANCIAL OVERVIEW
                </span>

                <h2>Platform Summary</h2>
              </div>
            </div>

            <div className="admin-summary-grid">
              <div className="admin-summary-item">
                <span>Total Prize Pool</span>

                <strong>
                  {formatCurrency(
                    stats?.totalPrizePool ??
                      stats?.prizePool ??
                      0
                  )}
                </strong>
              </div>

              <div className="admin-summary-item">
                <span>Charity Contributions</span>

                <strong>
                  {formatCurrency(
                    stats?.charityContributions ??
                      stats?.totalCharityContributions ??
                      0
                  )}
                </strong>
              </div>

              <div className="admin-summary-item">
                <span>Pending Payout Amount</span>

                <strong>
                  {formatCurrency(
                    stats?.pendingPayoutAmount ??
                      stats?.pending_payout_amount ??
                      0
                  )}
                </strong>
              </div>

              <div className="admin-summary-item">
                <span>Latest Draw</span>

                <strong>
                  {stats?.latestDraw?.draw_month ||
                    stats?.latestDrawMonth ||
                    "Not published"}
                </strong>
              </div>
            </div>
          </section>
        </>
      )}
    </section>
  );
}