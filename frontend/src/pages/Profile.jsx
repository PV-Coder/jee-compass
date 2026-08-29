import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import "./Profile.css";

const Profile = () => {
  const navigate  = useNavigate();
  const [user,    setUser]    = useState(null);
  const [history, setHistory] = useState([]);

  const loadData = () => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    setHistory(JSON.parse(localStorage.getItem("jee_test_history") || "[]"));
  };

  useEffect(() => {
    loadData();
    // Refresh when localStorage changes (e.g. after completing a test)
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  if (!user) return null;

  const bestScore = history.length ? Math.max(...history.map((h) => h.score)) : 0;
  const avgScore  = history.length
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;

  const handleClearData = () => {
    if (window.confirm("Clear all test history? This cannot be undone.")) {
      localStorage.removeItem("jee_test_history");
      localStorage.removeItem("jee_last_analysis");
      setHistory([]);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          <div className="profile__grid animate-fadeInUp">
            {/* Profile Card */}
            <Card>
              <div className="profile__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="profile__name">{user.name}</h2>
              <p className="profile__email">{user.email}</p>
              <div className="profile__badge">JEE Aspirant 🎯</div>

              <div className="profile__stats">
                <div className="profile__stat">
                  <strong>{history.length}</strong>
                  <span>Tests</span>
                </div>
                <div className="profile__stat">
                  <strong>{bestScore}%</strong>
                  <span>Best</span>
                </div>
                <div className="profile__stat">
                  <strong>{avgScore}%</strong>
                  <span>Avg</span>
                </div>
              </div>

              <Button variant="danger" fullWidth onClick={handleClearData} style={{ marginTop: 20 }}>
                Clear Test History
              </Button>
            </Card>

            {/* Activity */}
            <div className="profile__activity">
              <Card>
                <h2 className="section-title">📊 Test History</h2>
                {history.length === 0 ? (
                  <div className="profile__empty">
                    <span>📝</span>
                    <p>No tests taken yet.</p>
                    <Button size="sm" onClick={() => navigate("/subjects")}>Take First Test</Button>
                  </div>
                ) : (
                  <div className="profile__history">
                    {[...history].reverse().map((t, i) => (
                      <div className="profile__history-item" key={i}>
                        <div className="profile__history-left">
                          <span className="profile__history-no">#{history.length - i}</span>
                          <div>
                            <p className="profile__history-date">
                              {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <p className="profile__history-detail">{t.correct}/{t.total} correct · {t.weakTopics?.length || 0} weak topics</p>
                          </div>
                        </div>
                        <span
                          className="profile__history-score"
                          style={{ color: t.score >= 70 ? "#22c55e" : t.score >= 40 ? "#f59e0b" : "#ef4444" }}
                        >
                          {t.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
