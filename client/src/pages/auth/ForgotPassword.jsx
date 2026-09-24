import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Heart } from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./Auth.css";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Heart size={14} />
              PASSWORD RESET
            </div>

            <h1>
              Check your
              <br />
              <span>email.</span>
            </h1>

            <p>
              We sent you a password reset link. Open the email and
              follow the link to create a new password.
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-card">
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <Mail size={27} />
              </div>

              <h2>Check your email</h2>

              <p>
                We sent a password reset link to
              </p>

              <p className="auth-success-email">
                {email}
              </p>

              <Link
                to="/login"
                className="auth-submit"
                style={{
                  marginTop: "25px",
                  textDecoration: "none",
                }}
              >
                Back to sign in
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Heart size={14} />
            DIGITAL HEROES
          </div>

          <h1>
            Get back
            <br />
            <span>in.</span>
          </h1>

          <p>
            Enter your email and we'll send you a secure link
            to reset your password.
          </p>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Forgot password?</h2>

            <p>
              Enter the email address linked to your account.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="forgot-email">
                Email address
              </label>

              <div className="auth-input-wrapper">
                <input
                  id="forgot-email"
                  className={`auth-input ${
                    error ? "input-error" : ""
                  }`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                />

                <span className="auth-input-icon">
                  <Mail size={17} />
                </span>
              </div>
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Sending link...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}