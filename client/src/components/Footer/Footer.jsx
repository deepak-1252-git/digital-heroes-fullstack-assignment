import { Link } from "react-router-dom";
import {
  Heart,
} from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>DH</span>
              <strong>Digital Heroes</strong>
            </Link>

            <p>
              A performance-driven community where every subscription can
              create an impact beyond the game.
            </p>

            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <FaInstagram size={17} />
              </a>

              <a href="#" aria-label="Twitter">
                <FaTwitter size={17} />
              </a>

              <a href="#" aria-label="LinkedIn">
                <FaLinkedin size={17} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>

            <Link to="/how-it-works">How it works</Link>
            <Link to="/charities">Charities</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          <div className="footer-column">
            <h4>Account</h4>

            <Link to="/login">Login</Link>
            <Link to="/register">Create account</Link>
          </div>

          <div className="footer-column">
            <h4>Company</h4>

            <Link to="/">About us</Link>
            <Link to="/">Contact</Link>
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</span>

          <span className="footer-impact">
            <Heart size={14} />
            Play. Give. Participate.
          </span>
        </div>
      </div>
    </footer>
  );
}