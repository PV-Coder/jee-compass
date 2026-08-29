import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SUBJECTS, getMasteryLevel } from "../data/curriculum";
import "./DiagnosticResult.css";

const BLOOM_CONFIG = {
  Remember:   { color: "#22c55e", bg: "#dcfce7", icon: "🟢", desc: "Recall facts & definitions" },
  Understand: { color: "#3b82f6", bg: "#dbeafe", icon: "🔵", desc: "Explain & interpret concepts" },
  Apply:      { color: "#f59e0b", bg: "#fef3c7", icon: "🟠", desc: "Use knowledge in new situations" },
  Analyze:    { color: "#ef4444", bg: "#fee2e2", icon: "🔴", desc: "Break down & draw connections" },
};

const STUDY_TIPS = {
  Remember:   "Make flashcards for key formulas and definitions. Revise them daily for 10 minutes.",
  Understand: "Re-read chapter summaries. Try explaining concepts aloud without looking at notes.",
  Apply:      "Solve 5 numerical problems daily. Focus on unit analysis and formula application.",
  Analyze:    "Attempt past-year analytical questions. Practice comparing and contrasting concepts.",
};

const sc = (s) => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";

const Ring = ({ value, size = 120, stroke = 10, color }) => {
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
        <span className="ring-wrap__value" style={{ color, fontSize: "1.4rem" }}>{value}%</span>
      </div>
    </div>
  );
};

