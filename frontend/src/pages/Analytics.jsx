import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  LineChart, Line,
} from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SUBJECTS, BLOOM_LEVELS, MASTERY_LEVELS, getMasteryLevel } from "../data/curriculum";
import "./Analytics.css";

/* ── Helpers ─────────────────────────────────────────────── */
const fmtTime = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;

/* ── Circular Ring ───────────────────────────────────────── */
const Ring = ({ value, max = 100, size = 100, stroke = 8, color, label, sub }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(value / max, 1);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <div className="ring-wrap__label">
        <span className="ring-wrap__value" style={{ color, fontSize: size < 90 ? "1rem" : "1.4rem" }}>{label}</span>
        {sub && <span className="ring-wrap__sub">{sub}</span>}
      </div>
    </div>
  );
};

/* ── Mastery Stars ───────────────────────────────────────── */
const MasteryStars = ({ stars }) => (
  <div className="mastery-stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`mastery-star${s > stars ? " mastery-star--empty" : ""}`}>⭐</span>
    ))}
  </div>
);

/* ── Radar Placeholder (pure SVG polygon) ────────────────── */
const RadarPlaceholder = ({ data }) => {
  const cx = 130, cy = 130, r = 100;
  const n  = data.length;
  const angles = data.map((_, i) => (i * 2 * Math.PI) / n - Math.PI / 2);
  const gridLevels = [0.25, 0.5, 0.75, 1];

  const pt = (angle, radius) => [
    cx + radius * Math.cos(angle),
    cy + radius * Math.sin(angle),
  ];

  const dataPoints = data.map((d, i) => pt(angles[i], (d.score / 100) * r));
  const polyPts    = dataPoints.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <svg viewBox="0 0 260 260" className="radar-svg">
      {/* Grid rings */}
      {gridLevels.map((lvl) => {
        const pts = angles.map((a) => pt(a, lvl * r)).map(([x,y]) => `${x},${y}`).join(" ");
        return <polygon key={lvl} points={pts} fill="none" stroke="var(--border)" strokeWidth="1" />;
      })}
      {/* Spokes */}
      {angles.map((a, i) => {
        const [x, y] = pt(a, r);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={polyPts} fill="var(--primary)" fillOpacity="0.2" stroke="var(--primary)" strokeWidth="2" />
      {/* Data dots */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={data[i].color} stroke="#fff" strokeWidth="2" />
      ))}
      {/* Labels */}
      {data.map((d, i) => {
        const [x, y] = pt(angles[i], r + 18);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="700" fill={d.color} fontFamily="Poppins">
            {d.level}
          </text>
        );
      })}
    </svg>
  );
};

