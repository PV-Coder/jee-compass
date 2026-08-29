import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import InputField from "../components/InputField";
import Button from "../components/Button";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                       e.name     = "Full name is required.";
    if (!form.email)                             e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = "Enter a valid email.";
    if (!form.password)                          e.password = "Password is required.";
    else if (form.password.length < 6)           e.password = "Minimum 6 characters.";
    if (!form.confirm)                           e.confirm  = "Please confirm your password.";
    else if (form.confirm !== form.password)     e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("jee_users") || "[]");
      if (users.find((u) => u.email === form.email)) {
        setErrors({ email: "Email already registered." });
        setLoading(false);
        return;
      }
      const newUser = { name: form.name, email: form.email, password: form.password };
      users.push(newUser);
      localStorage.setItem("jee_users", JSON.stringify(users));
      localStorage.setItem("jee_user", JSON.stringify(newUser));
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="auth-page">
        <div className="auth-card animate-fadeInUp">
          <div className="auth-card__header">
            <span className="auth-card__icon">🧭</span>
            <h1>Create Account</h1>
            <p>Join thousands of JEE aspirants on EduPilot today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              error={errors.name}
              required
            />
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
            />
            <InputField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              error={errors.password}
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Re-enter password"
              error={errors.confirm}
              required
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Creating account…" : "Register"}
            </Button>
          </form>

          <p className="auth-card__footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
