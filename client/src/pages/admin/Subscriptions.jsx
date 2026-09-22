import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  CreditCard,
  CalendarDays,
  UserRound,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Loader from "../../components/Loader/Loader";

import "./Subscriptions.css";

const API_URL = import.meta.env.VITE_API_URL;

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getStatusIcon(status) {
  switch (status) {
    case "active":
      return <CheckCircle2 size={14} />;

    case "cancelled":
      return <XCircle size={14} />;

    case "past_due":
      return <AlertCircle size={14} />;

    default:
      return <Clock3 size={14} />;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "active":
      return "Active";

    case "cancelled":
      return "Cancelled";

    case "past_due":
      return "Past Due";

    case "inactive":
      return "Inactive";

    case "trialing":
      return "Trialing";

    default:
      return status || "Unknown";
  }
}

function getPlanLabel(plan) {
  if (!plan) return "Unknown";

  return (
    plan.name ||
    (plan.billing_interval === "yearly"
      ? "Yearly"
      : "Monthly")
  );
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSubscriptions = async (isRefresh = false) => {
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
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${API_URL}/api/admin/subscriptions`,
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
          result.message ||
          "Unable to load subscriptions."
        );
      }

      setSubscriptions(
        result.subscriptions || []
      );
    } catch (error) {
      console.error(
        "ADMIN SUBSCRIPTIONS ERROR:",
        error
      );

      setError(
        error.message ||
        "Unable to load subscriptions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const profile = subscription.profiles;
      const plan = subscription.subscription_plans;

      const matchesSearch =
        !query ||
        profile?.full_name
          ?.toLowerCase()
          .includes(query) ||
        profile?.email
          ?.toLowerCase()
          .includes(query) ||
        plan?.name
          ?.toLowerCase()
          .includes(query) ||
        subscription.status
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        subscription.status === statusFilter;


      return (
        matchesSearch &&
        matchesStatus

      );
    });
  }, [
    subscriptions,
    search,
    statusFilter,
  ]);

  const activeCount = subscriptions.filter(
    (item) => item.status === "active"
  ).length;

  const cancelledCount = subscriptions.filter(
    (item) => item.status === "cancelled"
  ).length;

  const pastDueCount = subscriptions.filter(
    (item) => item.status === "past_due"
  ).length;

  if (loading) {
    return (
      <div className="admin-subscriptions-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-subscriptions-page">
      {/* Header */}
      <div className="admin-subscriptions-header">
        <div>
          <span className="admin-page-eyebrow">
            Administration
          </span>

          <h1>Subscriptions</h1>

          <p>
            Monitor subscriber plans and subscription
            lifecycle.
          </p>
        </div>

        <button
          type="button"
          className="subscriptions-refresh-button"
          onClick={() =>
            loadSubscriptions(true)
          }
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
        <div className="subscriptions-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      <div className="subscriptions-summary">
        <div className="subscription-summary-card">
          <div className="subscription-summary-icon">
            <CreditCard size={19} />
          </div>

          <div>
            <strong>
              {subscriptions.length}
            </strong>

            <span>Total Subscriptions</span>
          </div>
        </div>

        <div className="subscription-summary-card">
          <div className="subscription-summary-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <strong>{activeCount}</strong>

            <span>Active</span>
          </div>
        </div>

        <div className="subscription-summary-card">
          <div className="subscription-summary-icon">
            <XCircle size={19} />
          </div>

          <div>
            <strong>{cancelledCount}</strong>

            <span>Cancelled</span>
          </div>
        </div>

        <div className="subscription-summary-card">
          <div className="subscription-summary-icon">
            <AlertCircle size={19} />
          </div>

          <div>
            <strong>{pastDueCount}</strong>

            <span>Past Due</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="subscriptions-toolbar">
        <div className="subscriptions-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search user, email or plan..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          className="subscriptions-status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="cancelled">
            Cancelled
          </option>

          <option value="past_due">
            Past Due
          </option>

          <option value="inactive">
            Inactive
          </option>

          <option value="trialing">
            Trialing
          </option>
        </select>
      </div>

      <div className="subscriptions-result-count">
        Showing{" "}
        <strong>
          {filteredSubscriptions.length}
        </strong>{" "}
        of{" "}
        <strong>
          {subscriptions.length}
        </strong>{" "}
        subscriptions
      </div>

      {/* Table */}
      {filteredSubscriptions.length === 0 ? (
        <div className="subscriptions-empty">
          <CreditCard size={34} />

          <h3>
            No subscriptions found
          </h3>

          <p>
            Try changing your search or status
            filter.
          </p>
        </div>
      ) : (
        <div className="subscriptions-table-card">
          <div className="subscriptions-table-wrapper">
            <table className="subscriptions-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Cancellation</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscriptions.map(
                  (subscription) => {
                    const profile =
                      subscription.profiles;

                    const plan =
                      subscription.subscription_plans;

                    return (
                      <tr
                        key={
                          subscription.id
                        }
                      >
                        {/* Subscriber */}
                        <td>
                          <div className="subscription-user">
                            <div className="subscription-avatar">
                              {profile?.full_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </div>

                            <div className="subscription-user-details">
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

                        {/* Plan */}
                        <td>
                          <div className="subscription-plan">
                            <strong>
                              {getPlanLabel(
                                plan
                              )}
                            </strong>

                            <span>
                              {formatCurrency(
                                plan?.price
                              )}

                              {" / "}

                              {plan?.billing_interval ===
                                "yearly"
                                ? "year"
                                : "month"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <div
                            className={`subscription-status status-${subscription.status}`}
                          >
                            {getStatusIcon(
                              subscription.status
                            )}

                            <span>
                              {getStatusLabel(
                                subscription.status
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Period */}
                        <td>
                          <div className="subscription-period">
                            <div>
                              <CalendarDays
                                size={13}
                              />

                              <span>
                                {formatDate(
                                  subscription.current_period_start
                                )}
                              </span>
                            </div>

                            <span className="period-arrow">
                              →
                            </span>

                            <div>
                              <CalendarDays
                                size={13}
                              />

                              <span>
                                {formatDate(
                                  subscription.current_period_end
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cancellation */}
                        <td>
                          {subscription.cancel_at_period_end ? (
                            <span className="cancel-at-end">
                              Ends on{" "}
                              {subscription.current_period_end
                                ? new Date(
                                  subscription.current_period_end
                                ).toLocaleDateString("en-IN")
                                : "at period end"}
                            </span>
                          ) : (
                            <span className="not-cancelling">
                              Auto-renewing
                            </span>
                          )}

                        </td>

                        {/* Created */}
                        <td>
                          <span className="subscription-created">
                            {formatDate(
                              subscription.created_at
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}