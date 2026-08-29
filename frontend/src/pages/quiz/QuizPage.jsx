import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getSubjectById } from "../../data/subjects";
import { getQuestionsByChapter } from "../../data/questions";
import { getChapterMeta } from "../../data/chapterMeta";
import { PHYSICS_CH1_QUESTIONS } from "../../data/physicsChapter1Questions";
import { recordTestCompletion, computeWeakTopics } from "../../utils/progress";
import "./QuizPage.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const BLOOM_CONFIG = {
  Remember:   { color: "#22c55e", bg: "#dcfce7", label: "Remember" },
  Understand: { color: "#3b82f6", bg: "#dbeafe", label: "Understand" },
  Apply:      { color: "#f59e0b", bg: "#fef3c7", label: "Apply" },
  Analyze:    { color: "#ef4444", bg: "#fee2e2", label: "Analyze" },
  Evaluate:   { color: "#8b5cf6", bg: "#ede9fe", label: "Evaluate" },
};

const DIFF_CONFIG = {
  Easy:   { color: "#16a34a", bg: "#dcfce7" },
  Medium: { color: "#d97706", bg: "#fef3c7" },
  Hard:   { color: "#dc2626", bg: "#fee2e2" },
};

// 135 minutes for 120 questions → 67.5 sec/question
const SECONDS_PER_QUESTION = 67.5;

// ─── Timer display ────────────────────────────────────────────────────────────
const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

// ─── Circular timer ring ──────────────────────────────────────────────────────
const TimerRing = ({ timeLeft, total, danger }) => {
  const size = 64, sw = 5;
  const r    = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (timeLeft / total) * circ;
  const color = danger ? "#ef4444" : "#22c55e";
  return (
    <svg width={size} height={size} className="qz__timer-ring">
      <circle cx={size/2} cy={size/2} r={r} className="qz__timer-track" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={off} className="qz__timer-fill" />
      <text x="50%" y="38%" className="qz__timer-text" textAnchor="middle"
        style={{ fill: danger ? "#ef4444" : "var(--text-primary)" }}>
        {formatTime(timeLeft)}
      </text>
      <text x="50%" y="62%" className="qz__timer-sub" textAnchor="middle">left</text>
    </svg>
  );
};

