import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please login");
      }

      const response = await fetch(
        `${API_URL}/api/admin/users`,
        {
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load users"
        );
      }

      setUsers(result.users || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        Loading users...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>ADMIN PANEL</p>

          <h1>Users</h1>

          <p style={styles.subtitle}>
            Manage registered platform users.
          </p>
        </div>

        <div style={styles.count}>
          {users.length} Users
        </div>
      </div>

      <div style={styles.table}>

        <div style={styles.tableHeader}>
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Charity</span>
          <span>Joined</span>
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            style={styles.row}
          >

            <div style={styles.user}>
              <div style={styles.avatar}>
                {(user.full_name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <strong>
                {user.full_name || "Unnamed User"}
              </strong>
            </div>

            <span style={styles.muted}>
              {user.email}
            </span>

            <span
              style={{
                ...styles.badge,
                ...(user.role === "admin"
                  ? styles.admin
                  : {}),
              }}
            >
              {user.role}
            </span>

            <span style={styles.muted}>
              {user.charity_percentage || 10}%
            </span>

            <span style={styles.muted}>
              {new Date(
                user.created_at
              ).toLocaleDateString("en-IN")}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "35px",
    background: "#080909",
    color: "#fff",
  },

  center: {
    minHeight: "80vh",
    display: "grid",
    placeItems: "center",
    background: "#080909",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  eyebrow: {
    color: "#a3e635",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: 0,
  },

  subtitle: {
    color: "#888",
  },

  count: {
    background: "#161818",
    border: "1px solid #292b2b",
    padding: "10px 15px",
    borderRadius: "10px",
    color: "#a3e635",
  },

  table: {
    background: "#111313",
    border: "1px solid #242626",
    borderRadius: "18px",
    overflow: "hidden",
  },

  tableHeader: {
    display: "grid",
    gridTemplateColumns:
      "1.4fr 2fr .8fr .8fr 1fr",
    gap: "20px",
    padding: "18px 22px",
    color: "#777",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderBottom: "1px solid #252727",
  },

  row: {
    display: "grid",
    gridTemplateColumns:
      "1.4fr 2fr .8fr .8fr 1fr",
    gap: "20px",
    alignItems: "center",
    padding: "17px 22px",
    borderBottom: "1px solid #202222",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#242727",
    display: "grid",
    placeItems: "center",
    color: "#a3e635",
    fontWeight: 700,
  },

  muted: {
    color: "#999",
    fontSize: "14px",
  },

  badge: {
    display: "inline-block",
    width: "fit-content",
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#242626",
    color: "#aaa",
    fontSize: "11px",
    textTransform: "capitalize",
  },

  admin: {
    background: "#29351b",
    color: "#a3e635",
  },
};

export default Users;