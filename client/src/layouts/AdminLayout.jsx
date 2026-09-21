import {
  BarChart3,
  Building2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./AdminLayout.css";

const mainNavigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Subscriptions",
    path: "/admin/subscriptions",
    icon: CircleDollarSign,
  },
  {
    label: "Scores",
    path: "/admin/scores",
    icon: BarChart3,
  },
  {
    label: "Draws",
    path: "/admin/draws",
    icon: Gift,
  },
  {
    label: "Charities",
    path: "/admin/charities",
    icon: Building2,
  },
  {
    label: "Winners",
    path: "/admin/winners",
    icon: Trophy,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: FileText,
  },
];

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="admin-layout">
      <aside
        className={`admin-sidebar ${
          mobileOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-sidebar-top">
          <NavLink
            to="/admin"
            className="admin-brand"
            onClick={closeMobile}
          >
            <span className="admin-brand-mark">D</span>

            <div>
              <strong>DigitalHeroes</strong>
              <span>Administration</span>
            </div>
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={closeMobile}
            aria-label="Close admin navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-content">
          <div className="admin-system-badge">
            <ShieldCheck size={15} />

            <div>
              <strong>Admin mode</strong>
              <span>Full platform access</span>
            </div>
          </div>

          <p className="admin-nav-label">Management</p>

          <nav className="admin-nav">
            {mainNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `admin-sidebar-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={1.8} />

                  <span>{item.label}</span>

                  <ChevronRight
                    className="admin-link-arrow"
                    size={14}
                  />
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <NavLink
            to="/dashboard"
            className="admin-user-panel"
            onClick={closeMobile}
          >
            <span className="admin-user-avatar">
              A
            </span>

            <span className="admin-user-info">
              <strong>Administrator</strong>
              <small>View user panel</small>
            </span>
          </NavLink>

          <button
            type="button"
            className="admin-signout"
            onClick={handleSignOut}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}

      <div className="admin-main">
        <header className="admin-mobile-header">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin navigation"
          >
            <Menu size={21} />
          </button>

          <div className="admin-mobile-title">
            <span className="admin-brand-mark">D</span>

            <div>
              <strong>DigitalHeroes</strong>
              <span>Admin</span>
            </div>
          </div>

          <ShieldCheck size={19} />
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;