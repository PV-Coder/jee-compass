import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Cell, LineChart, Line,
} from "recharts";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SUBJECTS, getMasteryLevel } from "../../data/curriculum";
import "./SubjectDashboard.css";

const COLOR   = "#7c3aed";
const subject = SUBJECTS.mathematics;

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

/* ── Mastery Stars ───────────────────────────────────────── */
const Stars = ({ stars }) => (
  <div className="mastery-stars">
    {[1,2,3,4,5].map((s) => (
      <span key={s} className={`mastery-star${s > stars ? " mastery-star--empty" : ""}`}>⭐</span>
    ))}
  </div>
);

/* ── Stats hook ──────────────────────────────────────────── */
const useMathStats = (history) => {
  const mathHistory = history.filter((h) => h.subjectId === "mathematics");
  const progress    = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}");

  // Speed: avg time per question (lower = faster)
  let totalQTime = 0, totalQCount = 0;
  mathHistory.forEach((h) => {
    (h.questions || []).forEach((q) => {
      totalQTime += q.timeTaken || 0;
      totalQCount++;
    });
  });
  const avgTimePerQ = totalQCount > 0 ? Math.round(totalQTime / totalQCount) : 0;
  // Speed score: 0-100 (60s = 0, 10s = 100)
  const speedScore = totalQCount > 0 ? Math.max(0, Math.min(100, Math.round(((60 - avgTimePerQ) / 50) * 100))) : 0;

  // Accuracy
  let totalCorrect = 0, totalQ = 0;
  mathHistory.forEach((h) => {
    totalCorrect += h.correct || 0;
    totalQ       += h.total  || 0;
  });
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  // Formula Recall = Remember bloom level accuracy
  const formulaStats = { correct: 0, total: 0 };
  const problemStats = { correct: 0, total: 0 };
  mathHistory.forEach((h) => {
    (h.questions || []).forEach((q) => {
      if (q.bloomLevel === "Remember" || q.bloomLevel === "Understand") {
        formulaStats.total++;
        if (q.isCorrect) formulaStats.correct++;
      } else {
        problemStats.total++;
        if (q.isCorrect) problemStats.correct++;
      }
    });
  });
  const formulaRecall  = formulaStats.total  > 0 ? Math.round((formulaStats.correct  / formulaStats.total)  * 100) : 0;
  const problemSolving = problemStats.total  > 0 ? Math.round((problemStats.correct  / problemStats.total)  * 100) : 0;

  // Unit breakdown
  const unitMap = {};
  subject.chapters.forEach((ch) => {
    if (!unitMap[ch.unit]) unitMap[ch.unit] = { total: 0, sum: 0 };
    const s = progress[`mathematics_ch${ch.id}`] || 0;
    unitMap[ch.unit].sum += s;
    unitMap[ch.unit].total++;
  });
  const unitData = Object.entries(unitMap).map(([unit, { sum, total }]) => ({
    unit: unit.length > 14 ? unit.slice(0, 14) + "…" : unit,
    score: Math.round(sum / total),
  }));

  // Chapter scores
  const chapterScores = subject.chapters.map((ch) => ({
    name: `Ch${ch.id}`,
    fullName: ch.name,
    score: progress[`mathematics_ch${ch.id}`] || 0,
    unit: ch.unit,
  }));

  // Trend
  const trendData = mathHistory.slice(-7).map((h, i) => ({
    test: `T${i+1}`,
    score: h.score,
    date: new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));

  const avgScore = mathHistory.length
    ? Math.round(mathHistory.reduce((s, h) => s + h.score, 0) / mathHistory.length) : 0;

  const chaptersCompleted = subject.chapters.filter(
    (ch) => (progress[`mathematics_ch${ch.id}`] || 0) >= 40
  ).length;

  const skills = [
    { name: "Speed",           score: speedScore,    color: "#0ea5e9", icon: "⚡",
      desc: avgTimePerQ > 0 ? `Avg ${avgTimePerQ}s per question` : "No data yet",
      tip: speedScore < 50 ? "Practice timed drills to improve speed." : "Great speed! Keep it up." },
    { name: "Accuracy",        score: accuracy,      color: "#22c55e", icon: "🎯",
      desc: `${totalCorrect}/${totalQ} correct`,
      tip: accuracy < 60 ? "Focus on understanding concepts before speed." : "Strong accuracy — aim for 80%+." },
    { name: "Formula Recall",  score: formulaRecall, color: "#f59e0b", icon: "📐",
      desc: `${formulaStats.correct}/${formulaStats.total} recall questions`,
      tip: formulaRecall < 60 ? "Make a formula sheet and revise daily." : "Good recall! Try harder derivations." },
    { name: "Problem Solving", score: problemSolving, color: COLOR,    icon: "🧩",
      desc: `${problemStats.correct}/${problemStats.total} application questions`,
      tip: problemSolving < 60 ? "Solve 5 application problems daily." : "Excellent problem solving!" },
  ];

  const radarData = skills.map((s) => ({ skill: s.name, score: s.score }));

  return { skills, radarData, unitData, chapterScores, trendData, avgScore,
           chaptersCompleted, accuracy, formulaRecall, problemSolving, speedScore,
           totalTests: mathHistory.length, avgTimePerQ };
};

