import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import { SUBJECTS, BADGES, getMasteryLevel } from "../data/curriculum";
import "./Dashboard.css";

const sc = (s) => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";

const Dashboard = () => {
  const navigate  = useNavigate();
  const [user, setUser]       = useState(null);
  const [history, setHistory] = useState([]);
  const [xp, setXp]           = useState(0);
  const [streak, setStreak]   = useState(0);
  const [badges, setBadges]   = useState([]);

  const loadData = () => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    const h = JSON.parse(localStorage.getItem("jee_test_history") || "[]");
    setHistory(h);
    setXp(JSON.parse(localStorage.getItem("jee_xp") || "0"));
    setStreak(JSON.parse(localStorage.getItem("jee_streak") || "0"));

    // Compute earned badges
    const subjectTests = {};
    h.forEach((t) => {
      if (t.subject) subjectTests[t.subject] = (subjectTests[t.subject] || 0) + 1;
    });
    const stats = {
      totalTests: h.length,
      bestScore: h.length ? Math.max(...h.map((t) => t.score)) : 0,
      streak: JSON.parse(localStorage.getItem("jee_streak") || "0"),
      xp: JSON.parse(localStorage.getItem("jee_xp") || "0"),
      subjectTests,
    };
    setBadges(BADGES.filter((b) => b.condition(stats)));
  };

  useEffect(() => {
    loadData();
    // Refresh when localStorage changes (e.g. after completing a test)
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  if (!user) return null;

  const totalTests = history.length;
  const bestScore  = totalTests ? Math.max(...history.map((h) => h.score)) : 0;
  const avgScore   = totalTests
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / totalTests) : 0;
  const lastTest   = history[history.length - 1] || null;
  const mastery    = getMasteryLevel(avgScore);

  const getScoreColor = sc;
  const subjectList = Object.values(SUBJECTS);
  const diagDone = !!localStorage.getItem("jee_diagnostic_result");

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Welcome Banner */}
          <div className="dashboard__welcome animate-fadeInUp">
            <div className="dashboard__welcome-left">
              <div className="dashboard__avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>Welcome back, <span>{user.name.split(" ")[0]}</span> 👋</h1>
                <p>Ready to continue your CBSE Class 12 preparation?</p>
                <div className="dashboard__welcome-badges">
                  {streak > 0 && (
                    <span className="streak-badge">🔥 {streak} Day Streak</span>
                  )}
                  <span className="pill pill--blue">⭐ {xp} XP</span>
                  <span className="pill" style={{ background: mastery.color + "22", color: mastery.color }}>
                    {mastery.label}
                  </span>
                </div>
              </div>
            </div>
            <Button size="lg" onClick={() => navigate("/subjects")}>
              📚 Choose Subject
            </Button>
          </div>

          {/* Stat Cards */}
          <div className="dashboard__stats animate-fadeInUp">
            <Card variant="stat">
              <span className="stat__label">Tests Taken</span>
              <span className="stat__value">{totalTests}</span>
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
              <span className="stat__label">Total XP</span>
              <span className="stat__value" style={{ color: "#f59e0b" }}>⭐ {xp}</span>
              <span className="stat__sub">Experience points</span>
            </Card>
          </div>

          {/* Diagnostic CTA — shown until diagnostic is done */}
          {!diagDone && (
            <div className="dashboard__diag-cta animate-fadeInUp">
              <div className="dashboard__diag-left">
                <span>🧪</span>
                <div>
                  <strong>Take the Diagnostic Test</strong>
                  <p>50-minute subject-wise test to identify your strengths and weaknesses.</p>
                </div>
              </div>
              <Button onClick={() => navigate("/diagnostic")}>Start Diagnostic →</Button>
            </div>
          )}

          {/* Subject Cards */}
          <div className="dashboard__section animate-fadeInUp">
            <div className="dashboard__section-header">
              <h2 className="section-title">📚 Subjects</h2>
              <button className="dashboard__see-all" onClick={() => navigate("/subjects")}>View All →</button>
            </div>
            <div className="dashboard__subjects">
              {subjectList.map((s) => {
                const subTests = history.filter((h) => h.subjectId === s.id || h.subject === s.id);
                const subAvg   = subTests.length
                  ? Math.round(subTests.reduce((a, h) => a + h.score, 0) / subTests.length) : 0;
                const progress = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}");
                const chapDone = s.chapters.filter((ch) => (progress[`${s.id}_ch${ch.id}`] || 0) >= 40).length;
                return (
                  <div key={s.id} className="subject-card" style={{ "--subject-color": s.color }}>
                    <div className="subject-card__header" style={{ background: s.gradient }}
                      onClick={() => navigate(`/subjects/${s.id}`)}
                      role="button" tabIndex={0}>
                      <span className="subject-card__icon">{s.icon}</span>
                      <div>
                        <h3>{s.name}</h3>
                        <p>{chapDone}/{s.chapters.length} chapters done</p>
                      </div>
                    </div>
                    <div className="subject-card__body">
                      <div className="subject-card__stat">
                        <span>{subTests.length} quizzes</span>
                        <span style={{ color: getScoreColor(subAvg), fontWeight: 700 }}>
                          {subAvg > 0 ? `${subAvg}%` : "Not started"}
                        </span>
                      </div>
                      <div className="progress-bar progress-bar--sm">
                        <div className="progress-bar__fill" style={{ width: `${subAvg}%`, background: s.color }} />
                      </div>
                      <div className="subject-card__links">
                        <button onClick={() => navigate(`/subjects/${s.id}`)}>📖 Chapters</button>
                        <button onClick={() => navigate(`/dashboard/${s.id}`)}>📊 Dashboard</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard__grid">
            {/* Recent Tests */}
            <Card className="animate-fadeInUp">
              <h2 className="section-title">📋 Recent Tests</h2>
              {history.length === 0 ? (
                <div className="dashboard__empty">
                  <span>📝</span>
                  <p>No tests taken yet.</p>
                  <Button size="sm" onClick={() => navigate("/subjects")}>Start First Test</Button>
                </div>
              ) : (
                <div className="test-history">
                  {[...history].reverse().slice(0, 5).map((t, i) => {
                    const subj = t.subject ? SUBJECTS[t.subject] : null;
                    return (
                      <div className="test-history__item" key={i}>
                        <div>
                          <p className="test-history__date">
                            {new Date(t.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                          <p className="test-history__detail">
                            {subj ? `${subj.icon} ${subj.name}` : "⚡ Physics"} · {t.correct}/{t.total} correct
                          </p>
                        </div>
                        <span className="test-history__score" style={{ color: getScoreColor(t.score) }}>
                          {t.score}%
                        </span>
                      </div>
                    );
                  })}
                  {lastTest && (
                    <Button size="sm" variant="outline" fullWidth
                      onClick={() => navigate("/revision")} style={{ marginTop: 12 }}>
                      🔁 Smart Revision
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Badges */}
            <Card className="animate-fadeInUp">
              <h2 className="section-title">🏅 Badges Earned</h2>
              {badges.length === 0 ? (
                <div className="dashboard__empty">
                  <span>🏅</span>
                  <p>Complete tests to earn badges!</p>
                </div>
              ) : (
                <div className="badges-grid">
                  {badges.map((b) => (
                    <div key={b.id} className="badge-item" title={b.desc}>
                      <span className="badge-item__icon">{b.icon}</span>
                      <span className="badge-item__name">{b.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="badges-locked">
                <p className="badges-locked__label">Locked Badges</p>
                <div className="badges-grid">
                  {BADGES.filter((b) => !badges.find((eb) => eb.id === b.id))
                    .slice(0, 4).map((b) => (
                    <div key={b.id} className="badge-item badge-item--locked" title={b.desc}>
                      <span className="badge-item__icon">🔒</span>
                      <span className="badge-item__name">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Last Test Progress */}
          {lastTest && (
            <Card className="animate-fadeInUp dashboard__progress">
              <h2 className="section-title">📈 Last Test Performance</h2>
              <div className="progress-bar-wrap">
                <div className="progress-bar-label">
                  <span>Overall Score</span>
                  <span style={{ color: getScoreColor(lastTest.score) }}>{lastTest.score}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill"
                    style={{ width: `${lastTest.score}%`, background: getScoreColor(lastTest.score) }} />
                </div>
              </div>
              <div className="dashboard__actions">
                <Button onClick={() => navigate("/analytics")}>📊 Analytics</Button>
                <Button variant="outline" onClick={() => navigate("/revision")}>🔁 Smart Revision</Button>
                <Button variant="outline" onClick={() => navigate("/diagnostic")}>🧪 Diagnostic Test</Button>
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
