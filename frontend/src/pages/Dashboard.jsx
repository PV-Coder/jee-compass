import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate  = useNavigate();
  const [user, setUser]       = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    const h = JSON.parse(localStorage.getItem("jee_test_history") || "[]");
    setHistory(h);
  }, [navigate]);

  if (!user) return null;

  const lastTest   = history[history.length - 1] || null;
  const bestScore  = history.length ? Math.max(...history.map((h) => h.score)) : 0;
  const avgScore   = history.length
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;

  const getScoreColor = (s) => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Welcome Banner */}
          <div className="dashboard__welcome animate-fadeInUp">
            <div>
              <h1>Welcome back, <span>{user.name.split(" ")[0]}</span> 👋</h1>
              <p>Ready to continue your JEE preparation? Take a diagnostic test to track your progress.</p>
            </div>
            <Button size="lg" onClick={() => navigate("/test")}>
              🚀 Start Diagnostic Test
            </Button>
          </div>

          {/* Stat Cards */}
          <div className="dashboard__stats animate-fadeInUp">
            <Card variant="stat">
              <span className="stat__label">Tests Taken</span>
              <span className="stat__value">{history.length}</span>
              <span className="stat__sub">Total attempts</span>
            </Card>
            <Card variant="stat">
              <span className="stat__label">Best Score</span>
              <span className="stat__value" style={{ color: getScoreColor(bestScore) }}>{bestScore}%</span>
              <span className="stat__sub">All time high</span>
            </Card>
            <Card variant="stat">
              <span className="stat__label">Average Score</span>
              <span className="stat__value" style={{ color: getScoreColor(avgScore) }}>{avgScore}%</span>
              <span className="stat__sub">Across all tests</span>
            </Card>
            <Card variant="stat">
              <span className="stat__label">Subject</span>
              <span className="stat__value" style={{ fontSize: "1.4rem" }}>⚡ Physics</span>
              <span className="stat__sub">Electrostatics</span>
            </Card>
          </div>

          <div className="dashboard__grid">
            {/* Chapters */}
            <Card className="animate-fadeInUp">
              <h2 className="section-title">📚 Chapters Available</h2>
              <div className="chapter-list">
                {[
                  { no: 1, name: "Electric Charges and Fields",         questions: 10 },
                  { no: 2, name: "Electrostatic Potential and Capacitance", questions: 10 },
                ].map((ch) => (
                  <div className="chapter-item" key={ch.no}>
                    <div className="chapter-item__info">
                      <span className="chapter-item__no">Ch {ch.no}</span>
                      <div>
                        <p className="chapter-item__name">{ch.name}</p>
                        <p className="chapter-item__meta">{ch.questions} questions</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/test")}>
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Tests */}
            <Card className="animate-fadeInUp">
              <h2 className="section-title">📋 Recent Tests</h2>
              {history.length === 0 ? (
                <div className="dashboard__empty">
                  <span>📝</span>
                  <p>No tests taken yet.</p>
                  <Button size="sm" onClick={() => navigate("/test")}>Take First Test</Button>
                </div>
              ) : (
                <div className="test-history">
                  {[...history].reverse().slice(0, 5).map((t, i) => (
                    <div className="test-history__item" key={i}>
                      <div>
                        <p className="test-history__date">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        <p className="test-history__detail">{t.correct}/{t.total} correct</p>
                      </div>
                      <span className="test-history__score" style={{ color: getScoreColor(t.score) }}>
                        {t.score}%
                      </span>
                    </div>
                  ))}
                  {lastTest && (
                    <Button size="sm" variant="outline" fullWidth onClick={() => navigate("/analysis")} style={{ marginTop: 12 }}>
                      View Last Analysis
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Progress Bar */}
          {lastTest && (
            <Card className="animate-fadeInUp dashboard__progress">
              <h2 className="section-title">📈 Last Test Performance</h2>
              <div className="progress-bar-wrap">
                <div className="progress-bar-label">
                  <span>Overall Score</span>
                  <span style={{ color: getScoreColor(lastTest.score) }}>{lastTest.score}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${lastTest.score}%`, background: getScoreColor(lastTest.score) }}
                  />
                </div>
              </div>
              <div className="dashboard__actions">
                <Button onClick={() => navigate("/analysis")}>View Full Analysis</Button>
                <Button variant="outline" onClick={() => navigate("/recommendations")}>Get Recommendations</Button>
              </div>
            </Card>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