/* ── Page ────────────────────────────────────────────────── */
const MathDashboard = () => {
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

  const { skills, radarData, unitData, chapterScores, trendData, avgScore,
          chaptersCompleted, totalTests, avgTimePerQ } = useMathStats(history);
  const mastery = getMasteryLevel(avgScore);
  const tabs = ["overview", "skills", "chapters", "trend"];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container" style={{ "--sdb-color": COLOR }}>

          {/* Header */}
          <div className="sdb__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">📐 Mathematics Dashboard</h1>
              <p className="section-sub">Speed, Accuracy, Formula Recall & Problem Solving — all in one view.</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="subjects__back-btn" onClick={() => navigate("/subjects/mathematics")}>📚 Chapters</button>
              <button className="subjects__back-btn" onClick={() => navigate("/analytics")}>📊 Analytics</button>
            </div>
          </div>

          {/* Banner */}
          <div className="sdb__banner animate-fadeInUp" style={{ background: subject.gradient }}>
            <div className="sdb__banner-left">
              <span className="sdb__banner-icon">📐</span>
              <div>
                <h1>Mathematics</h1>
                <p>Calculus, Algebra, Vectors & Probability — build your problem-solving edge.</p>
              </div>
            </div>
            <div className="sdb__banner-stats">
              {[
                { val: `${chaptersCompleted}/${subject.chapters.length}`, label: "Completed" },
                ...skills.map((s) => ({ val: `${s.score}%`, label: s.name })),
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
                {{ overview: "📊 Overview", skills: "🧩 Skills", chapters: "📖 Chapters", trend: "📈 Trend" }[t]}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="sdb__stat-grid animate-fadeInUp">
                {[
                  { icon: "📖", label: "Chapters Done",    value: `${chaptersCompleted}/${subject.chapters.length}`, color: COLOR },
                  { icon: "📝", label: "Tests Taken",       value: totalTests,    color: "#0ea5e9" },
                  { icon: "⏱",  label: "Avg Time / Q",     value: avgTimePerQ > 0 ? `${avgTimePerQ}s` : "—", color: "#f59e0b" },
                  { icon: "🏅", label: "Mastery Level",     value: mastery.label, color: mastery.color },
                ].map((s, i) => (
                  <div key={i} className="sdb__stat-card" style={{ borderTopColor: s.color }}>
                    <div className="sdb__stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div className="sdb__stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="sdb__stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Skill Rings + Radar */}
              <div className="sdb__grid-2 animate-fadeInUp">
                <div className="sdb__card">
                  <p className="sdb__card-title">🧩 Skill Rings</p>
                  <div className="sdb__ring-row">
                    {skills.map((s) => (
                      <div key={s.name} className="sdb__ring-card" style={{ borderColor: s.color + "44" }}>
                        <Ring value={s.score} color={s.color} size={80} stroke={7} label={`${s.score}%`} />
                        <p className="sdb__ring-label">{s.icon} {s.name}</p>
                        <p className="sdb__ring-sub">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sdb__card">
                  <p className="sdb__card-title">🕸 Skill Radar</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontFamily: "Poppins" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                      <Radar dataKey="score" stroke={COLOR} fill={COLOR} fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                        contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                          background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Unit Radar */}
              <div className="sdb__grid-2 animate-fadeInUp">
                <div className="sdb__card">
                  <p className="sdb__card-title">📚 Unit Performance</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={unitData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="unit" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} unit="%" />
                      <Tooltip formatter={(v) => [`${v}%`, "Avg Score"]}
                        contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                          background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={36}>
                        {unitData.map((_, i) => <Cell key={i} fill={COLOR} opacity={0.7 + (i % 3) * 0.1} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="sdb__card">
                  <p className="sdb__card-title">📊 Skill Progress Bars</p>
                  <div className="sdb__bar-list">
                    {skills.map((s) => (
                      <div key={s.name} className="sdb__bar-item">
                        <div className="sdb__bar-header">
                          <span className="sdb__bar-name">{s.icon} {s.name}</span>
                          <span className="sdb__bar-pct" style={{ color: s.color }}>{s.score}%</span>
                        </div>
                        <div className="progress-bar progress-bar--lg">
                          <div className="progress-bar__fill" style={{ width: `${s.score}%`, background: s.color }} />
                        </div>
                        <span className="sdb__bar-meta">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="sdb__insights animate-fadeInUp">
                {skills.map((s, i) => {
                  const clss = ["--blue", "--green", "--amber", "--red"];
                  return (
                    <div key={s.name} className={`sdb__insight sdb__insight${clss[i]}`}>
                      <span className="sdb__insight-icon">{s.icon}</span>
                      <div><strong>{s.name}</strong><p>{s.tip}</p></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── SKILLS ── */}
          {tab === "skills" && (
            <div className="animate-fadeInUp">
              <div className="sdb__skill-grid">
                {skills.map((s) => {
                  const m = getMasteryLevel(s.score);
                  return (
                    <div key={s.name} className="sdb__skill-card">
                      <Ring value={s.score} color={s.color} size={110} stroke={10} label={`${s.score}%`} />
                      <p className="sdb__skill-name">{s.icon} {s.name}</p>
                      <Stars stars={m.stars} />
                      <span className="sdb__skill-badge"
                        style={{ background: m.color + "18", color: m.color }}>{m.label}</span>
                      <div className="progress-bar progress-bar--lg" style={{ width: "100%" }}>
                        <div className="progress-bar__fill" style={{ width: `${s.score}%`, background: s.color }} />
                      </div>
                      <p className="sdb__skill-desc">{s.tip}</p>
                    </div>
                  );
                })}
              </div>

              {/* Skill comparison bar */}
              <div className="sdb__card">
                <p className="sdb__card-title">📊 Skill Comparison</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={skills.map((s) => ({ name: s.name, score: s.score, color: s.color }))}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                    <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                      contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                        background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={56}>
                      {skills.map((s, i) => <Cell key={i} fill={s.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
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
                    <Tooltip formatter={(v, _, p) => [`${v}%`, p.payload.fullName]}
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
                          <td><span className="pill pill--purple">{c.unit}</span></td>
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
                              onClick={() => navigate(`/quiz/mathematics/${subject.chapters[i].id}`)}>
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

          {/* ── TREND ── */}
          {tab === "trend" && (
            <div className="animate-fadeInUp">
              {trendData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px" }}>
                  <p style={{ fontSize: "3rem" }}>📈</p>
                  <h3 style={{ fontWeight: 800, margin: "12px 0 8px" }}>No test history yet</h3>
                  <p style={{ color: "var(--text-secondary)" }}>Take some Math tests to see your trend.</p>
                  <button style={{ background: subject.gradient, color: "#fff", border: "none",
                    borderRadius: 12, padding: "12px 28px", fontSize: "0.9rem", fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}
                    onClick={() => navigate("/subjects/mathematics")}>
                    Start a Test
                  </button>
                </div>
              ) : (
                <div className="sdb__card">
                  <p className="sdb__card-title">📈 Score Trend (Last 7 Tests)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} unit="%" />
                      <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                        contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                          background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                      <Line type="monotone" dataKey="score" stroke={COLOR} strokeWidth={3}
                        dot={{ fill: COLOR, r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MathDashboard;