/* ── Bloom Mastery Card ───────────────────────────────────── */
const BloomMasteryCard = ({ bloom, agg }) => {
  const mastery = getMasteryLevel(bloom.score);
  const icons   = { Remember: "🟢", Understand: "🔵", Apply: "🟠", Analyze: "🔴" };
  return (
    <div className="bmc" style={{ borderTopColor: bloom.color }}>
      <div className="bmc__top">
        <span className="bmc__icon">{icons[bloom.level]}</span>
        <div>
          <p className="bmc__level" style={{ color: bloom.color }}>{bloom.level}</p>
          <p className="bmc__mastery" style={{ color: mastery.color }}>{mastery.label}</p>
        </div>
        <Ring value={bloom.score} color={bloom.color} size={64} stroke={6} label={`${bloom.score}%`} />
      </div>
      <MasteryStars stars={mastery.stars} />
      <div className="progress-bar progress-bar--sm" style={{ margin: "10px 0 8px" }}>
        <div className="progress-bar__fill" style={{ width: `${bloom.score}%`, background: bloom.color }} />
      </div>
      <div className="bmc__stats">
        <span style={{ color: "#22c55e" }}>✅ {agg.correct}</span>
        <span style={{ color: "#ef4444" }}>❌ {agg.total - agg.correct}</span>
        <span style={{ color: "var(--text-muted)" }}>📝 {agg.total}</span>
      </div>
      {/* Mastery level ladder */}
      <div className="bmc__ladder">
        {MASTERY_LEVELS.map((m) => (
          <div key={m.label}
            className={`bmc__rung${mastery.label === m.label ? " bmc__rung--active" : ""}`}
            style={{ background: mastery.label === m.label ? m.color : "var(--border)",
                     color: mastery.label === m.label ? "#fff" : "var(--text-muted)" }}>
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
const Analytics = () => {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setTab]   = useState("dashboard");

  const loadData = () => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    const h = JSON.parse(localStorage.getItem("jee_test_history") || "[]");
    setHistory(h);
  };

  useEffect(() => {
    loadData();
    // Refresh when localStorage changes (e.g. after completing a test)
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  if (!user) return null;

  /* ── Global stats ────────────────────────────────────── */
  const totalTests     = history.length;
  const totalQuestions = history.reduce((s, h) => s + (h.total || 0), 0);
  const totalCorrect   = history.reduce((s, h) => s + (h.correct || 0), 0);
  const totalIncorrect = totalQuestions - totalCorrect;
  const accuracy       = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgTime        = totalTests > 0
    ? Math.round(history.reduce((s, h) => s + (h.totalTime || 0), 0) / totalTests)
    : 0;
  const chaptersCompleted = new Set(history.map((h) => `${h.subject}-${h.chapterId}`)).size;
  const bestScore      = totalTests ? Math.max(...history.map((h) => h.score)) : 0;
  const avgScore       = totalTests ? Math.round(history.reduce((s, h) => s + h.score, 0) / totalTests) : 0;
  const totalXP        = JSON.parse(localStorage.getItem("jee_xp") || "0");
  const streak         = JSON.parse(localStorage.getItem("jee_streak") || "0");
  const mastery        = getMasteryLevel(avgScore);

  /* ── Bloom aggregate ─────────────────────────────────── */
  const bloomAgg = {};
  BLOOM_LEVELS.forEach((b) => { bloomAgg[b.id] = { correct: 0, total: 0 }; });
  history.forEach((h) => {
    if (!h.bloomMap) return;
    Object.entries(h.bloomMap).forEach(([level, { correct, total }]) => {
      if (!bloomAgg[level]) bloomAgg[level] = { correct: 0, total: 0 };
      bloomAgg[level].correct += correct;
      bloomAgg[level].total   += total;
    });
  });

  const bloomData = BLOOM_LEVELS.map((b) => {
    const agg = bloomAgg[b.id] || { correct: 0, total: 0 };
    const pct = agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
    return { level: b.id, score: pct, color: b.color, bg: b.bg };
  });

  const strongestBloom = [...bloomData].sort((a, b) => b.score - a.score)[0];
  const weakestBloom   = [...bloomData].sort((a, b) => a.score - b.score)[0];

  /* ── Trend & subjects ────────────────────────────────── */
  const trendData = [...history].slice(-7).map((h, i) => ({
    test: `T${i+1}`,
    score: h.score,
    date: new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  const subjectStats = Object.values(SUBJECTS).map((s) => {
    const sub = history.filter((h) => h.subject === s.id);
    const avg = sub.length ? Math.round(sub.reduce((a, h) => a + h.score, 0) / sub.length) : 0;
    return { ...s, tests: sub.length, avg };
  });

  const tabs = ["dashboard", "bloom", "subjects", "trend"];
  const tabLabels = { dashboard: "📊 Dashboard", bloom: "🧠 Bloom", subjects: "📚 Subjects", trend: "📈 Trend" };

  /* ── Stat cards config ───────────────────────────────── */
  const statCards = [
    { icon: "📝", label: "Total Questions", value: totalQuestions, color: "#2563eb" },
    { icon: "✅", label: "Correct Answers",  value: totalCorrect,   color: "#22c55e" },
    { icon: "❌", label: "Incorrect",        value: totalIncorrect, color: "#ef4444" },
    { icon: "🎯", label: "Accuracy",         value: `${accuracy}%`, color: "#8b5cf6" },
    { icon: "⏱",  label: "Avg Time / Test",  value: fmtTime(avgTime), color: "#f59e0b" },
    { icon: "📖", label: "Chapters Done",    value: chaptersCompleted, color: "#0ea5e9" },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="analytics__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">📊 Student Analytics</h1>
              <p className="section-sub">Track your learning performance across all dimensions.</p>
            </div>
            <button className="subjects__back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          </div>

          {/* Tabs */}
          <div className="analytics__tabs animate-fadeInUp">
            {tabs.map((t) => (
              <button key={t}
                className={`analytics__tab${activeTab === t ? " analytics__tab--active" : ""}`}
                onClick={() => setTab(t)}>
                {tabLabels[t]}
              </button>
            ))}
          </div>

          {/* ══ DASHBOARD TAB ══════════════════════════════ */}
          {activeTab === "dashboard" && (
            <>
              {/* Stat Cards */}
              <div className="sa__stat-grid animate-fadeInUp">
                {statCards.map((s, i) => (
                  <div key={i} className="sa__stat-card" style={{ "--card-color": s.color }}
                    style={{ borderTopColor: s.color }}>
                    <div className="sa__stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div className="sa__stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="sa__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Mastery Banner */}
              <div className="analytics__mastery-banner animate-fadeInUp"
                style={{ background: `linear-gradient(135deg, ${mastery.color}18, ${mastery.color}35)`,
                         borderColor: mastery.color }}>
                <div className="analytics__mastery-left">
                  <Ring value={avgScore} color={mastery.color} size={110} stroke={10}
                    label={`${avgScore}%`} sub="Avg Score" />
                  <div>
                    <p className="analytics__mastery-level" style={{ color: mastery.color }}>{mastery.label}</p>
                    <MasteryStars stars={mastery.stars} />
                    <p className="analytics__mastery-hint">
                      {avgScore < 80 ? `${80 - avgScore}% more to reach next level` : "You've reached Master level! 🎉"}
                    </p>
                  </div>
                </div>
                <div className="analytics__mastery-right">
                  {[
                    { icon: "🔥", val: streak,      label: "Day Streak" },
                    { icon: "⭐", val: totalXP,      label: "Total XP" },
                    { icon: "📝", val: totalTests,   label: "Tests Taken" },
                    { icon: "🏆", val: `${bestScore}%`, label: "Best Score" },
                  ].map((s, i) => (
                    <div key={i} className="analytics__mastery-stat">
                      <span>{s.icon}</span>
                      <strong>{s.val}</strong>
                      <small>{s.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accuracy Ring + Progress Bars */}
              <div className="sa__overview-row animate-fadeInUp">
                <div className="analytics__chart-card sa__accuracy-card">
                  <h3 className="section-title">🎯 Overall Accuracy</h3>
                  <div className="sa__accuracy-center">
                    <Ring value={accuracy} color={accuracy >= 70 ? "#22c55e" : accuracy >= 40 ? "#f59e0b" : "#ef4444"}
                      size={140} stroke={12} label={`${accuracy}%`} sub="Accuracy" />
                  </div>
                  <div className="sa__acc-bars">
                    {[
                      { label: "Correct",   val: totalCorrect,   max: totalQuestions, color: "#22c55e" },
                      { label: "Incorrect", val: totalIncorrect, max: totalQuestions, color: "#ef4444" },
                    ].map((b) => (
                      <div key={b.label} className="sa__bar-row">
                        <span className="sa__bar-label">{b.label}</span>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-bar__fill"
                            style={{ width: totalQuestions > 0 ? `${(b.val / totalQuestions) * 100}%` : "0%",
                                     background: b.color }} />
                        </div>
                        <span className="sa__bar-val" style={{ color: b.color }}>{b.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bloom Rings */}
                <div className="analytics__chart-card sa__bloom-rings-card">
                  <h3 className="section-title">🧠 Bloom Level Rings</h3>
                  <div className="analytics__rings" style={{ marginBottom: 0 }}>
                    {bloomData.map((b) => (
                      <div key={b.level} className="analytics__ring-card"
                        style={{ borderColor: b.color + "44", background: b.bg }}>
                        <Ring value={b.score} color={b.color} size={80} stroke={7} label={`${b.score}%`} />
                        <p className="analytics__ring-label">{b.level}</p>
                        <span className="analytics__ring-status"
                          style={{ color: b.score >= 70 ? "#22c55e" : b.score >= 40 ? "#f59e0b" : "#ef4444" }}>
                          {b.score >= 70 ? "Strong" : b.score >= 40 ? "Average" : "Weak"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insight Cards */}
              <div className="analytics__insights animate-fadeInUp">
                {[
                  { cls: "--green",  icon: "💪", title: "Strongest Skill",    body: `${strongestBloom?.level || "—"} (${strongestBloom?.score || 0}%)` },
                  { cls: "--red",    icon: "⚠️", title: "Needs Attention",    body: `${weakestBloom?.level || "—"} (${weakestBloom?.score || 0}%)` },
                  { cls: "--blue",   icon: "🎯", title: "Recommended Focus",  body: `Practice more ${weakestBloom?.level} level questions` },
                  { cls: "--purple", icon: "📈", title: "Study Tip",
                    body: avgScore < 40 ? "Start with Remember level — build your foundation first."
                        : avgScore < 70 ? "Focus on Apply level questions to boost your score."
                        : "Challenge yourself with Analyze level questions." },
                ].map((c, i) => (
                  <div key={i} className={`analytics__insight analytics__insight${c.cls}`}>
                    <span>{c.icon}</span>
                    <div><strong>{c.title}</strong><p>{c.body}</p></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ BLOOM TAB ══════════════════════════════════ */}
          {activeTab === "bloom" && (
            <div className="animate-fadeInUp">
              {/* Radar + Progress Bars */}
              <div className="analytics__bloom-grid">
                <div className="analytics__chart-card">
                  <h3 className="section-title">🕸 Bloom Skill Radar</h3>
                  <div className="sa__radar-wrap">
                    <RadarPlaceholder data={bloomData} />
                  </div>
                  <div className="sa__radar-legend">
                    {bloomData.map((b) => (
                      <span key={b.level} className="sa__radar-dot" style={{ color: b.color }}>
                        ● {b.level} {b.score}%
                      </span>
                    ))}
                  </div>
                </div>

                <div className="analytics__chart-card">
                  <h3 className="section-title">📊 Bloom Progress Bars</h3>
                  <div className="sa__bloom-bars">
                    {bloomData.map((b) => {
                      const agg = bloomAgg[b.level] || { correct: 0, total: 0 };
                      return (
                        <div key={b.level} className="sa__bloom-bar-item">
                          <div className="sa__bloom-bar-header">
                            <span style={{ color: b.color, fontWeight: 700 }}>{b.level}</span>
                            <span style={{ color: b.color, fontWeight: 800 }}>{b.score}%</span>
                          </div>
                          <div className="progress-bar progress-bar--lg">
                            <div className="progress-bar__fill" style={{ width: `${b.score}%`, background: b.color }} />
                          </div>
                          <div className="sa__bloom-bar-meta">
                            <span>✅ {agg.correct} correct</span>
                            <span>❌ {agg.total - agg.correct} wrong</span>
                            <span>📝 {agg.total} total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bloom Mastery Cards */}
              <h3 className="section-title" style={{ marginBottom: 16 }}>🏅 Bloom Mastery Cards</h3>
              <div className="sa__bmc-grid">
                {bloomData.map((b) => (
                  <BloomMasteryCard key={b.level} bloom={b} agg={bloomAgg[b.level] || { correct: 0, total: 0 }} />
                ))}
              </div>
            </div>
          )}

          {/* ══ SUBJECTS TAB ═══════════════════════════════ */}
          {activeTab === "subjects" && (
            <div className="animate-fadeInUp">
              <div className="analytics__subject-cards">
                {subjectStats.map((s) => {
                  const m = getMasteryLevel(s.avg);
                  return (
                    <div key={s.id} className="subject-analytics-card">
                      <div className="subject-analytics-card__header" style={{ background: s.gradient }}>
                        <span className="subject-analytics-card__icon">{s.icon}</span>
                        <div>
                          <h3>{s.name}</h3>
                          <p>{s.tests} tests taken</p>
                        </div>
                        <Ring value={s.avg} color="#fff" size={70} stroke={6} label={`${s.avg}%`} />
                      </div>
                      <div className="subject-analytics-card__body">
                        <div className="subject-analytics-card__mastery">
                          <span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>
                          <MasteryStars stars={m.stars} />
                        </div>
                        <div className="progress-bar">
                          <div className="progress-bar__fill" style={{ width: `${s.avg}%`, background: s.color }} />
                        </div>
                        <div className="subject-analytics-card__actions">
                          <button className="chapter-card__btn chapter-card__btn--primary"
                            style={{ background: s.gradient }} onClick={() => navigate("/subjects")}>
                            Practice {s.name}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="analytics__chart-card">
                <h3 className="section-title">📊 Subject Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={subjectStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                    <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]}
                      contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 13,
                        background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="avg" radius={[6,6,0,0]} barSize={48}>
                      {subjectStats.map((s) => <Cell key={s.id} fill={s.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ══ TREND TAB ══════════════════════════════════ */}
          {activeTab === "trend" && (
            <div className="animate-fadeInUp">
              {trendData.length === 0 ? (
                <div className="analytics__empty">
                  <span>📈</span>
                  <h3>No test history yet</h3>
                  <p>Take some tests to see your progress trend.</p>
                  <button className="chapter-card__btn chapter-card__btn--primary"
                    style={{ background: "var(--primary)", maxWidth: 200, margin: "0 auto" }}
                    onClick={() => navigate("/subjects")}>
                    Start a Test
                  </button>
                </div>
              ) : (
                <>
                  <div className="analytics__chart-card">
                    <h3 className="section-title">📈 Score Trend (Last 7 Tests)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                        <YAxis domain={[0,100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                        <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                          contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 13,
                            background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3}
                          dot={{ fill: "var(--primary)", r: 5 }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="analytics__chart-card">
                    <h3 className="section-title">📋 All Test Attempts</h3>
                    <div className="analytics__table-wrap">
                      <table className="analytics__table">
                        <thead>
                          <tr><th>#</th><th>Date</th><th>Subject</th><th>Score</th><th>Correct</th><th>Time</th></tr>
                        </thead>
                        <tbody>
                          {[...history].reverse().map((h, i) => (
                            <tr key={i}>
                              <td>{history.length - i}</td>
                              <td>{new Date(h.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</td>
                              <td>
                                <span className="pill pill--blue">
                                  {h.subject ? SUBJECTS[h.subject]?.icon : "⚡"}{" "}
                                  {h.subject ? SUBJECTS[h.subject]?.name : "Physics"}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 800,
                                  color: h.score >= 70 ? "#22c55e" : h.score >= 40 ? "#f59e0b" : "#ef4444" }}>
                                  {h.score}%
                                </span>
                              </td>
                              <td>{h.correct}/{h.total}</td>
                              <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                {h.totalTime ? fmtTime(h.totalTime) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analytics;
