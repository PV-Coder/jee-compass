import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email)                          e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email  = "Enter a valid email.";
    if (!form.password)                        e.password = "Password is required.";
    else if (form.password.length < 6)         e.password = "Minimum 6 characters.";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    // Simulate auth — replace with real API call
    setTimeout(() => {
      const stored = JSON.parse(localStorage.getItem("jee_users") || "[]");
      const user   = stored.find((u) => u.email === form.email && u.password === form.password);
      if (user) {
        localStorage.setItem("jee_user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setApiError("Invalid email or password.");
      }
      setLoading(false);
    }, 800);
  };

  const features = [
    { icon: "🎯", text: "Chapter-wise diagnostic tests" },
    { icon: "📊", text: "Bloom's taxonomy performance analysis" },
    { icon: "💡", text: "AI-powered study recommendations" },
    { icon: "📈", text: "Track progress across attempts" },
  ];

  return (
    <div className="login-split">

      {/* ── Left branding panel ── */}
      <div className="login-split__left">
        <div className="login-split__left-inner">
          <Link to="/" className="login-brand">
            <span className="login-brand__icon">🧭</span>
            <span className="login-brand__name">Edu<strong>Pilot</strong></span>
          </Link>

          <div className="login-hero">
            <h2 className="login-hero__title">
              Your personalised path to <span>IIT</span> starts here.
            </h2>
            <p className="login-hero__sub">
              Join thousands of JEE aspirants using AI-powered learning analytics to study smarter.
            </p>
          </div>

          <ul className="login-features">
            {features.map((f, i) => (
              <li key={i} className="login-features__item">
                <span className="login-features__icon">{f.icon}</span>
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <div className="login-testimonial">
            <p>"EduPilot helped me identify my weak topics in Electrostatics within minutes."</p>
            <div className="login-testimonial__author">
              <div className="login-testimonial__avatar">A</div>
              <div>
                <strong>Arjun Sharma</strong>
                <span>IIT Delhi, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-split__right">
        <div className="login-form-wrap animate-fadeInUp">

          {/* Mobile logo */}
          <Link to="/" className="login-brand login-brand--mobile">
            <span className="login-brand__icon">🧭</span>
            <span className="login-brand__name">Edu<strong>Pilot</strong></span>
          </Link>

          <div className="login-form-header">
            <h1>Welcome back</h1>
            <p>Log in to your account to continue</p>
          </div>

          {apiError && (
            <div className="login-alert" role="alert">
              <span>⚠️</span> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Email */}
            <div className="lf-group">
              <label className="lf-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`lf-input${errors.email ? " lf-input--error" : ""}`}
                autoComplete="email"
              />
              {errors.email && <span className="lf-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="lf-group">
              <div className="lf-label-row">
                <label className="lf-label" htmlFor="password">Password</label>
                <Link to="#" className="lf-forgot">Forgot password?</Link>
              </div>
              <div className="lf-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`lf-input${errors.password ? " lf-input--error" : ""}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span className="lf-error">{errors.password}</span>}
            </div>

            <Button type="submit" fullWidth disabled={loading} size="lg">
              {loading ? (
                <span className="lf-spinner">⏳ Logging in…</span>
              ) : "Log in"}
            </Button>

          </form>

          {/* Divider */}
          <div className="lf-divider"><span>or</span></div>

          {/* Google-style SSO placeholder */}
          <button className="lf-google-btn" type="button" disabled>
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.2-17.7 10.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36.1 27 37 24 37c-6 0-10.6-3.1-11.8-7.5l-7 5.4C8.1 41.1 15.5 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.6 2.8-2.3 5.1-4.7 6.6l6.6 5.4C41.7 37.1 45 31 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Continue with Google
            <span className="lf-google-soon">Coming soon</span>
          </button>

          <p className="lf-signup-link">
            Don't have an account?{" "}
            <Link to="/signup">Sign up for free</Link>
          </p>

          <p className="lf-terms">
            By logging in, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