// ─── Question palette dot ─────────────────────────────────────────────────────
const PaletteDot = ({ index, isCurrent, isAnswered, isSkipped, onClick }) => (
  <button
    className={[
      "qz__dot",
      isCurrent  ? "qz__dot--current"  : "",
      isAnswered ? "qz__dot--answered" : "",
      isSkipped  ? "qz__dot--skipped"  : "",
    ].join(" ")}
    onClick={onClick}
    title={`Q${index + 1}`}
  >
    {index + 1}
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const QuizPage = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const subject  = getSubjectById(subjectId);
  const chapter  = subject?.chapters.find((c) => c.id === Number(chapterId));
  const meta     = getChapterMeta(subjectId, chapterId);

  // Use topic-wise questions for Physics Chapter 1, fallback to old bank
  const allQuestions = (() => {
    if (!subject || !chapter) return [];
    if (subjectId === "physics" && Number(chapterId) === 1) {
      return PHYSICS_CH1_QUESTIONS;
    }
    const grouped = getQuestionsByChapter(subjectId, chapterId);
    return ["Remember", "Understand", "Apply", "Analyze"].flatMap((l) => grouped[l] ?? []);
  })();

  // Quiz duration scales with question count (120 questions → 135 minutes)
  const quizDuration = Math.round(allQuestions.length * SECONDS_PER_QUESTION);

  // ── State ──────────────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(null);
  const [current,     setCurrent]     = useState(0);
  const [answers,     setAnswers]     = useState({});   // { qId: optionIndex }
  const [skipped,     setSkipped]     = useState({});   // { qId: true }
  const [timeLeft,    setTimeLeft]    = useState(quizDuration);
  const [qTimes,      setQTimes]      = useState({});   // { qId: seconds spent }
  const [qStart,      setQStart]      = useState(Date.now());
  const [submitted,   setSubmitted]   = useState(false);
  const [animDir,     setAnimDir]     = useState("right"); // slide direction
  const timerRef  = useRef(null);
  const submitRef  = useRef(null);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    if (user && (!subject || !chapter)) navigate(`/subjects/${subjectId}`);
  }, [user, subject, chapter, subjectId, navigate]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { submitRef.current?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [user, submitted]);

  // ── Record time per question when navigating ───────────────────────────────
  const recordQTime = useCallback((qId) => {
    const elapsed = Math.round((Date.now() - qStart) / 1000);
    setQTimes((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + elapsed }));
    setQStart(Date.now());
  }, [qStart]);

  const goTo = (index, dir = "right") => {
    if (index < 0 || index >= allQuestions.length) return;
    recordQTime(allQuestions[current].id);
    setAnimDir(dir);
    setCurrent(index);
  };

  // ── Answer selection ───────────────────────────────────────────────────────
  const selectAnswer = (optionIndex) => {
    const qId = allQuestions[current].id;
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
    setSkipped((prev) => { const n = { ...prev }; delete n[qId]; return n; });
  };

  // ── Skip ───────────────────────────────────────────────────────────────────
  const skipQuestion = () => {
    const qId = allQuestions[current].id;
    setSkipped((prev) => ({ ...prev, [qId]: true }));
    if (current < allQuestions.length - 1) goTo(current + 1, "right");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    submitRef.current = null;
    if (submitted) return;
    clearInterval(timerRef.current);
    setSubmitted(true);

    // Record time for current question
    const finalQTimes = { ...qTimes };
    const curId = allQuestions[current]?.id;
    if (curId) {
      const elapsed = Math.round((Date.now() - qStart) / 1000);
      finalQTimes[curId] = (finalQTimes[curId] || 0) + elapsed;
    }

    // Build result payload
    const totalTime = quizDuration - timeLeft;
    const result = {
      subjectId,
      chapterId: Number(chapterId),
      subjectName: subject.name,
      chapterName: chapter.name,
      date: new Date().toISOString(),
      totalTime,
      questions: allQuestions.map((q) => ({
        id:            q.id,
        question:      q.question,
        options:       q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: answers[q.id] ?? null,
        isSkipped:     !!skipped[q.id],
        isCorrect:     answers[q.id] === q.correctAnswer,
        bloomLevel:    q.bloomLevel,
        difficulty:    q.difficulty,
        topicId:       q.topicId,
        topicName:     q.topicName,
        explanation:   q.explanation,
        timeTaken:     finalQTimes[q.id] || 0,
      })),
    };

    // Compute score
    const correct = result.questions.filter((q) => q.isCorrect).length;
    result.score  = Math.round((correct / allQuestions.length) * 100);
    result.correct = correct;
    result.total   = allQuestions.length;

    // Persist
    localStorage.setItem("jee_quiz_result", JSON.stringify(result));

    // Update subject progress
    const progress = JSON.parse(localStorage.getItem("jee_subject_progress") || "{}");
    const key = `${subjectId}_ch${chapterId}`;
    progress[key] = result.score;
    localStorage.setItem("jee_subject_progress", JSON.stringify(progress));

    // Update test history with bloomMap + weakTopics, award XP, update streak
    const bloomMap = {};
    result.questions.forEach((q) => {
      if (!bloomMap[q.bloomLevel]) bloomMap[q.bloomLevel] = { correct: 0, total: 0 };
      bloomMap[q.bloomLevel].total++;
      if (q.isCorrect) bloomMap[q.bloomLevel].correct++;
    });
    const weakTopics = computeWeakTopics(result.questions);
    recordTestCompletion({
      subjectId,
      subject: subjectId,
      chapterId: Number(chapterId),
      chapterName: chapter.name,
      subjectName: subject.name,
      score: result.score,
      correct: result.correct,
      total: result.total,
      totalTime,
      date: result.date,
      bloomMap,
      weakTopics,
      questions: result.questions,
    });

    navigate(`/quiz/${subjectId}/${chapterId}/result`);
  }, [submitted, allQuestions, answers, skipped, qTimes, qStart, current, timeLeft, quizDuration, subjectId, chapterId, subject, chapter, navigate]);

  // Keep submitRef always pointing to latest handleSubmit
  submitRef.current = handleSubmit;

  if (!user || !subject || !chapter || allQuestions.length === 0) return null;

  const q          = allQuestions[current];
  const bloom      = BLOOM_CONFIG[q.bloomLevel] || { color: "#3b82f6", bg: "#dbeafe", label: q.bloomLevel };
  const diff       = DIFF_CONFIG[q.difficulty] || { color: "#f59e0b", bg: "#fef3c7" };
  const answered   = Object.keys(answers).length;
  const skippedCnt = Object.keys(skipped).length;
  const danger     = timeLeft < 180;
  const pct        = Math.round(((current + 1) / allQuestions.length) * 100);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="qz__page">
        <div className="qz__layout">

          {/* ── Left: Question area ── */}
          <div className="qz__main">

            {/* Top bar */}
            <div className="qz__topbar animate-fadeInUp">
              <div className="qz__topbar-info">
                <span className="qz__subject-badge" style={{ background: subject.color + "18", color: subject.color }}>
                  {subject.icon} {subject.name}
                </span>
                <span className="qz__chapter-name">{chapter.name}</span>
              </div>
              <div className={`qz__timer-wrap ${danger ? "qz__timer-wrap--danger" : ""}`}>
                <TimerRing timeLeft={timeLeft} total={quizDuration} danger={danger} />
              </div>
            </div>

            {/* Progress bar */}
            <div className="qz__progress animate-fadeInUp">
              <div className="qz__progress-bar">
                <div className="qz__progress-fill" style={{ width: `${pct}%`, background: subject.gradient }} />
              </div>
              <div className="qz__progress-meta">
                <span>Question <strong>{current + 1}</strong> of {allQuestions.length}</span>
                <span>{answered} answered · {skippedCnt} skipped</span>
              </div>
            </div>

            {/* Question card */}
            <div className={`qz__card animate-${animDir === "right" ? "slideRight" : "slideLeft"}`}
              key={q.id}
              style={{ "--bloom-color": bloom.color, "--bloom-bg": bloom.bg }}
            >
              {/* Card header */}
              <div className="qz__card-header">
                <div className="qz__card-badges">
                  <span className="qz__bloom-badge" style={{ background: bloom.bg, color: bloom.color }}>
                    {bloom.label}
                  </span>
                  <span className="qz__diff-badge" style={{ background: diff.bg, color: diff.color }}>
                    {q.difficulty}
                  </span>
                  {q.topicName && (
                    <span className="qz__topic-badge" style={{ background: subject.color + "15", color: subject.color }}>
                      {q.topicName}
                    </span>
                  )}
                </div>
                <span className="qz__q-counter">Q{current + 1}/{allQuestions.length}</span>
              </div>

              {/* Bloom accent bar */}
              <div className="qz__bloom-bar" style={{ background: bloom.color }} />

              {/* Question text */}
              <p className="qz__question">{q.question}</p>

              {/* Options */}
              <div className="qz__options">
                {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      className={`qz__option ${isSelected ? "qz__option--selected" : ""}`}
                      style={isSelected ? { borderColor: bloom.color, background: bloom.bg } : {}}
                      onClick={() => selectAnswer(i)}
                    >
                      <span
                        className="qz__opt-letter"
                        style={isSelected ? { background: bloom.color, color: "#fff" } : {}}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="qz__opt-text">{opt}</span>
                      {isSelected && <span className="qz__opt-check" style={{ color: bloom.color }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="qz__nav animate-fadeInUp">
              <button
                className="qz__nav-btn qz__nav-btn--prev"
                disabled={current === 0}
                onClick={() => goTo(current - 1, "left")}
              >
                ← Previous
              </button>

              <button className="qz__nav-btn qz__nav-btn--skip" onClick={skipQuestion}>
                Skip →
              </button>

              {current < allQuestions.length - 1 ? (
                <button
                  className="qz__nav-btn qz__nav-btn--next"
                  style={{ background: subject.gradient }}
                  onClick={() => goTo(current + 1, "right")}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="qz__nav-btn qz__nav-btn--submit"
                  onClick={handleSubmit}
                >
                  Submit Quiz ✓
                </button>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <aside className="qz__sidebar animate-fadeInUp">

            {/* Stats */}
            <div className="qz__sidebar-card">
              <h3 className="qz__sidebar-title">Progress</h3>
              <div className="qz__sidebar-stats">
                <div className="qz__sidebar-stat">
                  <span className="qz__sidebar-stat-val" style={{ color: "#22c55e" }}>{answered}</span>
                  <span className="qz__sidebar-stat-label">Answered</span>
                </div>
                <div className="qz__sidebar-stat">
                  <span className="qz__sidebar-stat-val" style={{ color: "#f59e0b" }}>{skippedCnt}</span>
                  <span className="qz__sidebar-stat-label">Skipped</span>
                </div>
                <div className="qz__sidebar-stat">
                  <span className="qz__sidebar-stat-val" style={{ color: "#94a3b8" }}>
                    {allQuestions.length - answered - skippedCnt}
                  </span>
                  <span className="qz__sidebar-stat-label">Remaining</span>
                </div>
              </div>
            </div>

            {/* Question palette */}
            <div className="qz__sidebar-card">
              <h3 className="qz__sidebar-title">Question Palette</h3>
              <div className="qz__palette">
                {allQuestions.map((question, i) => (
                  <PaletteDot
                    key={question.id}
                    index={i}
                    isCurrent={i === current}
                    isAnswered={answers[question.id] !== undefined}
                    isSkipped={!!skipped[question.id]}
                    onClick={() => goTo(i, i > current ? "right" : "left")}
                  />
                ))}
              </div>
              <div className="qz__palette-legend">
                <span><span className="qz__legend-dot qz__legend-dot--answered" />Answered</span>
                <span><span className="qz__legend-dot qz__legend-dot--skipped" />Skipped</span>
                <span><span className="qz__legend-dot qz__legend-dot--current" />Current</span>
                <span><span className="qz__legend-dot" />Not visited</span>
              </div>
            </div>

            {/* Bloom breakdown */}
            <div className="qz__sidebar-card">
              <h3 className="qz__sidebar-title">Bloom Levels</h3>
              <div className="qz__bloom-breakdown">
                {Object.keys(BLOOM_CONFIG).map((lvl) => {
                  const cfg   = BLOOM_CONFIG[lvl];
                  const total = allQuestions.filter((q) => q.bloomLevel === lvl).length;
                  const done  = allQuestions.filter((q) => q.bloomLevel === lvl && answers[q.id] !== undefined).length;
                  if (total === 0) return null;
                  return (
                    <div key={lvl} className="qz__bloom-row">
                      <span className="qz__bloom-dot" style={{ background: cfg.color }} />
                      <span className="qz__bloom-name" style={{ color: cfg.color }}>{lvl}</span>
                      <div className="qz__bloom-mini-bar">
                        <div style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, background: cfg.color }} />
                      </div>
                      <span className="qz__bloom-frac">{done}/{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit button */}
            <button className="qz__submit-btn" onClick={handleSubmit}>
              Submit Quiz ✓
            </button>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default QuizPage;
