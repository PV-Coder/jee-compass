import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme]       = useState(localStorage.getItem("jee_theme") || "light");

  const user = JSON.parse(localStorage.getItem("jee_user") || "null");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("jee_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => t === "light" ? "dark" : "light");

  const handleLogout = () => {
    localStorage.removeItem("jee_user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="navbar">
      <div className="container navbar__inner">

        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="navbar__logo">
          <span className="navbar__logo-icon">🧭</span>
          <span>Edu<strong>Pilot</strong></span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {user ? (
            <>
              <li><Link to="/dashboard"   className={isActive("/dashboard")   ? "active" : ""}>Dashboard</Link></li>
              <li><Link to="/subjects"    className={isActive("/subjects")    ? "active" : ""}>Subjects</Link></li>
              <li><Link to="/diagnostic"  className={isActive("/diagnostic")  ? "active" : ""}>Diagnostic</Link></li>
              <li><Link to="/analytics"   className={isActive("/analytics")   ? "active" : ""}>Analytics</Link></li>
              <li><Link to="/revision"    className={isActive("/revision")    ? "active" : ""}>Revision</Link></li>
              <li><Link to="/profile"     className={isActive("/profile")     ? "active" : ""}>Profile</Link></li>
              <li>
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
              </li>
              <li>
                <button className="navbar__logout" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
              </li>
              <li><Link to="/login"  className={`navbar__btn-link${isActive("/login")  ? " active" : ""}`}>Login</Link></li>
              <li><Link to="/signup" className="navbar__btn-signup">Sign Up</Link></li>
            </>
          )}
        </ul>

        {/* Hamburger */}
        <div className="navbar__right-mobile">
          <button className="theme-toggle" onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {user ? (
            <>
              <Link to="/dashboard"  onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/subjects"   onClick={() => setMenuOpen(false)}>Subjects</Link>
              <Link to="/diagnostic" onClick={() => setMenuOpen(false)}>Diagnostic</Link>
              <Link to="/analytics"  onClick={() => setMenuOpen(false)}>Analytics</Link>
              <Link to="/revision"   onClick={() => setMenuOpen(false)}>Revision</Link>
              <Link to="/profile"    onClick={() => setMenuOpen(false)}>Profile</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"  onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;