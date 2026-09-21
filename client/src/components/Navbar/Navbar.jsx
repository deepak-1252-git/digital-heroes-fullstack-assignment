import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo-mark">D</span>

          <span className="navbar-logo-text">
            Digital<span>Heroes</span>
          </span>
        </Link>

        <nav className={`navbar-nav ${mobileOpen ? "navbar-nav-open" : ""}`}>
          <Link to="/how-it-works" onClick={closeMenu}>
            How it works
          </Link>

          <Link to="/charities" onClick={closeMenu}>
            Charities
          </Link>

          <Link to="/pricing" onClick={closeMenu}>
            Pricing
          </Link>

          <div className="navbar-mobile-actions">
            <Link
              to="/login"
              className="navbar-login"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="navbar-cta"
              onClick={closeMenu}
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="navbar-login">
            Login
          </Link>

          <Link to="/register" className="navbar-cta">
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>

        <button
          className="navbar-menu-button"
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;