import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [validRecovery, setValidRecovery] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {

      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const searchParams = new URLSearchParams(
        window.location.search
      );

      const recoveryError =
        hashParams.get("error") ||
        searchParams.get("error");

      const recoveryErrorCode =
        hashParams.get("error_code") ||
        searchParams.get("error_code");

      const recoveryErrorDescription =
        hashParams.get("error_description") ||
        searchParams.get("error_description");

      if (recoveryError || recoveryErrorCode) {
        if (mounted) {
          setError(
            recoveryErrorDescription
              ? decodeURIComponent(
                recoveryErrorDescription.replace(/\+/g, " ")
              )
              : "This password reset link is invalid or has expired."
          );

          setValidRecovery(false);
          setCheckingSession(false);
        }

        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (event) => {
          if (!mounted) return;

          if (event === "PASSWORD_RECOVERY") {
            sessionStorage.setItem(
              "digitalHeroesPasswordRecovery",
              "true"
            );

            setValidRecovery(true);
            setCheckingSession(false);
          }
        }
      );

      const recoveryFlag =
        sessionStorage.getItem(
          "digitalHeroesPasswordRecovery"
        ) === "true";

      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) {
        subscription.unsubscribe();
        return;
      }

      if (sessionError) {
        setError(
          "Unable to verify the password reset session."
        );
        setValidRecovery(false);
        setCheckingSession(false);

        subscription.unsubscribe();
        return;
      }

      if (data.session && recoveryFlag) {
        setValidRecovery(true);
      } else {
        setValidRecovery(false);
      }

      setCheckingSession(false);

      return () => {
        subscription.unsubscribe();
      };
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!validRecovery) {
      setError(
        "Your password reset session is invalid or has expired."
      );
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setLoading(false);

      if (
        updateError.message
          ?.toLowerCase()
          .includes("expired")
      ) {
        setError(
          "This password reset link has expired. Please request a new one."
        );
      } else {
        setError(updateError.message);
      }

      return;
    }


    setSuccess(true);

    sessionStorage.removeItem(
      "digitalHeroesPasswordRecovery"
    );


    setTimeout(async () => {
      await supabase.auth.signOut();

      navigate("/login", {
        replace: true,
      });
    }, 1800);
  }


  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Heart size={14} />
              DIGITAL HEROES
            </div>

            <h1>
              Checking your
              <br />
              <span>reset link.</span>
            </h1>

            <p>
              Please wait while we securely verify your
              password reset request.
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-card">
            <div className="auth-success-state">
              <span className="auth-spinner" />

              <h2>
                Verifying reset link...
              </h2>

              <p>
                Please wait a moment.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!validRecovery) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Heart size={14} />
              PASSWORD RESET
            </div>

            <h1>
              Reset link
              <br />
              <span>expired.</span>
            </h1>

            <p>
              This password reset link is invalid or has
              expired. Request a new link to reset your
              password.
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-card">
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <LockKeyhole size={27} />
              </div>

              <h2>
                Invalid or expired link
              </h2>

              <p>
                {error ||
                  "This password reset link is invalid or has expired."}
              </p>

              <Link
                to="/forgot-password"
                className="auth-submit"
                style={{
                  marginTop: "25px",
                  textDecoration: "none",
                }}
              >
                Request new link
                <ArrowRight size={17} />
              </Link>

              <div
                className="auth-switch"
                style={{ marginTop: "18px" }}
              >
                Remember your password?{" "}
                <Link to="/login">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }


  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Heart size={14} />
              PASSWORD UPDATED
            </div>

            <h1>
              You're back
              <br />
              <span>in control.</span>
            </h1>

            <p>
              Your password has been successfully updated.
              You will be redirected to sign in.
            </p>
          </div>
        </section>

        <section className="auth-form-side">
          <div className="auth-card">
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <LockKeyhole size={27} />
              </div>

              <h2>
                Password updated
              </h2>

              <p>
                Your password has been changed
                successfully.
              </p>

              <div
                style={{
                  marginTop: "20px",
                  fontSize: "14px",
                  opacity: 0.7,
                }}
              >
                Redirecting to sign in...
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="auth-page">
      {/* VISUAL */}
      <section className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Heart size={14} />
            DIGITAL HEROES
          </div>

          <h1>
            Create a
            <br />
            <span>new password.</span>
          </h1>

          <p>
            Choose a strong new password for your
            Digital Heroes account.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>
              Reset password
            </h2>

            <p>
              Enter your new password below.
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

            {/* NEW PASSWORD */}
            <div className="auth-field">
              <label htmlFor="reset-password">
                New password
              </label>

              <div className="auth-input-wrapper">
                <input
                  id="reset-password"
                  className="auth-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    border: 0,
                    background:
                      "transparent",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="reset-confirm-password">
                Confirm new password
              </label>

              <div className="auth-input-wrapper">
                <input
                  id="reset-confirm-password"
                  className="auth-input"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    border: 0,
                    background:
                      "transparent",
                    cursor: "pointer",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Updating password...
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Remember your password?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}