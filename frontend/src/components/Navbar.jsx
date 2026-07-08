import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("jee_user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("jee_user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="navbar__logo">
          <span className="navbar__logo-icon">🧭</span>
          <span>JEE <strong>Compass</strong></span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar__links">
          {user ? (
            <>
              <li><Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>Dashboard</Link></li>
              <li><Link to="/test"      className={isActive("/test")      ? "active" : ""}>Test</Link></li>
              <li><Link to="/analysis"  className={isActive("/analysis")  ? "active" : ""}>Analysis</Link></li>
              <li><Link to="/recommendations" className={isActive("/recommendations") ? "active" : ""}>Recommendations</Link></li>
              <li><Link to="/profile"   className={isActive("/profile")   ? "active" : ""}>Profile</Link></li>
              <li>
                <button className="navbar__logout" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login"  className={`navbar__btn-link${isActive("/login")  ? " active" : ""}`}>Login</Link></li>
              <li><Link to="/signup" className="navbar__btn-signup">Sign Up</Link></li>
            </>
          )}
        </ul>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          {user ? (
            <>
              <Link to="/dashboard"      onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/test"           onClick={() => setMenuOpen(false)}>Test</Link>
              <Link to="/analysis"       onClick={() => setMenuOpen(false)}>Analysis</Link>
              <Link to="/recommendations" onClick={() => setMenuOpen(false)}>Recommendations</Link>
              <Link to="/profile"        onClick={() => setMenuOpen(false)}>Profile</Link>
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
