import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import "./Auth.css";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/dashboard", { replace: true });
        return;
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [navigate]);

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

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (error) {
      setServerError(
        "Unable to sign in. Please check your email and password."
      );
      setLoading(false);
      return;
    }

    if (!data.session) {
      setServerError(
        "Your account needs to be verified before you can continue."
      );
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }

  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div className="auth-form-side" style={{ gridColumn: "1 / -1" }}>
          <div className="auth-card">
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <ShieldCheck size={27} />
              </div>

              <p>Checking your session...</p>
            </div>
          </div>
        </div>
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
            WELCOME BACK
          </div>

          <h1>
            Your game.
            <br />
            Your <span>impact.</span>
          </h1>

          <p>
            Sign in to manage your scores, charity contribution, membership
            and monthly draw participation.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <Check size={17} />
              Track your latest five scores
            </div>

            <div className="auth-benefit">
              <Check size={17} />
              Manage your chosen charity
            </div>

            <div className="auth-benefit">
              <Check size={17} />
              View your draw participation
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Sign in</h2>

            <p>
              Enter your details to access your Digital Heroes account.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div className="auth-error">
                {serverError}
              </div>
            )}

            {/* EMAIL */}
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>

              <div className="auth-input-wrapper">
                <input
                  id="login-email"
                  className={`auth-input ${errors.email ? "input-error" : ""
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
              <label htmlFor="login-password">Password</label>

              <div className="auth-input-wrapper">
                <input
                  id="login-password"
                  className={`auth-input ${errors.password ? "input-error" : ""
                    }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() => setShowPassword((value) => !value)}
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

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </section>
    </main>
  );
}