import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getSubjectById } from "../../data/subjects";
import { saveWrongQuestionsFromResult, addBookmark, removeBookmark, isBookmarked } from "../../data/revision";
import "./QuizResult.css";

// ─── Config ───────────────────────────────────────────────────────────────────
const BLOOM_CONFIG = {
  Remember:   { color: "#22c55e", bg: "#dcfce7" },
  Understand: { color: "#3b82f6", bg: "#dbeafe" },
  Apply:      { color: "#f59e0b", bg: "#fef3c7" },
  Analyze:    { color: "#ef4444", bg: "#fee2e2" },
  Evaluate:   { color: "#8b5cf6", bg: "#ede9fe" },
};

const formatTime = (s) => {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

// ─── Score ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
  const size = 140, sw = 10;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="qr__score-ring">
      <circle cx={size/2} cy={size/2} r={r} className="qr__ring-track" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={off} className="qr__ring-fill" />
      <text x="50%" y="44%" className="qr__ring-val" textAnchor="middle">{score}%</text>
      <text x="50%" y="62%" className="qr__ring-sub" textAnchor="middle">Score</text>
    </svg>
  );
};

// ─── Result Page ──────────────────────────────────────────────────────────────
const QuizResult = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const [result, setResult]   = useState(null);
  const [filter, setFilter]   = useState("all"); // all | correct | wrong | skipped
  const [expanded, setExpanded] = useState({});

  const subject = getSubjectById(subjectId);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    const r = JSON.parse(localStorage.getItem("jee_quiz_result") || "null");
    if (!r) {
      navigate(`/subjects/${subjectId}`);
      return;
    }
    setResult(r);
    saveWrongQuestionsFromResult(r);
  }, [navigate, subjectId, chapterId]);

  if (!result || !subject) return null;

  const { score, correct, total, totalTime, questions, chapterName } = result;

  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const scoreLabel = score >= 80 ? "Excellent! 🏆" : score >= 60 ? "Good Job! 👍" : score >= 40 ? "Keep Practicing 💪" : "Needs Improvement 📚";

  // Bloom breakdown
  const bloomStats = Object.keys(BLOOM_CONFIG).map((lvl) => {
    const qs      = questions.filter((q) => q.bloomLevel === lvl);
    if (qs.length === 0) return null;
    const correct = qs.filter((q) => q.isCorrect).length;
    return { lvl, total: qs.length, correct, pct: Math.round((correct / qs.length) * 100) };
  }).filter(Boolean);

  // Filtered questions
  const filtered = questions.filter((q) => {
    if (filter === "correct") return q.isCorrect;
    if (filter === "wrong")   return !q.isCorrect && !q.isSkipped;
    if (filter === "skipped") return q.isSkipped;
    return true;
  });

  const toggleExpand = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const [, forceUpdate] = useState(0);
  const toggleBookmark = (q) => {
    isBookmarked(q.id) ? removeBookmark(q.id) : addBookmark(q);
    forceUpdate((n) => n + 1);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* ── Hero result card ── */}
          <div className="qr__hero animate-fadeInUp" style={{ "--subject-color": subject.color, background: subject.gradient }}>
            <div className="qr__hero-left">
              <div className="qr__hero-label">Quiz Complete!</div>
              <h1 className="qr__hero-title">{chapterName}</h1>
              <p className="qr__hero-subject">{subject.icon} {subject.name}</p>
              <div className="qr__hero-verdict">{scoreLabel}</div>
            </div>
            <div className="qr__hero-ring">
              <ScoreRing score={score} color="#fff" />
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="qr__stats animate-fadeInUp">
            {[
              { icon: "✅", val: correct,         label: "Correct",   color: "#22c55e" },
              { icon: "❌", val: total - correct - questions.filter(q=>q.isSkipped).length, label: "Wrong", color: "#ef4444" },
              { icon: "⏭",  val: questions.filter(q=>q.isSkipped).length, label: "Skipped", color: "#f59e0b" },
              { icon: "⏱",  val: formatTime(totalTime), label: "Time Taken", color: subject.color },
              { icon: "📊", val: `${score}%`,     label: "Score",     color: scoreColor },
            ].map((s, i) => (
              <div key={i} className="qr__stat-card animate-fadeInUp" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="qr__stat-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                <div className="qr__stat-val" style={{ color: s.color }}>{s.val}</div>
                <div className="qr__stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Bloom breakdown ── */}
          <div className="qr__bloom-card animate-fadeInUp">
            <h2 className="qr__section-title">Performance by Bloom Level</h2>
            <div className="qr__bloom-grid">
              {bloomStats.map(({ lvl, total, correct, pct }) => {
                const cfg = BLOOM_CONFIG[lvl];
                return (
                  <div key={lvl} className="qr__bloom-item" style={{ "--bloom-color": cfg.color, "--bloom-bg": cfg.bg }}>
                    <div className="qr__bloom-item-header">
                      <span className="qr__bloom-name" style={{ color: cfg.color }}>{lvl}</span>
                      <span className="qr__bloom-score" style={{ color: cfg.color }}>{pct}%</span>
                    </div>
                    <div className="qr__bloom-bar">
                      <div style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                    <div className="qr__bloom-meta">{correct}/{total} correct</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Question review ── */}
          <div className="qr__review animate-fadeInUp">
            <div className="qr__review-header">
              <h2 className="qr__section-title">Question Review</h2>
              <div className="qr__filters">
                {["all", "correct", "wrong", "skipped"].map((f) => (
                  <button
                    key={f}
                    className={`qr__filter-btn ${filter === f ? "qr__filter-btn--active" : ""}`}
                    style={filter === f ? { background: subject.gradient, borderColor: "transparent" } : {}}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? `All (${total})` : f === "correct" ? `✅ Correct (${correct})` : f === "wrong" ? `❌ Wrong (${total - correct - questions.filter(q=>q.isSkipped).length})` : `⏭ Skipped (${questions.filter(q=>q.isSkipped).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="qr__questions">
              {filtered.map((q, i) => {
                const bloom = BLOOM_CONFIG[q.bloomLevel];
                const isOpen = !!expanded[q.id];
                const statusIcon = q.isSkipped ? "⏭" : q.isCorrect ? "✅" : "❌";
                const statusCls  = q.isSkipped ? "qr__q--skipped" : q.isCorrect ? "qr__q--correct" : "qr__q--wrong";

                return (
                  <div key={q.id} className={`qr__q-card ${statusCls} animate-fadeInUp`}
                    style={{ animationDelay: `${i * 0.04}s`, "--bloom-color": bloom.color }}>

                    {/* Question header — always visible */}
                    <button className="qr__q-header" onClick={() => toggleExpand(q.id)}>
                      <div className="qr__q-header-left">
                        <span className="qr__q-status">{statusIcon}</span>
                        <span className="qr__q-num">Q{questions.indexOf(q) + 1}</span>
                        <span className="qr__q-bloom" style={{ background: bloom.bg, color: bloom.color }}>{q.bloomLevel}</span>
                        <p className="qr__q-text-preview">{q.question}</p>
                      </div>
                      <div className="qr__q-header-right">
                        <button
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem",
                            padding: "4px", borderRadius: 6, transition: "all 0.2s" }}
                          title={isBookmarked(q.id) ? "Remove bookmark" : "Bookmark"}
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(q); }}
                        >
                          {isBookmarked(q.id) ? "🔖" : "🏷️"}
                        </button>
                        <span className="qr__q-time">⏱ {formatTime(q.timeTaken)}</span>
                        <span className="qr__q-chevron">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="qr__q-detail animate-fadeIn">
                        <p className="qr__q-full-text">{q.question}</p>

                        <div className="qr__q-options">
                          {q.options.map((opt, oi) => {
                            const isCorrect  = oi === q.correctAnswer;
                            const isSelected = oi === q.selectedAnswer;
                            const cls = isCorrect
                              ? "qr__opt--correct"
                              : isSelected && !isCorrect
                              ? "qr__opt--wrong"
                              : "";
                            return (
                              <div key={oi} className={`qr__opt ${cls}`}>
                                <span className="qr__opt-letter">{String.fromCharCode(65 + oi)}</span>
                                <span className="qr__opt-text">{opt}</span>
                                {isCorrect  && <span className="qr__opt-tag qr__opt-tag--correct">Correct</span>}
                                {isSelected && !isCorrect && <span className="qr__opt-tag qr__opt-tag--wrong">Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>

                        {q.isSkipped && (
                          <div className="qr__skipped-note">⏭ You skipped this question</div>
                        )}

                        <div className="qr__explanation">
                          <span className="qr__exp-icon">💡</span>
                          <p>{q.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="qr__actions animate-fadeInUp">
            <button
              className="qr__action-btn qr__action-btn--primary"
              style={{ background: subject.gradient }}
              onClick={() => navigate(`/quiz/${subjectId}/${chapterId}`)}
            >
              🔄 Retake Quiz
            </button>
            <button
              className="qr__action-btn qr__action-btn--outline"
              onClick={() => navigate("/revision")}
            >
              🔁 Smart Revision
            </button>
            <button
              className="qr__action-btn qr__action-btn--outline"
              onClick={() => navigate(`/subjects/${subjectId}/${chapterId}`)}
            >
              📖 Back to Chapter
            </button>
            <button
              className="qr__action-btn qr__action-btn--outline"
              onClick={() => navigate(`/subjects/${subjectId}`)}
            >
              📚 All Chapters
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuizResult;