const DiagnosticResult = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState({});
  const [activeSubj, setActiveSubj] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    const r = JSON.parse(localStorage.getItem("jee_diagnostic_result") || "{}");
    if (Object.keys(r).length === 0) { navigate("/diagnostic"); return; }
    setResults(r);
    setActiveSubj(Object.keys(r)[0]);
  }, [navigate]);

  if (!activeSubj || !results[activeSubj]) return null;

  const r       = results[activeSubj];
  const subj    = SUBJECTS[activeSubj];
  const mastery = getMasteryLevel(r.score);

  const bloomData = Object.entries(BLOOM_CONFIG).map(([lvl, cfg]) => {
    const b   = r.bloomMap?.[lvl] || { correct: 0, total: 0 };
    const pct = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
    return { level: lvl, score: pct, ...cfg, correct: b.correct, total: b.total };
  });

  const radarData = bloomData.map((b) => ({ level: b.level, score: b.score }));

  const verdict =
    r.score >= 80 ? { label: "Excellent! 🏆", color: "#22c55e", msg: "You have a strong foundation. Focus on Analyze-level questions to reach mastery." }
    : r.score >= 60 ? { label: "Good 👍", color: "#3b82f6", msg: "Solid performance! Work on your weak bloom levels to push past 80%." }
    : r.score >= 40 ? { label: "Developing 📚", color: "#f59e0b", msg: "You're on the right track. Prioritise Remember and Understand levels first." }
    : { label: "Needs Work 💪", color: "#ef4444", msg: "Start from the basics. Revise all chapters and focus on Remember-level questions." };

  const doneSubjects = Object.keys(results);
  const pendingSubjects = Object.values(SUBJECTS).filter((s) => !doneSubjects.includes(s.id));

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="dr__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">🧪 Diagnostic Results</h1>
              <p className="section-sub">Your subject-wise evaluation and personalised study plan.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="subjects__back-btn" onClick={() => navigate("/diagnostic")}>
                + Take Another
              </button>
              <button className="subjects__back-btn" onClick={() => navigate("/dashboard")}>
                ← Dashboard
              </button>
            </div>
          </div>

          {/* Subject Tabs */}
          {doneSubjects.length > 1 && (
            <div className="dr__tabs animate-fadeInUp">
              {doneSubjects.map((sid) => {
                const s = SUBJECTS[sid];
                return (
                  <button key={sid}
                    className={`dr__tab${activeSubj === sid ? " dr__tab--active" : ""}`}
                    style={activeSubj === sid ? { background: s.gradient, borderColor: "transparent" } : {}}
                    onClick={() => setActiveSubj(sid)}>
                    {s.icon} {s.name}
                    <span className="dr__tab-score" style={{ color: activeSubj === sid ? "#fff" : sc(results[sid].score) }}>
                      {results[sid].score}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Hero Banner */}
          <div className="dr__banner animate-fadeInUp" style={{ background: subj.gradient }}>
            <div className="dr__banner-left">
              <span className="dr__banner-icon">{subj.icon}</span>
              <div>
                <p className="dr__banner-label">Diagnostic Complete</p>
                <h2>{subj.name}</h2>
                <p className="dr__banner-verdict" style={{ background: verdict.color + "33" }}>
                  {verdict.label}
                </p>
                <p className="dr__banner-msg">{verdict.msg}</p>
              </div>
            </div>
            <div className="dr__banner-right">
              <Ring value={r.score} color="#fff" size={130} stroke={11} />
              <div className="dr__banner-stats">
                <div><strong>{r.correct}</strong><span>Correct</span></div>
                <div><strong>{r.total - r.correct}</strong><span>Wrong</span></div>
                <div><strong>{mastery.label}</strong><span>Level</span></div>
              </div>
            </div>
          </div>

          {/* Bloom Breakdown + Radar */}
          <div className="dr__grid-2 animate-fadeInUp">
            <div className="dr__card">
              <h3 className="dr__card-title">🧠 Bloom's Taxonomy Breakdown</h3>
              <div className="dr__bloom-list">
                {bloomData.map((b) => (
                  <div key={b.level} className="dr__bloom-item" style={{ borderLeftColor: b.color }}>
                    <div className="dr__bloom-header">
                      <span style={{ color: b.color, fontWeight: 700 }}>{b.icon} {b.level}</span>
                      <span style={{ color: b.color, fontWeight: 800 }}>{b.score}%</span>
                    </div>
                    <div className="progress-bar progress-bar--lg" style={{ margin: "8px 0 6px" }}>
                      <div className="progress-bar__fill" style={{ width: `${b.score}%`, background: b.color }} />
                    </div>
                    <div className="dr__bloom-meta">
                      <span>{b.correct}/{b.total} correct</span>
                      <span style={{ color: "var(--text-muted)" }}>{b.desc}</span>
                    </div>
                    {b.score < 50 && (
                      <div className="dr__bloom-tip">
                        💡 {STUDY_TIPS[b.level]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="dr__card">
              <h3 className="dr__card-title">🕸 Skill Radar</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="level"
                    tick={{ fontSize: 12, fill: "var(--text-secondary)", fontFamily: "Poppins" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "var(--text-muted)" }} />
                  <Radar dataKey="score" stroke={subj.color} fill={subj.color} fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]}
                    contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 12,
                      background: "var(--bg-card)", border: "1px solid var(--border)" }} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="dr__mastery-strip">
                {["Beginner", "Developing", "Proficient", "Advanced", "Master"].map((m) => (
                  <span key={m} className={`dr__mastery-pill${mastery.label === m ? " dr__mastery-pill--active" : ""}`}
                    style={mastery.label === m ? { background: mastery.color, color: "#fff" } : {}}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Weak Areas + Study Plan */}
          <div className="dr__grid-2 animate-fadeInUp">
            <div className="dr__card">
              <h3 className="dr__card-title">⚠️ Areas Needing Attention</h3>
              {r.weakBloom?.length === 0 && r.weakChapters?.length === 0 ? (
                <p style={{ color: "#22c55e", fontWeight: 600 }}>🎉 No weak areas found! Great performance.</p>
              ) : (
                <>
                  {r.weakBloom?.length > 0 && (
                    <div className="dr__weak-section">
                      <p className="dr__weak-label">Weak Bloom Levels</p>
                      <div className="dr__weak-pills">
                        {r.weakBloom.map((lvl) => (
                          <span key={lvl} className="dr__weak-pill"
                            style={{ background: BLOOM_CONFIG[lvl]?.bg, color: BLOOM_CONFIG[lvl]?.color }}>
                            {BLOOM_CONFIG[lvl]?.icon} {lvl}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.weakChapters?.length > 0 && (
                    <div className="dr__weak-section">
                      <p className="dr__weak-label">Weak Chapters</p>
                      <div className="dr__weak-pills">
                        {r.weakChapters.map((ch) => (
                          <span key={ch} className="dr__weak-pill dr__weak-pill--chapter">📖 {ch}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="dr__card">
              <h3 className="dr__card-title">📋 Personalised Study Plan</h3>
              <div className="dr__plan-list">
                {r.score < 40 && (
                  <div className="dr__plan-item dr__plan-item--red">
                    <span>1️⃣</span>
                    <div><strong>Start from scratch</strong><p>Go through all chapters in order. Focus on NCERT examples first.</p></div>
                  </div>
                )}
                {r.weakBloom?.includes("Remember") && (
                  <div className="dr__plan-item dr__plan-item--green">
                    <span>📝</span>
                    <div><strong>Build Formula Bank</strong><p>{STUDY_TIPS.Remember}</p></div>
                  </div>
                )}
                {r.weakBloom?.includes("Understand") && (
                  <div className="dr__plan-item dr__plan-item--blue">
                    <span>📖</span>
                    <div><strong>Concept Clarity</strong><p>{STUDY_TIPS.Understand}</p></div>
                  </div>
                )}
                {r.weakBloom?.includes("Apply") && (
                  <div className="dr__plan-item dr__plan-item--amber">
                    <span>🔢</span>
                    <div><strong>Practice Numericals</strong><p>{STUDY_TIPS.Apply}</p></div>
                  </div>
                )}
                {r.weakBloom?.includes("Analyze") && (
                  <div className="dr__plan-item dr__plan-item--red">
                    <span>🔍</span>
                    <div><strong>Analytical Practice</strong><p>{STUDY_TIPS.Analyze}</p></div>
                  </div>
                )}
                {r.score >= 70 && (
                  <div className="dr__plan-item dr__plan-item--green">
                    <span>🏆</span>
                    <div><strong>Maintain & Advance</strong><p>You're doing great! Attempt harder questions and timed mock tests.</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="dr__actions animate-fadeInUp">
            <button className="dr__btn dr__btn--primary"
              style={{ background: subj.gradient }}
              onClick={() => navigate(`/subjects/${activeSubj}`)}>
              📚 Start Practicing {subj.name}
            </button>
            <button className="dr__btn dr__btn--outline"
              onClick={() => navigate("/revision")}>
              🔁 Smart Revision
            </button>
            <button className="dr__btn dr__btn--outline"
              onClick={() => navigate("/analytics")}>
              📊 Full Analytics
            </button>
            {pendingSubjects.length > 0 && (
              <button className="dr__btn dr__btn--outline"
                onClick={() => navigate("/diagnostic")}>
                🧪 Test {pendingSubjects[0].name} →
              </button>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiagnosticResult;
