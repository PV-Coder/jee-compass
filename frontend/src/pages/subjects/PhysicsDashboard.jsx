import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell,
} from "recharts";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SUBJECTS } from "../../data/curriculum";
import { getMasteryLevel } from "../../data/curriculum";
import "./SubjectDashboard.css";

const COLOR = "#2563eb";
const subject = SUBJECTS.physics;

/* ── Circular Ring ───────────────────────────────────────── */
const Ring = ({ value, max = 100, size = 100, stroke = 8, color, label, sub }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
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
        <span className="ring-wrap__value" style={{ color, fontSize: size < 90 ? "1rem" : "1.3rem" }}>{label}</span>
        {sub && <span className="ring-wrap__sub">{sub}</span>}
      </div>
    </div>
  );
};

/* ── Derive stats from quiz history ──────────────────────── */
const usePhysicsStats = (history) => {
  const phyHistory = history.filter((h) => h.subjectId === "physics");
  const progress   = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}");

  const chaptersCompleted = subject.chapters.filter(
    (ch) => (progress[`physics_ch${ch.id}`] || 0) >= 40
  ).length;

  // Formula accuracy = Remember + Understand bloom levels
  const formulaQ = { correct: 0, total: 0 };
  const numericalQ = { correct: 0, total: 0 };
  const topicMap = {};

  phyHistory.forEach((h) => {
    if (!h.questions) return;
    h.questions.forEach((q) => {
      const isFormula = q.bloomLevel === "Remember" || q.bloomLevel === "Understand";
      if (isFormula) {
        formulaQ.total++;
        if (q.isCorrect) formulaQ.correct++;
      } else {
        numericalQ.total++;
        if (q.isCorrect) numericalQ.correct++;
      }
      // topic tracking via chapter
      const key = h.chapterName || "General";
      if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 };
      topicMap[key].total++;
      if (q.isCorrect) topicMap[key].correct++;
    });
  });

  const formulaAcc   = formulaQ.total   > 0 ? Math.round((formulaQ.correct   / formulaQ.total)   * 100) : 0;
  const numericalAcc = numericalQ.total > 0 ? Math.round((numericalQ.correct / numericalQ.total) * 100) : 0;

  const topicList = Object.entries(topicMap).map(([name, { correct, total }]) => ({
    name, pct: Math.round((correct / total) * 100), correct, total,
  })).sort((a, b) => b.pct - a.pct);

  const strongTopics = topicList.filter((t) => t.pct >= 70).slice(0, 5);
  const weakTopics   = topicList.filter((t) => t.pct < 50).slice(0, 5);

  // Per-chapter scores for bar chart
  const chapterScores = subject.chapters.map((ch) => ({
    name: `Ch${ch.id}`,
    fullName: ch.name,
    score: progress[`physics_ch${ch.id}`] || 0,
    unit: ch.unit,
  }));

  // Unit radar data
  const unitMap = {};
  subject.chapters.forEach((ch) => {
    if (!unitMap[ch.unit]) unitMap[ch.unit] = { total: 0, sum: 0 };
    const s = progress[`physics_ch${ch.id}`] || 0;
    unitMap[ch.unit].sum += s;
    unitMap[ch.unit].total++;
  });
  const unitRadar = Object.entries(unitMap).map(([unit, { sum, total }]) => ({
    unit: unit.length > 12 ? unit.slice(0, 12) + "…" : unit,
    score: Math.round(sum / total),
  }));

  const avgScore = phyHistory.length
    ? Math.round(phyHistory.reduce((s, h) => s + h.score, 0) / phyHistory.length) : 0;

  return { chaptersCompleted, formulaAcc, numericalAcc, strongTopics, weakTopics,
           chapterScores, unitRadar, avgScore, totalTests: phyHistory.length };
};

