import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SUBJECTS } from "../data/curriculum";
import {
  getRevisionQueue, getWrongQuestions, getBookmarks, getWeakChapters,
  getRecentlyPracticed, getRecommendations,
  addBookmark, removeBookmark, isBookmarked, markResolved,
  saveWrongQuestionsFromResult,
} from "../data/revision";
import "./Revision.css";

/* ── Bloom config ────────────────────────────────────────── */
const BLOOM = {
  Remember:   { color: "#22c55e", bg: "#dcfce7" },
  Understand: { color: "#3b82f6", bg: "#dbeafe" },
  Apply:      { color: "#f59e0b", bg: "#fef3c7" },
  Analyze:    { color: "#ef4444", bg: "#fee2e2" },
};

/* ── Score color ─────────────────────────────────────────── */
const sc = (s) => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";

/* ── Circular Ring ───────────────────────────────────────── */
const Ring = ({ value, size = 72, stroke = 6, color }) => {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const dash = circ * Math.min(value / 100, 1);
  return (
    <div className="ring-wrap" style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <div className="ring-wrap__label">
        <span className="ring-wrap__value" style={{ color, fontSize: "0.9rem" }}>{value}%</span>
      </div>
    </div>
  );
};

/* ── Question Card ───────────────────────────────────────── */
const QuestionCard = ({ q, onBookmark, onResolve, showResolve }) => {
  const [open, setOpen] = useState(false);
  const bloom = BLOOM[q.bloomLevel] || BLOOM.Remember;
  const bookmarked = isBookmarked(q.id);
  const subj = SUBJECTS[q.subjectId];

  return (
    <div className={`rv__qcard${open ? " rv__qcard--open" : ""}`}
      style={{ borderLeftColor: bloom.color }}>
      <div className="rv__qcard-header" onClick={() => setOpen((p) => !p)}>
        <div className="rv__qcard-meta">
          <span className="rv__qcard-bloom" style={{ background: bloom.bg, color: bloom.color }}>
            {q.bloomLevel}
          </span>
          {subj && (
            <span className="rv__qcard-subj" style={{ color: subj.color }}>
              {subj.icon} {q.chapterName || subj.name}
            </span>
          )}
          {q.attempts > 1 && (
            <span className="rv__qcard-attempts">❌ ×{q.attempts}</span>
          )}
        </div>
        <div className="rv__qcard-actions" onClick={(e) => e.stopPropagation()}>
          <button className={`rv__icon-btn${bookmarked ? " rv__icon-btn--active" : ""}`}
            title={bookmarked ? "Remove bookmark" : "Bookmark"}
            onClick={() => { bookmarked ? removeBookmark(q.id) : addBookmark(q); onBookmark?.(); }}>
            {bookmarked ? "🔖" : "🏷️"}
          </button>
          {showResolve && !q.resolved && (
            <button className="rv__icon-btn rv__icon-btn--green" title="Mark resolved"
              onClick={() => { markResolved(q.id); onResolve?.(); }}>
              ✅
            </button>
          )}
          <span className="rv__qcard-chevron">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      <p className="rv__qcard-question">{q.question}</p>

      {open && (
        <div className="rv__qcard-detail animate-fadeIn">
          <div className="rv__qcard-options">
            {(q.options || []).map((opt, i) => {
              const isCorrect  = i === q.correctAnswer;
              const isSelected = i === q.selectedAnswer;
              return (
                <div key={i} className={`rv__opt${isCorrect ? " rv__opt--correct" : isSelected ? " rv__opt--wrong" : ""}`}>
                  <span className="rv__opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                  {isCorrect  && <span className="rv__opt-tag rv__opt-tag--correct">Correct</span>}
                  {isSelected && !isCorrect && <span className="rv__opt-tag rv__opt-tag--wrong">Your Answer</span>}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="rv__explanation">
              <span>💡</span>
              <p>{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Recommendation Card ─────────────────────────────────── */
const RecCard = ({ rec, onTabSwitch, navigate }) => {
  const clsMap = { wrong: "--red", chapter: "--blue", bloom: "--purple", score: "--green", bookmark: "--amber", start: "--blue" };
  return (
    <div className={`rv__rec rv__rec${clsMap[rec.type] || "--blue"}`}>
      <span className="rv__rec-icon">{rec.icon}</span>
      <div className="rv__rec-body">
        <strong>{rec.title}</strong>
        <p>{rec.body}</p>
      </div>
      <button className="rv__rec-btn"
        onClick={() => rec.tab ? onTabSwitch(rec.tab) : rec.action && navigate(rec.action)}>
        {rec.actionLabel} →
      </button>
    </div>
  );
};

/* ── Main Page ───────────────────────────────────────────── */
const Revision = () => {
  const navigate = useNavigate();
  const [tab, setTab]           = useState("queue");
  const [, forceUpdate]         = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) navigate("/login");

    // Seed wrong questions from last quiz result if not yet saved
    const result = JSON.parse(localStorage.getItem("jee_quiz_result") || "null");
    if (result) saveWrongQuestionsFromResult(result);
  }, [navigate]);

  // Live data — recomputed on every render (refresh)
  const queue     = getRevisionQueue();
  const wrong     = getWrongQuestions();
  const bookmarks = getBookmarks();
  const weakCh    = getWeakChapters();
  const recent    = getRecentlyPracticed();
  const recs      = getRecommendations();

  const unresolvedWrong = wrong.filter((q) => !q.resolved);
  const resolvedWrong   = wrong.filter((q) => q.resolved);

  const tabs = [
    { id: "queue",     label: "📋 Queue",      count: queue.length },
    { id: "wrong",     label: "❌ Wrong",       count: unresolvedWrong.length },
    { id: "bookmarks", label: "🔖 Bookmarks",   count: bookmarks.length },
    { id: "weak",      label: "⚠️ Weak Chapters", count: weakCh.length },
    { id: "recent",    label: "🕐 Recent",      count: recent.length },
    { id: "recs",      label: "💡 Recommendations", count: recs.length },
  ];

  const switchTab = (t) => setTab(t);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="rv__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">🔁 Smart Revision</h1>
              <p className="section-sub">Targeted revision based on your performance — wrong questions, weak chapters & more.</p>
            </div>
            <button className="subjects__back-btn" onClick={() => navigate("/dashboard")}>← Dashboard</button>
          </div>

          {/* Summary Strip */}
          <div className="rv__summary animate-fadeInUp">
            {[
              { icon: "📋", val: queue.length,             label: "In Queue",       color: "#2563eb" },
              { icon: "❌", val: unresolvedWrong.length,   label: "Wrong Pending",  color: "#ef4444" },
              { icon: "🔖", val: bookmarks.length,         label: "Bookmarked",     color: "#f59e0b" },
              { icon: "⚠️", val: weakCh.length,            label: "Weak Chapters",  color: "#8b5cf6" },
              { icon: "✅", val: resolvedWrong.length,     label: "Resolved",       color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} className="rv__sum-card" style={{ borderTopColor: s.color }}>
                <span className="rv__sum-icon" style={{ background: s.color + "18", color: s.color }}>{s.icon}</span>
                <span className="rv__sum-val" style={{ color: s.color }}>{s.val}</span>
                <span className="rv__sum-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="rv__tabs animate-fadeInUp">
            {tabs.map((t) => (
              <button key={t.id}
                className={`rv__tab${tab === t.id ? " rv__tab--active" : ""}`}
                onClick={() => switchTab(t.id)}>
                {t.label}
                {t.count > 0 && <span className="rv__tab-badge">{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ── REVISION QUEUE ── */}
          {tab === "queue" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro">
                <p>Your personalised revision queue — wrong questions and weak chapters, sorted by priority.</p>
              </div>
              {queue.length === 0 ? (
                <EmptyState icon="📋" title="Queue is empty!" body="Complete some quizzes to populate your revision queue." action={() => navigate("/subjects")} actionLabel="Start a Quiz" />
              ) : (
                <div className="rv__list">
                  {queue.map((item, i) => (
                    item.type === "weak_chapter" ? (
                      <div key={item.id} className="rv__chapter-item animate-fadeInUp"
                        style={{ animationDelay: `${i * 0.04}s`, borderLeftColor: SUBJECTS[item.subjectId]?.color }}>
                        <div className="rv__chapter-item-left">
                          <span className="rv__chapter-icon">{SUBJECTS[item.subjectId]?.icon}</span>
                          <div>
                            <p className="rv__chapter-name">{item.chapterName}</p>
                            <p className="rv__chapter-sub">{item.subjectName} · Score: <strong style={{ color: sc(item.score) }}>{item.score}%</strong></p>
                          </div>
                        </div>
                        <div className="rv__chapter-item-right">
                          <Ring value={item.score} color={sc(item.score)} />
                          <button className="rv__action-btn"
                            style={{ background: SUBJECTS[item.subjectId]?.gradient }}
                            onClick={() => navigate(`/quiz/${item.subjectId}/${item.chapterId}`)}>
                            Retake →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <QuestionCard key={item.id} q={item} onBookmark={refresh} onResolve={refresh} showResolve />
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── WRONG QUESTIONS ── */}
          {tab === "wrong" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro rv__section-intro--flex">
                <p>{unresolvedWrong.length} unresolved · {resolvedWrong.length} resolved</p>
                {unresolvedWrong.length > 0 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className="pill pill--red">❌ {unresolvedWrong.length} pending</span>
                    <span className="pill pill--green">✅ {resolvedWrong.length} done</span>
                  </div>
                )}
              </div>

              {wrong.length === 0 ? (
                <EmptyState icon="❌" title="No wrong questions yet" body="Wrong answers from your quizzes will appear here automatically." action={() => navigate("/subjects")} actionLabel="Take a Quiz" />
              ) : (
                <>
                  {unresolvedWrong.length > 0 && (
                    <>
                      <p className="rv__group-label">⏳ Pending Review</p>
                      <div className="rv__list">
                        {unresolvedWrong.map((q) => (
                          <QuestionCard key={q.id} q={q} onBookmark={refresh} onResolve={refresh} showResolve />
                        ))}
                      </div>
                    </>
                  )}
                  {resolvedWrong.length > 0 && (
                    <>
                      <p className="rv__group-label" style={{ color: "#22c55e" }}>✅ Resolved</p>
                      <div className="rv__list rv__list--resolved">
                        {resolvedWrong.map((q) => (
                          <QuestionCard key={q.id} q={q} onBookmark={refresh} showResolve={false} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── BOOKMARKS ── */}
          {tab === "bookmarks" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro rv__section-intro--flex">
                <p>{bookmarks.length} bookmarked question{bookmarks.length !== 1 ? "s" : ""}</p>
                {bookmarks.length > 0 && (
                  <button className="rv__clear-btn"
                    onClick={() => { if (window.confirm("Clear all bookmarks?")) { require("../data/revision").clearBookmarks(); refresh(); } }}>
                    🗑 Clear All
                  </button>
                )}
              </div>
              {bookmarks.length === 0 ? (
                <EmptyState icon="🔖" title="No bookmarks yet" body="Tap the 🏷️ icon on any question to bookmark it for later review." />
              ) : (
                <div className="rv__list">
                  {[...bookmarks].reverse().map((q) => (
                    <QuestionCard key={q.id} q={q} onBookmark={refresh} showResolve={false} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── WEAK CHAPTERS ── */}
          {tab === "weak" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro">
                <p>Chapters where your score is below 60% — prioritise these for revision.</p>
              </div>
              {weakCh.length === 0 ? (
                <EmptyState icon="⚠️" title="No weak chapters!" body="All attempted chapters are above 60%. Keep it up!" action={() => navigate("/subjects")} actionLabel="Practice More" />
              ) : (
                <div className="rv__weak-grid">
                  {weakCh.map((ch, i) => (
                    <div key={`${ch.subjectId}_${ch.chapterId}`} className="rv__weak-card animate-fadeInUp"
                      style={{ animationDelay: `${i * 0.05}s`, borderTopColor: ch.subjectColor }}>
                      <div className="rv__weak-card-header">
                        <div className="rv__weak-card-left">
                          <span className="rv__weak-icon">{ch.subjectIcon}</span>
                          <div>
                            <p className="rv__weak-name">{ch.chapterName}</p>
                            <p className="rv__weak-sub">{ch.subjectName}</p>
                          </div>
                        </div>
                        <Ring value={ch.score} color={sc(ch.score)} />
                      </div>
                      <div className="progress-bar progress-bar--lg" style={{ margin: "12px 0 8px" }}>
                        <div className="progress-bar__fill" style={{ width: `${ch.score}%`, background: sc(ch.score) }} />
                      </div>
                      <div className="rv__weak-topics">
                        {ch.topics.slice(0, 3).map((t) => (
                          <span key={t} className="rv__weak-topic">{t}</span>
                        ))}
                        {ch.topics.length > 3 && <span className="rv__weak-topic rv__weak-topic--more">+{ch.topics.length - 3}</span>}
                      </div>
                      <div className="rv__weak-actions">
                        <button className="rv__action-btn rv__action-btn--outline"
                          style={{ borderColor: ch.subjectColor, color: ch.subjectColor }}
                          onClick={() => navigate(`/subjects/${ch.subjectId}/${ch.chapterId}`)}>
                          📖 Study
                        </button>
                        <button className="rv__action-btn"
                          style={{ background: ch.subjectGradient }}
                          onClick={() => navigate(`/quiz/${ch.subjectId}/${ch.chapterId}`)}>
                          ▶ Retake Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RECENTLY PRACTICED ── */}
          {tab === "recent" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro">
                <p>Your most recently practiced chapters — pick up where you left off.</p>
              </div>
              {recent.length === 0 ? (
                <EmptyState icon="🕐" title="No recent activity" body="Your recently practiced chapters will appear here." action={() => navigate("/subjects")} actionLabel="Start Practicing" />
              ) : (
                <div className="rv__recent-list">
                  {recent.map((r, i) => {
                    const subj = SUBJECTS[r.subjectId];
                    return (
                      <div key={i} className="rv__recent-item animate-fadeInUp"
                        style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="rv__recent-left">
                          <div className="rv__recent-avatar" style={{ background: subj?.gradient }}>
                            {subj?.icon}
                          </div>
                          <div>
                            <p className="rv__recent-name">{r.chapterName || "Chapter"}</p>
                            <p className="rv__recent-sub">
                              {subj?.name} · {r.correct}/{r.total} correct ·{" "}
                              {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                        <div className="rv__recent-right">
                          <span className="rv__recent-score" style={{ color: sc(r.score) }}>{r.score}%</span>
                          <div className="rv__recent-btns">
                            <button className="rv__action-btn rv__action-btn--sm rv__action-btn--outline"
                              style={{ borderColor: subj?.color, color: subj?.color }}
                              onClick={() => navigate(`/subjects/${r.subjectId}/${r.chapterId}`)}>
                              📖
                            </button>
                            <button className="rv__action-btn rv__action-btn--sm"
                              style={{ background: subj?.gradient }}
                              onClick={() => navigate(`/quiz/${r.subjectId}/${r.chapterId}`)}>
                              ↺ Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── RECOMMENDATIONS ── */}
          {tab === "recs" && (
            <div className="animate-fadeInUp">
              <div className="rv__section-intro">
                <p>AI-powered revision recommendations based on your quiz performance and patterns.</p>
              </div>
              <div className="rv__recs-list">
                {recs.map((rec, i) => (
                  <RecCard key={i} rec={rec} onTabSwitch={switchTab} navigate={navigate} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

/* ── Empty State ─────────────────────────────────────────── */
const EmptyState = ({ icon, title, body, action, actionLabel }) => (
  <div className="rv__empty animate-fadeIn">
    <span>{icon}</span>
    <h3>{title}</h3>
    <p>{body}</p>
    {action && <button className="rv__action-btn rv__action-btn--primary" onClick={action}>{actionLabel}</button>}
  </div>
);

export default Revision;
