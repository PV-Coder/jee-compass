import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getSubjectById } from "../../data/subjects";
import { getMasteryLevel } from "../../data/curriculum";
import { getChapterMeta } from "../../data/chapterMeta";
import { getQuestionsByChapter } from "../../data/questions";
import BloomSection from "../../components/BloomSection";
import "./ChapterPage.css";

/* ── Animated counter ────────────────────────────────────── */
const Counter = ({ to, duration = 1000 }) => {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * to));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return val;
};

/* ── Circular progress ring ──────────────────────────────── */
const ProgressRing = ({ progress, color, size = 96 }) => {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="cp__ring">
      <circle cx={size/2} cy={size/2} r={r} className="cp__ring-track" strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={off}
        className="cp__ring-fill"
      />
      <text x="50%" y="46%" className="cp__ring-val" textAnchor="middle">{progress}%</text>
      <text x="50%" y="62%" className="cp__ring-sub" textAnchor="middle">Score</text>
    </svg>
  );
};

/* ── Difficulty badge config ─────────────────────────────── */
const DIFF = {
  Easy:   { color: "#16a34a", bg: "#dcfce7", icon: "🟢" },
  Medium: { color: "#d97706", bg: "#fef3c7", icon: "🟡" },
  Hard:   { color: "#dc2626", bg: "#fee2e2", icon: "🔴" },
};

/* ── Action buttons config ───────────────────────────────── */
const ACTIONS = [
  { key: "practice",  label: "Practice",  icon: "✏️",  desc: "Solve topic-wise questions at your own pace",  variant: "primary"  },
  { key: "quiz",      label: "Quiz",      icon: "⚡",  desc: "Timed quiz to test your chapter knowledge",     variant: "secondary"},
  { key: "revision",  label: "Revision",  icon: "📖",  desc: "Quick revision notes and key formulas",         variant: "outline"  },
  { key: "analytics", label: "Analytics", icon: "📊",  desc: "View your performance trends for this chapter", variant: "ghost"    },
];

