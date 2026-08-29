import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SUBJECTS, getMasteryLevel } from "../../data/curriculum";
import "./SubjectDashboard.css";

const COLOR   = "#16a34a";
const subject = SUBJECTS.chemistry;

const CATEGORY_CONFIG = {
  Physical:  { color: "#2563eb", bg: "#eff6ff", icon: "⚗️",  gradient: "linear-gradient(135deg,#1e40af,#2563eb,#0ea5e9)" },
  Inorganic: { color: "#7c3aed", bg: "#f5f3ff", icon: "🔬",  gradient: "linear-gradient(135deg,#4c1d95,#7c3aed,#a78bfa)" },
  Organic:   { color: "#16a34a", bg: "#f0fdf4", icon: "🧪",  gradient: "linear-gradient(135deg,#14532d,#16a34a,#22c55e)" },
};

/* ── Ring ────────────────────────────────────────────────── */
const Ring = ({ value, size = 100, stroke = 8, color, label, sub }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(value / 100, 1);
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

/* ── Stats hook ──────────────────────────────────────────── */
const useChemStats = (history) => {
  const chemHistory = history.filter((h) => h.subjectId === "chemistry");
  const progress    = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}");

  // Group chapters by category
  const categories = { Physical: [], Inorganic: [], Organic: [] };
  subject.chapters.forEach((ch) => {
    if (categories[ch.category]) categories[ch.category].push(ch);
  });

  const catStats = Object.entries(categories).map(([cat, chapters]) => {
    const scores  = chapters.map((ch) => progress[`chemistry_ch${ch.id}`] || 0);
    const done    = scores.filter((s) => s >= 40).length;
    const avg     = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const cfg     = CATEGORY_CONFIG[cat];
    return { cat, chapters, done, total: chapters.length, avg, ...cfg };
  });

  // Bloom breakdown per category
  const bloomByCat = { Physical: {}, Inorganic: {}, Organic: {} };
  chemHistory.forEach((h) => {
    const ch = subject.chapters.find((c) => c.id === h.chapterId);
    if (!ch) return;
    const cat = ch.category;
    if (!bloomByCat[cat]) return;
    (h.questions || []).forEach((q) => {
      const lvl = q.bloomLevel;
      if (!bloomByCat[cat][lvl]) bloomByCat[cat][lvl] = { correct: 0, total: 0 };
      bloomByCat[cat][lvl].total++;
      if (q.isCorrect) bloomByCat[cat][lvl].correct++;
    });
  });

  // Chapter scores for bar chart
  const chapterScores = subject.chapters.map((ch) => ({
    name: `Ch${ch.id}`,
    fullName: ch.name,
    score: progress[`chemistry_ch${ch.id}`] || 0,
    category: ch.category,
    color: CATEGORY_CONFIG[ch.category]?.color || COLOR,
  }));

  // Pie data
  const pieData = catStats.map((c) => ({ name: c.cat, value: c.avg || 1, color: c.color }));

  const avgScore = chemHistory.length
    ? Math.round(chemHistory.reduce((s, h) => s + h.score, 0) / chemHistory.length) : 0;

  const totalCompleted = subject.chapters.filter((ch) => (progress[`chemistry_ch${ch.id}`] || 0) >= 40).length;

  return { catStats, bloomByCat, chapterScores, pieData, avgScore, totalCompleted, totalTests: chemHistory.length };
};

