import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Shield,
  UserRound,
  Mail,
  CalendarDays,
  Heart,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import Loader from "../../components/Loader/Loader";
import Badge from "../../components/Badge/Badge";

import "./Users.css";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoleLabel(role) {
  return role === "admin" ? "Administrator" : "Subscriber";
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setSuccess("");

      const { data, error: queryError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          role,
          selected_charity_id,
          charity_percentage,
          created_at,
          charities (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setUsers(data || []);
    } catch (err) {
      console.error("ADMIN USERS ERROR:", err);

      setError(
        err.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      setError("");
      setSuccess("");

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        throw new Error("Admin session not found.");
      }

      if (currentUser.id === userId && newRole !== "admin") {
        throw new Error(
          "You cannot remove your own admin role."
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role: newRole,
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user
        )
      );

      setSuccess("User role updated successfully.");
    } catch (err) {
      console.error("ROLE UPDATE ERROR:", err);

      setError(
        err.message || "Unable to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <span className="admin-page-eyebrow">
            Administration
          </span>

          <h1>Users</h1>

          <p>
            Manage registered subscribers and administrator
            accounts.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={() => loadUsers(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="users-alert users-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="users-alert users-alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="users-summary">
        <div className="users-summary-card">
          <div className="users-summary-icon">
            <UsersIcon />
          </div>

          <div>
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <UserRound size={19} />
          </div>

          <div>
            <strong>
              {users.filter(
                (user) => user.role === "subscriber"
              ).length}
            </strong>
            <span>Subscribers</span>
          </div>
        </div>

        <div className="users-summary-card">
          <div className="users-summary-icon">
            <Shield size={19} />
          </div>

          <div>
            <strong>
              {users.filter(
                (user) => user.role === "admin"
              ).length}
            </strong>
            <span>Administrators</span>
          </div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="users-filter">
          <ChevronDown size={16} />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
          >
            <option value="all">All Roles</option>
            <option value="subscriber">Subscribers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <div className="users-result-count">
        Showing <strong>{filteredUsers.length}</strong> of{" "}
        <strong>{users.length}</strong> users
      </div>

      {filteredUsers.length === 0 ? (
        <div className="users-empty">
          <UserRound size={32} />

          <h3>No users found</h3>

          <p>
            Try changing your search or role filter.
          </p>
        </div>
      ) : (
        <div className="users-table-card">
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Charity</th>
                  <th>Contribution</th>
                  <th>Joined</th>
                  <th>Manage</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>

                        <div className="user-details">
                          <strong>
                            {user.full_name || "Unnamed User"}
                          </strong>

                          <span>
                            <Mail size={13} />
                            {user.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "success"
                            : "default"
                        }
                      >
                        {user.role === "admin" ? (
                          <Shield size={13} />
                        ) : (
                          <UserRound size={13} />
                        )}

                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>

                    <td>
                      {user.charities?.name ? (
                        <div className="user-charity">
                          <Heart size={14} />
                          <span>
                            {user.charities.name}
                          </span>
                        </div>
                      ) : (
                        <span className="muted-text">
                          Not selected
                        </span>
                      )}
                    </td>

                    <td>
                      <strong>
                        {user.charity_percentage || 10}%
                      </strong>
                    </td>

                    <td>
                      <div className="user-date">
                        <CalendarDays size={14} />
                        {formatDate(user.created_at)}
                      </div>
                    </td>

                    <td>
                      <div className="role-control">
                        <select
                          value={user.role || "subscriber"}
                          disabled={
                            updatingId === user.id
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              user.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="subscriber">
                            Subscriber
                          </option>

                          <option value="admin">
                            Administrator
                          </option>
                        </select>

                        {updatingId === user.id && (
                          <RefreshCw
                            size={14}
                            className="spin"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersIcon() {
  return (
    <div className="users-icon-group">
      <UserRound size={17} />
      <UserRound size={12} />
    </div>
  );
}