/* ── Page ────────────────────────────────────────────────── */
const PhysicsDashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("overview");

  const loadData = () => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setHistory(JSON.parse(localStorage.getItem("jee_test_history") || "[]"));
  };

  useEffect(() => {
    loadData();
    // Refresh when localStorage changes (e.g. after completing a test)
    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [navigate]);

  const { chaptersCompleted, formulaAcc, numericalAcc, strongTopics, weakTopics,
          chapterScores, unitRadar, avgScore, totalTests } = usePhysicsStats(history);

  const mastery = getMasteryLevel(avgScore);
  const tabs = ["overview", "chapters", "topics"];

  const statCards = [
    { icon: "📖", label: "Chapters Completed", value: `${chaptersCompleted}/${subject.chapters.length}`, color: COLOR },
    { icon: "🧮", label: "Formula Accuracy",   value: `${formulaAcc}%`,   color: "#8b5cf6" },
    { icon: "🔢", label: "Numerical Accuracy", value: `${numericalAcc}%`, color: "#f59e0b" },
    { icon: "📝", label: "Tests Taken",         value: totalTests,          color: "#22c55e" },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container" style={{ "--sdb-color": COLOR }}>

          {/* Header */}
          <div className="sdb__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">⚡ Physics Dashboard</h1>
              <p className="section-sub">Track your Physics performance across all chapters and units.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="subjects__back-btn" onClick={() => navigate("/subjects/physics")}>📚 Chapters</button>
              <button className="subjects__back-btn" onClick={() => navigate("/analytics")}>📊 Analytics</button>
            </div>
          </div>

          {/* Banner */}
          <div className="sdb__banner animate-fadeInUp" style={{ background: subject.gradient }}>
            <div className="sdb__banner-left">
              <span className="sdb__banner-icon">⚡</span>
              <div>
                <h1>Physics</h1>
                <p>Electrostatics, Optics, Modern Physics & more — master the physical world.</p>
              </div>
            </div>
            <div className="sdb__banner-stats">
              {[
                { val: `${chaptersCompleted}/${subject.chapters.length}`, label: "Completed" },
                { val: `${formulaAcc}%`,   label: "Formula Acc." },
                { val: `${numericalAcc}%`, label: "Numerical Acc." },
                { val: mastery.label,      label: "Mastery" },
              ].map((s, i) => (
                <div key={i} className="sdb__bstat">
                  <strong>{s.val}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="sdb__tabs animate-fadeInUp">
            {tabs.map((t) => (
              <button key={t}
                className={`sdb__tab${tab === t ? " sdb__tab--active" : ""}`}
                style={{ "--sdb-color": COLOR }}
                onClick={() => setTab(t)}>
                {{ overview: "📊 Overview", chapters: "📖 Chapters", topics: "🎯 Topics" }[t]}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="sdb__stat-grid animate-fadeInUp">
                {statCards.map((s, i) => (
                  <div key={i} className="sdb__stat-card" style={{ borderTopColor: s.color }}>
                    <div className="sdb__stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div className="sdb__stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="sdb__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Accuracy Rings + Unit Radar */}
              <div className="sdb__grid-2 animate-fadeInUp">
                <div className="sdb__card">
                  <p className="sdb__card-title">🎯 Accuracy Breakdown</p>
                  <div className="sdb__ring-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {[
                      { label: "Overall",   val: avgScore,     color: mastery.color, sub: "Avg Score" },
                      { label: "Formula",   val: formulaAcc,   color: "#8b5cf6",     sub: "Recall" },
                      { label: "Numerical", val: numericalAcc, color: "#f59e0b",     sub: "Problem Solving" },
                    ].map((r) => (
                      <div key={r.label} className="sdb__ring-card" style={{ borderColor: r.color + "44" }}>
                        <Ring value={r.val} color={r.color} size={90} stroke={8} label={`${r.val}%`} />
                        <p className="sdb__ring-label">{r.label}</p>
                        <p className="sdb__ring-sub">{r.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sdb__card">
                  <p className="sdb__card-title">🕸 Unit Performance Radar</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={unitRadar}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="unit" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontFamily: "Poppins" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                      <Radar dataKey="score" stroke={COLOR} fill={COLOR} fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                        contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                          background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strong / Weak Topics */}
              <div className="sdb__grid-2 animate-fadeInUp">
                <div className="sdb__card">
                  <p className="sdb__card-title">💪 Strong Topics</p>
                  {strongTopics.length === 0
                    ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Complete more quizzes to see strong topics.</p>
                    : <div className="sdb__topic-grid">
                        {strongTopics.map((t) => (
                          <span key={t.name} className="sdb__topic-pill sdb__topic-pill--strong">
                            ✅ {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                  }
                </div>
                <div className="sdb__card">
                  <p className="sdb__card-title">⚠️ Weak Topics</p>
                  {weakTopics.length === 0
                    ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No weak topics found yet — keep going!</p>
                    : <div className="sdb__topic-grid">
                        {weakTopics.map((t) => (
                          <span key={t.name} className="sdb__topic-pill sdb__topic-pill--weak">
                            ❌ {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                  }
                </div>
              </div>

              {/* Insights */}
              <div className="sdb__insights animate-fadeInUp">
                {[
                  { cls: "--green", icon: "💡", title: "Formula Tip",
                    body: formulaAcc >= 70 ? "Great formula recall! Keep revising derivations." : "Revise key formulas — flashcards help a lot." },
                  { cls: "--amber", icon: "🔢", title: "Numerical Tip",
                    body: numericalAcc >= 70 ? "Strong problem-solving! Try harder numericals." : "Practice more numerical problems with unit analysis." },
                  { cls: "--blue", icon: "📖", title: "Chapter Progress",
                    body: `${chaptersCompleted} of ${subject.chapters.length} chapters completed. ${subject.chapters.length - chaptersCompleted} remaining.` },
                  { cls: "--red", icon: "🎯", title: "Focus Area",
                    body: weakTopics[0] ? `Spend more time on "${weakTopics[0].name}" — currently at ${weakTopics[0].pct}%.` : "All topics looking good! Aim for 80%+ everywhere." },
                ].map((c, i) => (
                  <div key={i} className={`sdb__insight sdb__insight${c.cls}`}>
                    <span className="sdb__insight-icon">{c.icon}</span>
                    <div><strong>{c.title}</strong><p>{c.body}</p></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CHAPTERS ── */}
          {tab === "chapters" && (
            <div className="animate-fadeInUp">
              <div className="sdb__card">
                <p className="sdb__card-title">📊 Chapter Score Overview</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chapterScores} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                    <Tooltip
                      formatter={(v, _, p) => [`${v}%`, p.payload.fullName]}
                      contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                        background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                      {chapterScores.map((c, i) => (
                        <Cell key={i} fill={c.score >= 70 ? "#22c55e" : c.score >= 40 ? "#f59e0b" : c.score > 0 ? "#ef4444" : "#e2e8f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="sdb__card">
                <p className="sdb__card-title">📋 Chapter Details</p>
                <div className="sdb__table-wrap">
                  <table className="sdb__table">
                    <thead>
                      <tr><th>#</th><th>Chapter</th><th>Unit</th><th>Score</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {chapterScores.map((c, i) => (
                        <tr key={i}>
                          <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{subject.chapters[i].name}</td>
                          <td><span className="pill pill--blue">{c.unit}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div className="progress-bar__fill" style={{ width: `${c.score}%`,
                                  background: c.score >= 70 ? "#22c55e" : c.score >= 40 ? "#f59e0b" : c.score > 0 ? "#ef4444" : "#e2e8f0" }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem",
                                color: c.score >= 70 ? "#22c55e" : c.score >= 40 ? "#f59e0b" : c.score > 0 ? "#ef4444" : "var(--text-muted)" }}>
                                {c.score > 0 ? `${c.score}%` : "—"}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`pill ${c.score >= 70 ? "pill--green" : c.score >= 40 ? "pill--amber" : c.score > 0 ? "pill--red" : "pill--gray"}`}>
                              {c.score >= 70 ? "Mastered" : c.score >= 40 ? "In Progress" : c.score > 0 ? "Needs Work" : "Not Started"}
                            </span>
                          </td>
                          <td>
                            <button style={{ background: subject.gradient, color: "#fff", border: "none",
                              borderRadius: 8, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 700,
                              cursor: "pointer", fontFamily: "inherit" }}
                              onClick={() => navigate(`/quiz/physics/${subject.chapters[i].id}`)}>
                              {c.score > 0 ? "Retake" : "Start"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── TOPICS ── */}
          {tab === "topics" && (
            <div className="animate-fadeInUp">
              <div className="sdb__grid-2">
                <div className="sdb__card">
                  <p className="sdb__card-title">💪 Strong Topics (≥70%)</p>
                  {strongTopics.length === 0
                    ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Take more quizzes to unlock topic data.</p>
                    : <div className="sdb__bar-list">
                        {strongTopics.map((t) => (
                          <div key={t.name} className="sdb__bar-item">
                            <div className="sdb__bar-header">
                              <span className="sdb__bar-name">{t.name}</span>
                              <span className="sdb__bar-pct" style={{ color: "#22c55e" }}>{t.pct}%</span>
                            </div>
                            <div className="progress-bar progress-bar--lg">
                              <div className="progress-bar__fill" style={{ width: `${t.pct}%`, background: "#22c55e" }} />
                            </div>
                            <span className="sdb__bar-meta">{t.correct}/{t.total} correct</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>
                <div className="sdb__card">
                  <p className="sdb__card-title">⚠️ Weak Topics (&lt;50%)</p>
                  {weakTopics.length === 0
                    ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No weak topics — great work!</p>
                    : <div className="sdb__bar-list">
                        {weakTopics.map((t) => (
                          <div key={t.name} className="sdb__bar-item">
                            <div className="sdb__bar-header">
                              <span className="sdb__bar-name">{t.name}</span>
                              <span className="sdb__bar-pct" style={{ color: "#ef4444" }}>{t.pct}%</span>
                            </div>
                            <div className="progress-bar progress-bar--lg">
                              <div className="progress-bar__fill" style={{ width: `${t.pct}%`, background: "#ef4444" }} />
                            </div>
                            <span className="sdb__bar-meta">{t.correct}/{t.total} correct</span>
                          </div>
                        ))}
                      </div>
                  }
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PhysicsDashboard;
