import {
  Home,
  BarChart3,
  Heart,
  Gift,
  Trophy,
  WalletCards,
  User,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import "./UserLayout.css";

const navigation = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: Home,
    end: true,
  },
  {
    label: "My Scores",
    path: "/dashboard/scores",
    icon: BarChart3,
  },
  {
    label: "Charity",
    path: "/dashboard/charity",
    icon: Heart,
  },
  {
    label: "My Draws",
    path: "/dashboard/draws",
    icon: Gift,
  },
  {
    label: "Winnings",
    path: "/dashboard/winnings",
    icon: Trophy,
  },
  {
    label: "Subscription",
    path: "/dashboard/subscription",
    icon: WalletCards,
  },
];

const accountNavigation = [
  {
    label: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
];

const UserLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={closeMobile}
        className={({ isActive }) =>
          `user-sidebar-link ${isActive ? "active" : ""}`
        }
      >
        <Icon size={18} strokeWidth={1.8} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="user-layout">
      <aside
        className={`user-sidebar ${mobileOpen ? "user-sidebar-open" : ""
          }`}
      >
        <div className="user-sidebar-top">
          <NavLink
            to="/dashboard"
            className="user-brand"
            onClick={closeMobile}
          >
            <span className="user-brand-mark">D</span>

            <span>
              Digital<span>Heroes</span>
            </span>
          </NavLink>

          <button
            className="user-sidebar-close"
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="user-sidebar-content">
          <div className="user-nav-section">
            <p className="user-nav-label">Workspace</p>

            <nav className="user-nav">
              {navigation.map(renderNavItem)}
            </nav>
          </div>

          <div className="user-nav-section">
            <p className="user-nav-label">Account</p>

            <nav className="user-nav">
              {accountNavigation.map(renderNavItem)}
            </nav>
          </div>
        </div>

        <div className="user-sidebar-bottom">
          <div className="user-impact-card">
            <Heart size={17} />

            <div>
              <strong>Make an impact</strong>
              <span>Your contribution matters.</span>
            </div>
          </div>

          <button
            className="user-signout"
            type="button"
            onClick={handleSignOut}
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="user-sidebar-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}

      <div className="user-main">
        <header className="user-mobile-header">
          <button
            className="user-menu-button"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <NavLink to="/dashboard" className="user-mobile-brand">
            <span className="user-brand-mark">D</span>
            <span>DigitalHeroes</span>
          </NavLink>

          <NavLink
            to="/dashboard/profile"
            className="user-mobile-profile"
            aria-label="Profile"
          >
            <User size={18} />
          </NavLink>
        </header>

        <main className="user-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;