/* ── Page ────────────────────────────────────────────────── */
const ChemistryDashboard = () => {
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

  const { catStats, chapterScores, pieData, avgScore, totalCompleted, totalTests } = useChemStats(history);
  const mastery = getMasteryLevel(avgScore);
  const tabs = ["overview", "categories", "chapters"];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container" style={{ "--sdb-color": COLOR }}>

          {/* Header */}
          <div className="sdb__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">🧪 Chemistry Dashboard</h1>
              <p className="section-sub">Track Physical, Inorganic & Organic Chemistry progress.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="subjects__back-btn" onClick={() => navigate("/subjects/chemistry")}>📚 Chapters</button>
              <button className="subjects__back-btn" onClick={() => navigate("/analytics")}>📊 Analytics</button>
            </div>
          </div>

          {/* Banner */}
          <div className="sdb__banner animate-fadeInUp" style={{ background: subject.gradient }}>
            <div className="sdb__banner-left">
              <span className="sdb__banner-icon">🧪</span>
              <div>
                <h1>Chemistry</h1>
                <p>Physical, Inorganic & Organic Chemistry — from solutions to biomolecules.</p>
              </div>
            </div>
            <div className="sdb__banner-stats">
              {[
                { val: `${totalCompleted}/${subject.chapters.length}`, label: "Completed" },
                ...catStats.map((c) => ({ val: `${c.avg}%`, label: c.cat })),
                { val: mastery.label, label: "Mastery" },
              ].map((s, i) => (
                <div key={i} className="sdb__bstat">
                  <strong>{s.val}</strong><span>{s.label}</span>
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
                {{ overview: "📊 Overview", categories: "🗂 Categories", chapters: "📖 Chapters" }[t]}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="sdb__stat-grid animate-fadeInUp">
                {[
                  { icon: "📖", label: "Chapters Done",    value: `${totalCompleted}/${subject.chapters.length}`, color: COLOR },
                  ...catStats.map((c) => ({ icon: c.icon, label: `${c.cat} Progress`, value: `${c.avg}%`, color: c.color })),
                  { icon: "📝", label: "Tests Taken",       value: totalTests, color: "#f59e0b" },
                ].map((s, i) => (
                  <div key={i} className="sdb__stat-card" style={{ borderTopColor: s.color }}>
                    <div className="sdb__stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div className="sdb__stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="sdb__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Category Rings + Pie */}
              <div className="sdb__grid-2 animate-fadeInUp">
                <div className="sdb__card">
                  <p className="sdb__card-title">📊 Category Progress Rings</p>
                  <div className="sdb__ring-row">
                    {catStats.map((c) => (
                      <div key={c.cat} className="sdb__ring-card" style={{ borderColor: c.color + "44", background: c.bg }}>
                        <Ring value={c.avg} color={c.color} size={90} stroke={8} label={`${c.avg}%`} />
                        <p className="sdb__ring-label">{c.icon} {c.cat}</p>
                        <p className="sdb__ring-sub">{c.done}/{c.total} chapters</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sdb__card">
                  <p className="sdb__card-title">🥧 Category Distribution</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                        dataKey="value" paddingAngle={4} label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]}
                        contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                          background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                      <Legend iconType="circle" iconSize={10}
                        formatter={(v) => <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Progress Bars */}
              <div className="sdb__card animate-fadeInUp">
                <p className="sdb__card-title">📈 Category Progress Bars</p>
                <div className="sdb__bar-list">
                  {catStats.map((c) => (
                    <div key={c.cat} className="sdb__bar-item">
                      <div className="sdb__bar-header">
                        <span className="sdb__bar-name">{c.icon} {c.cat} Chemistry</span>
                        <span className="sdb__bar-pct" style={{ color: c.color }}>{c.avg}%</span>
                      </div>
                      <div className="progress-bar progress-bar--lg">
                        <div className="progress-bar__fill" style={{ width: `${c.avg}%`, background: c.gradient || c.color }} />
                      </div>
                      <span className="sdb__bar-meta">{c.done}/{c.total} chapters completed · {getMasteryLevel(c.avg).label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="sdb__insights animate-fadeInUp">
                {catStats.map((c) => {
                  const clsMap = { Physical: "--blue", Inorganic: "--amber", Organic: "--green" };
                  return (
                    <div key={c.cat} className={`sdb__insight sdb__insight${clsMap[c.cat]}`}>
                      <span className="sdb__insight-icon">{c.icon}</span>
                      <div>
                        <strong>{c.cat} Chemistry</strong>
                        <p>{c.avg >= 70 ? `Strong! ${c.done}/${c.total} chapters mastered.`
                           : c.avg >= 40 ? `Making progress — ${c.total - c.done} chapters left.`
                           : `Needs focus — start with easier ${c.cat} chapters.`}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="sdb__insight sdb__insight--red">
                  <span className="sdb__insight-icon">🎯</span>
                  <div>
                    <strong>Focus Area</strong>
                    <p>{catStats.sort((a, b) => a.avg - b.avg)[0]?.cat} Chemistry needs the most attention.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── CATEGORIES ── */}
          {tab === "categories" && (
            <div className="animate-fadeInUp">
              <div className="sdb__grid-3">
                {catStats.map((c) => (
                  <div key={c.cat} className="sdb__cat-card">
                    <div className="sdb__cat-header" style={{ background: c.gradient }}>
                      <span className="sdb__cat-icon">{c.icon}</span>
                      <div>
                        <h3>{c.cat} Chemistry</h3>
                        <p>{c.total} chapters</p>
                      </div>
                    </div>
                    <div className="sdb__cat-body">
                      <div className="sdb__cat-stats">
                        {[
                          { label: "Avg Score", val: `${c.avg}%` },
                          { label: "Completed", val: `${c.done}/${c.total}` },
                          { label: "Mastery",   val: getMasteryLevel(c.avg).label },
                        ].map((s) => (
                          <div key={s.label} className="sdb__cat-stat">
                            <strong style={{ color: c.color }}>{s.val}</strong>
                            <span>{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="progress-bar progress-bar--lg" style={{ marginBottom: 12 }}>
                        <div className="progress-bar__fill" style={{ width: `${c.avg}%`, background: c.gradient }} />
                      </div>
                      <div className="sdb__bar-list">
                        {c.chapters.map((ch) => {
                          const score = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}")[`chemistry_ch${ch.id}`] || 0;
                          return (
                            <div key={ch.id} className="sdb__bar-item">
                              <div className="sdb__bar-header">
                                <span className="sdb__bar-name" style={{ fontSize: "0.8rem" }}>{ch.name}</span>
                                <span className="sdb__bar-pct" style={{ color: c.color, fontSize: "0.8rem" }}>
                                  {score > 0 ? `${score}%` : "—"}
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-bar__fill" style={{ width: `${score}%`, background: c.color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CHAPTERS ── */}
          {tab === "chapters" && (
            <div className="animate-fadeInUp">
              <div className="sdb__card">
                <p className="sdb__card-title">📊 All Chapter Scores</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chapterScores} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                    <Tooltip formatter={(v, _, p) => [`${v}%`, p.payload.fullName]}
                      contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                        background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={28}>
                      {chapterScores.map((c, i) => <Cell key={i} fill={c.color} opacity={c.score > 0 ? 1 : 0.25} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="sdb__card">
                <p className="sdb__card-title">📋 Chapter Details</p>
                <div className="sdb__table-wrap">
                  <table className="sdb__table">
                    <thead>
                      <tr><th>#</th><th>Chapter</th><th>Category</th><th>Score</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {chapterScores.map((c, i) => (
                        <tr key={i}>
                          <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{subject.chapters[i].name}</td>
                          <td>
                            <span className="pill" style={{ background: CATEGORY_CONFIG[c.category]?.bg,
                              color: CATEGORY_CONFIG[c.category]?.color }}>
                              {CATEGORY_CONFIG[c.category]?.icon} {c.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="progress-bar" style={{ width: 80 }}>
                                <div className="progress-bar__fill" style={{ width: `${c.score}%`, background: c.color }} />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: c.score > 0 ? c.color : "var(--text-muted)" }}>
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
                              onClick={() => navigate(`/quiz/chemistry/${subject.chapters[i].id}`)}>
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

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChemistryDashboard;