/* ── Page ────────────────────────────────────────────────── */
const ChapterPage = () => {
  const { subjectId, chapterId } = useParams();
  const navigate                 = useNavigate();
  const [user, setUser]          = useState(null);
  const [progress, setProgress]  = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  const subject = getSubjectById(subjectId);
  const chapter = subject?.chapters.find((c) => c.id === Number(chapterId));
  const meta    = getChapterMeta(subjectId, chapterId);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    setProgress(JSON.parse(localStorage.getItem("jee_subject_progress") || "{}"));
  }, [navigate]);

  useEffect(() => {
    if (user && (!subject || !chapter)) navigate(`/subjects/${subjectId}`);
  }, [user, subject, chapter, subjectId, navigate]);

  if (!user || !subject || !chapter || !meta) return null;

  const prog    = progress[`${subject.id}_ch${chapter.id}`] || 0;
  const mastery = prog > 0 ? getMasteryLevel(prog) : null;
  const diff    = DIFF[meta.difficulty];
  const label   = chapter.unit || chapter.category || null;
  const scoreColor = prog >= 70 ? "#22c55e" : prog >= 40 ? "#f59e0b" : "#ef4444";

  const handleAction = (key) => {
    if (key === "practice" || key === "quiz") {
      navigate(`/quiz/${subject.id}/${chapter.id}`);
    } else if (key === "analytics") {
      navigate(`/analysis?subject=${subject.id}&chapter=${chapter.id}`);
    }
  };

  const tabs = ["overview", "objectives", "topics", "formulas", "bloom"];
  const bloomQuestions = getQuestionsByChapter(subject.id, chapter.id);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* ── Breadcrumb ── */}
          <nav className="cp__breadcrumb animate-fadeInUp">
            <button onClick={() => navigate("/subjects")}>📚 Subjects</button>
            <span>/</span>
            <button onClick={() => navigate(`/subjects/${subject.id}`)}>
              {subject.icon} {subject.name}
            </button>
            <span>/</span>
            <span>Ch {String(chapter.id).padStart(2, "0")}</span>
          </nav>

          {/* ── Hero Banner ── */}
          <div className="cp__hero animate-fadeInUp" style={{ background: subject.gradient }}>
            <div className="cp__hero-left">
              <div className="cp__hero-meta">
                <span className="cp__hero-ch">Chapter {String(chapter.id).padStart(2, "0")}</span>
                {label && <span className="cp__hero-unit">{label}</span>}
                <span className="cp__hero-diff" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {diff.icon} {meta.difficulty}
                </span>
              </div>
              <h1 className="cp__hero-title">{chapter.name}</h1>
              <p className="cp__hero-desc">{meta.overview}</p>

              <div className="cp__hero-pills">
                <span className="cp__pill">⏱ {meta.studyTimeMinutes} min</span>
                <span className="cp__pill">❓ {meta.questionCount} questions</span>
                <span className="cp__pill">🎯 {meta.examWeight}</span>
                <span className="cp__pill">📚 {chapter.topics.length} topics</span>
              </div>
            </div>

            <div className="cp__hero-right">
              {prog > 0 ? (
                <div className="cp__hero-progress">
                  <ProgressRing progress={prog} color="#fff" size={100} />
                  <div className="cp__hero-mastery">
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                      {mastery?.label}
                    </span>
                    <div className="cp__hero-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < (mastery?.stars || 0) ? "cp__star cp__star--on" : "cp__star"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cp__hero-unstarted">
                  <span className="cp__hero-unstarted-icon">{subject.icon}</span>
                  <p>Not started yet</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="cp__stats animate-fadeInUp">
            <div className="cp__stat-card">
              <div className="cp__stat-icon" style={{ background: subject.color + "18", color: subject.color }}>⏱</div>
              <div>
                <div className="cp__stat-val"><Counter to={meta.studyTimeMinutes} /> min</div>
                <div className="cp__stat-label">Study Time</div>
              </div>
            </div>
            <div className="cp__stat-card">
              <div className="cp__stat-icon" style={{ background: "#f59e0b18", color: "#d97706" }}>❓</div>
              <div>
                <div className="cp__stat-val"><Counter to={meta.questionCount} /></div>
                <div className="cp__stat-label">Questions</div>
              </div>
            </div>
            <div className="cp__stat-card">
              <div className="cp__stat-icon" style={{ background: diff.bg, color: diff.color }}>{diff.icon}</div>
              <div>
                <div className="cp__stat-val" style={{ color: diff.color }}>{meta.difficulty}</div>
                <div className="cp__stat-label">Difficulty</div>
              </div>
            </div>
            <div className="cp__stat-card">
              <div className="cp__stat-icon" style={{ background: "#8b5cf618", color: "#7c3aed" }}>🎯</div>
              <div>
                <div className="cp__stat-val">{meta.examWeight}</div>
                <div className="cp__stat-label">Board Weightage</div>
              </div>
            </div>
            <div className="cp__stat-card">
              <div className="cp__stat-icon" style={{ background: prog > 0 ? scoreColor + "22" : "#e2e8f0", color: prog > 0 ? scoreColor : "#94a3b8" }}>📈</div>
              <div>
                <div className="cp__stat-val" style={{ color: prog > 0 ? scoreColor : "var(--text-muted)" }}>
                  {prog > 0 ? <><Counter to={prog} />%</> : "—"}
                </div>
                <div className="cp__stat-label">Your Score</div>
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="cp__actions animate-fadeInUp">
            {ACTIONS.map((a, i) => (
              <button
                key={a.key}
                className={`cp__action-btn cp__action-btn--${a.variant}`}
                style={{
                  ...(a.variant === "primary" ? { background: subject.gradient } : {}),
                  ...(a.variant === "secondary" ? { background: subject.color + "18", color: subject.color, border: `1.5px solid ${subject.color}40` } : {}),
                  animationDelay: `${i * 0.07}s`,
                }}
                onClick={() => handleAction(a.key)}
              >
                <span className="cp__action-icon">{a.icon}</span>
                <div className="cp__action-text">
                  <span className="cp__action-label">{a.label}</span>
                  <span className="cp__action-desc">{a.desc}</span>
                </div>
                <span className="cp__action-arrow">→</span>
              </button>
            ))}
          </div>

          {/* ── Content Tabs ── */}
          <div className="cp__tabs animate-fadeInUp">
            {tabs.map((t) => (
              <button
                key={t}
                className={`cp__tab ${activeTab === t ? "cp__tab--active" : ""}`}
                style={activeTab === t ? { color: subject.color, borderBottomColor: subject.color } : {}}
                onClick={() => setActiveTab(t)}
              >
                {{ overview: "📋 Overview", objectives: "🎯 Objectives", topics: "📌 Topics", formulas: "🔢 Key Formulas", bloom: "🧠 Bloom's Taxonomy" }[t]}
              </button>
            ))}
          </div>

          {/* ── Tab Content ── */}
          <div className="cp__tab-content animate-fadeIn" key={activeTab}>

            {activeTab === "overview" && (
              <div className="cp__overview">
                <div className="cp__overview-main">
                  <div className="cp__section-card">
                    <h3 className="cp__section-title">About this Chapter</h3>
                    <p className="cp__overview-text">{meta.overview}</p>
                  </div>

                  {/* Progress detail */}
                  <div className="cp__section-card">
                    <h3 className="cp__section-title">Your Progress</h3>
                    {prog > 0 ? (
                      <div className="cp__progress-detail">
                        <div className="cp__progress-bar-wrap">
                          <div className="cp__progress-bar-label">
                            <span>Score</span>
                            <span style={{ color: scoreColor, fontWeight: 700 }}>{prog}%</span>
                          </div>
                          <div className="progress-bar progress-bar--lg">
                            <div className="progress-bar__fill" style={{ width: `${prog}%`, background: scoreColor }} />
                          </div>
                        </div>
                        <div className="cp__mastery-row">
                          <span className="cp__mastery-badge" style={{ background: mastery.color + "22", color: mastery.color }}>
                            {mastery.label}
                          </span>
                          <div className="cp__stars-row">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < mastery.stars ? "cp__star cp__star--on" : "cp__star"}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="cp__not-started">
                        <span>🚀</span>
                        <p>You haven't attempted this chapter yet. Start a test to track your progress!</p>
                        <button
                          className="cp__start-btn"
                          style={{ background: subject.gradient }}
                          onClick={() => navigate(`/test?subject=${subject.id}&chapter=${chapter.id}`)}
                        >
                          Start Now →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick info sidebar */}
                <div className="cp__overview-side">
                  <div className="cp__section-card">
                    <h3 className="cp__section-title">Quick Info</h3>
                    <ul className="cp__info-list">
                      <li><span>Subject</span><strong>{subject.name}</strong></li>
                      <li><span>Unit</span><strong>{label || "—"}</strong></li>
                      <li><span>Difficulty</span>
                        <strong style={{ color: diff.color }}>{diff.icon} {meta.difficulty}</strong>
                      </li>
                      <li><span>Study Time</span><strong>~{meta.studyTimeMinutes} min</strong></li>
                      <li><span>Questions</span><strong>{meta.questionCount}</strong></li>
                      <li><span>Board Marks</span><strong>{meta.examWeight}</strong></li>
                      <li><span>Topics</span><strong>{chapter.topics.length}</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "objectives" && (
              <div className="cp__section-card">
                <h3 className="cp__section-title">Learning Objectives</h3>
                <p className="cp__section-sub">After completing this chapter, you will be able to:</p>
                <ol className="cp__objectives-list">
                  {meta.objectives.map((obj, i) => (
                    <li key={i} className="cp__objective-item animate-fadeInUp" style={{ animationDelay: `${i * 0.06}s` }}>
                      <span className="cp__obj-num" style={{ background: subject.gradient }}>{i + 1}</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === "topics" && (
              <div className="cp__section-card">
                <h3 className="cp__section-title">Topics Covered</h3>
                <p className="cp__section-sub">{chapter.topics.length} topics in this chapter</p>
                <div className="cp__topics-grid">
                  {chapter.topics.map((t, i) => (
                    <div key={t} className="cp__topic-item animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s`, "--subject-color": subject.color }}>
                      <span className="cp__topic-dot" style={{ background: subject.color }} />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "formulas" && (
              <div className="cp__section-card">
                <h3 className="cp__section-title">Key Formulas & Theorems</h3>
                {meta.keyFormulas?.length > 0 ? (
                  <div className="cp__formulas-grid">
                    {meta.keyFormulas.map((f, i) => (
                      <div key={i} className="cp__formula-card animate-fadeInUp" style={{ animationDelay: `${i * 0.06}s`, "--subject-color": subject.color }}>
                        <span className="cp__formula-idx" style={{ background: subject.gradient }}>{i + 1}</span>
                        <code className="cp__formula-text">{f}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cp__empty-state">
                    <span>📐</span>
                    <p>Formula cards for this chapter will be added soon.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "bloom" && (
              <div className="cp__bloom-wrap">
                {/* Summary header */}
                <div className="cp__bloom-header cp__section-card">
                  <div className="cp__bloom-header-left">
                    <h3 className="cp__section-title">Bloom's Taxonomy</h3>
                    <p className="cp__section-sub" style={{ marginBottom: 0 }}>
                      {chapter.name} · {Object.values(bloomQuestions).flat().length} questions across 4 cognitive levels
                    </p>
                  </div>
                  <div className="cp__bloom-level-pills">
                    {["Remember","Understand","Apply","Analyze"].map((lvl, i) => {
                      const COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444"];
                      const BGS   = ["#dcfce7","#dbeafe","#fef3c7","#fee2e2"];
                      return (
                        <span key={lvl} className="cp__bloom-pill"
                          style={{ background: BGS[i], color: COLORS[i] }}>
                          {lvl} · {bloomQuestions[lvl]?.length ?? 0}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Bloom level sections */}
                <div className="cp__bloom-sections">
                  {["Remember","Understand","Apply","Analyze"].map((lvl, i) => {
                    const BLOOM_CONFIG = {
                      Remember:   { color: "#22c55e", bg: "#dcfce7", icon: "🟢", desc: "Recall facts, definitions and basic concepts" },
                      Understand: { color: "#3b82f6", bg: "#dbeafe", icon: "🔵", desc: "Explain ideas, interpret and classify concepts" },
                      Apply:      { color: "#f59e0b", bg: "#fef3c7", icon: "🟠", desc: "Use knowledge to solve problems in new situations" },
                      Analyze:    { color: "#ef4444", bg: "#fee2e2", icon: "🔴", desc: "Draw connections, compare and break down information" },
                    };
                    const cfg = BLOOM_CONFIG[lvl];
                    return (
                      <BloomSection
                        key={lvl}
                        level={lvl}
                        color={cfg.color}
                        bg={cfg.bg}
                        icon={cfg.icon}
                        desc={cfg.desc}
                        questions={bloomQuestions[lvl] ?? []}
                        index={i}
                      />
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ── Chapter Navigation ── */}
          <div className="cp__chapter-nav animate-fadeInUp">
            {chapter.id > 1 && (
              <button
                className="cp__nav-btn cp__nav-btn--prev"
                onClick={() => navigate(`/subjects/${subject.id}/${chapter.id - 1}`)}
              >
                <span className="cp__nav-arrow">←</span>
                <div>
                  <span className="cp__nav-label">Previous</span>
                  <span className="cp__nav-name">
                    {subject.chapters.find((c) => c.id === chapter.id - 1)?.name}
                  </span>
                </div>
              </button>
            )}
            <button
              className="cp__nav-btn cp__nav-btn--back"
              onClick={() => navigate(`/subjects/${subject.id}`)}
              style={{ background: subject.gradient }}
            >
              All Chapters
            </button>
            {chapter.id < subject.chapters.length && (
              <button
                className="cp__nav-btn cp__nav-btn--next"
                onClick={() => navigate(`/subjects/${subject.id}/${chapter.id + 1}`)}
              >
                <div>
                  <span className="cp__nav-label">Next</span>
                  <span className="cp__nav-name">
                    {subject.chapters.find((c) => c.id === chapter.id + 1)?.name}
                  </span>
                </div>
                <span className="cp__nav-arrow">→</span>
              </button>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChapterPage;
