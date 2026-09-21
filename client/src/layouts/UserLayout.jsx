import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const UserLayout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const links = [
    { label: "Overview", path: "/dashboard" },
    { label: "My Scores", path: "/dashboard/scores" },
    { label: "Charity", path: "/dashboard/charity" },
    { label: "Draws", path: "/dashboard/draws" },
    { label: "Winnings", path: "/dashboard/winnings" },
    { label: "Subscription", path: "/dashboard/subscription" },
    { label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div style={styles.app}>

      <aside style={styles.sidebar}>

        <div style={styles.logo}>
          <span style={styles.logospan}>DH</span>
          <div>
            <strong>Digital</strong>
            <small style={styles.logosmall}>Heroes</small>
          </div>
        </div>

        <div style={styles.menu}>

          <p style={styles.sectionTitle}>
            MEMBER
          </p>

          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/dashboard"}
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.active : {}),
              })}
            >
              {link.label}
            </NavLink>
          ))}

        </div>

        <div style={styles.bottom}>

          <button
            style={styles.logout}
            onClick={logout}
          >
            Sign out
          </button>

        </div>

      </aside>


      <main style={styles.main}>
        <Outlet />
      </main>

    </div>
  );
};


const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#080909",
    color: "#fff",
  },

  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#101212",
    borderRight: "1px solid #252727",
    display: "flex",
    flexDirection: "column",
    padding: "25px 15px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    height: "100vh",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "5px 10px 30px",
  },

  logospan: {
    width: "38px",
    height: "38px",
    background: "#a3e635",
    color: "#111",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },

  logosmall: {
    display: "block",
    color: "#777",
    fontSize: "11px",
    marginTop: "2px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  sectionTitle: {
    color: "#555",
    fontSize: "10px",
    letterSpacing: "2px",
    margin: "5px 10px 10px",
  },

  link: {
    color: "#8c8c8c",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: "9px",
    fontSize: "14px",
    transition: "0.2s",
  },

  active: {
    background: "#1d2515",
    color: "#a3e635",
  },

  bottom: {
    marginTop: "auto",
  },

  logout: {
    width: "100%",
    padding: "11px",
    borderRadius: "9px",
    border: "1px solid #292b2b",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
  },

  main: {
    flex: 1,
    minWidth: 0,
    overflow: "auto",
  },
};

export default UserLayout;