import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import {supabase} from "../../lib/supabase";
import "./Auth.css";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  }

  function validate() {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Enter your full name.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    const email = form.email.trim().toLowerCase();
    const fullName = form.fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      setServerError(
        error.message || "Unable to create your account."
      );
      setLoading(false);
      return;
    }

    /*
     * When email confirmation is enabled,
     * Supabase returns a user but no active session.
     */
    if (data.user && !data.session) {
      setRegisteredEmail(email);
      setLoading(false);
      return;
    }

    /*
     * If email confirmation is disabled,
     * the user may already have a session.
     */
    if (data.session) {
      window.location.href = "/dashboard";
      return;
    }

    setRegisteredEmail(email);
    setLoading(false);
  }

  if (registeredEmail) {
    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-visual-badge">
              <Heart size={14} />
              ONE STEP TO GO
            </div>

            <h1>
              Your journey
              <br />
              starts <span>here.</span>
            </h1>

            <p>
              Your account has been created. Confirm your email and then sign
              in to continue.
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
                We sent a confirmation link to
              </p>

              <p className="auth-success-email">
                {registeredEmail}
              </p>

              <p style={{ marginTop: "12px" }}>
                Confirm your email address, then return here and sign in.
              </p>

              <Link
                to="/login"
                className="auth-submit"
                style={{
                  marginTop: "25px",
                  textDecoration: "none",
                }}
              >
                Go to sign in
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
      {/* VISUAL */}
      <section className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-badge">
            <Heart size={14} />
            JOIN DIGITAL HEROES
          </div>

          <h1>
            Play with
            <br />
            <span>purpose.</span>
          </h1>

          <p>
            Create your account and connect your golf performance with a cause
            you care about.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <Check size={17} />
              Choose your charity
            </div>

            <div className="auth-benefit">
              <Check size={17} />
              Track your latest five scores
            </div>

            <div className="auth-benefit">
              <Check size={17} />
              Participate in monthly draws
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Create account</h2>

            <p>
              Set up your Digital Heroes membership account.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="auth-error">
                {serverError}
              </div>
            )}

            {/* NAME */}
            <div className="auth-field">
              <label htmlFor="register-name">Full name</label>

              <div className="auth-input-wrapper">
                <input
                  id="register-name"
                  className={`auth-input ${
                    errors.fullName ? "input-error" : ""
                  }`}
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                />

                <span className="auth-input-icon">
                  <User size={17} />
                </span>
              </div>

              {errors.fullName && (
                <span className="auth-field-error">
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>

              <div className="auth-input-wrapper">
                <input
                  id="register-email"
                  className={`auth-input ${
                    errors.email ? "input-error" : ""
                  }`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />

                <span className="auth-input-icon">
                  <Mail size={17} />
                </span>
              </div>

              {errors.email && (
                <span className="auth-field-error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* PASSWORD */}
            <div className="auth-field">
              <label htmlFor="register-password">Password</label>

              <div className="auth-input-wrapper">
                <input
                  id="register-password"
                  className={`auth-input ${
                    errors.password ? "input-error" : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  style={{
                    border: 0,
                    background: "transparent",
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

              {errors.password && (
                <span className="auth-field-error">
                  {errors.password}
                </span>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="auth-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="auth-input-wrapper">
                <input
                  id="register-confirm-password"
                  className={`auth-input ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    border: 0,
                    background: "transparent",
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

              {errors.confirmPassword && (
                <span className="auth-field-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}