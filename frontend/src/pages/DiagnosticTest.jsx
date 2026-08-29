import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SUBJECTS, BLOOM_LEVELS } from "../data/curriculum";
import { DIAGNOSTIC_QUESTION_BANK } from "../data/diagnosticQuestions";
import { recordTestCompletion } from "../utils/progress";
import "./DiagnosticTest.css";

const TIMER_SECONDS = 50 * 60; // 50 minutes

const BLOOM_CONFIG = {
  Remember:   { color: "#22c55e", bg: "#dcfce7" },
  Understand: { color: "#3b82f6", bg: "#dbeafe" },
  Apply:      { color: "#f59e0b", bg: "#fef3c7" },
  Analyze:    { color: "#ef4444", bg: "#fee2e2" },
};

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ── Pick N questions evenly across bloom levels ─────────── */
const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Five real, syllabus-aligned questions at every Bloom level (20 in total).
const pickQuestions = (subjectId) => shuffle(
  BLOOM_LEVELS.flatMap(({ id: level }) =>
    shuffle(DIAGNOSTIC_QUESTION_BANK.filter(
      (question) => question.subjectId === subjectId && question.bloomLevel === level
    )).slice(0, 5)
  )
);

/* ── Subject Selection Screen ────────────────────────────── */
const SubjectSelect = ({ onSelect }) => (
  <div className="diag__select animate-fadeInUp">
    <div className="diag__select-hero">
      <span>🧪</span>
      <h1>Diagnostic Test</h1>
      <p>
        A 50-minute subject-wise test to evaluate your current level across
        all Bloom's taxonomy dimensions. Choose a subject to begin.
      </p>
    </div>
    <div className="diag__subject-cards">
      {Object.values(SUBJECTS).map((s) => (
        <button key={s.id} className="diag__subject-card" onClick={() => onSelect(s)}>
          <div className="diag__subject-card-header" style={{ background: s.gradient }}>
            <span>{s.icon}</span>
            <h2>{s.name}</h2>
          </div>
          <div className="diag__subject-card-body">
            <p>{s.chapters.length} chapters · 20 questions · 50 min</p>
            <div className="diag__bloom-pills">
              {BLOOM_LEVELS.map((b) => (
                <span key={b.id} style={{ background: b.bg, color: b.color }}>{b.id}</span>
              ))}
            </div>
            <span className="diag__start-label">Start Test →</span>
          </div>
        </button>
      ))}
    </div>
    <p className="diag__note">
      💡 Each test has 20 questions (5 per Bloom level) drawn from all chapters.
      Results are used to personalise your study plan.
    </p>
  </div>
);

/* ── Main Test ───────────────────────────────────────────── */
const DiagnosticTest = () => {
  const navigate = useNavigate();
  const [subject,   setSubject]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [timeLeft,  setTimeLeft]  = useState(TIMER_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const timerRef  = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) navigate("/login");
  }, [navigate]);

  // Start timer once subject is chosen
  useEffect(() => {
    if (!subject || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { submitRef.current?.(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [subject, submitted]);

  const handleSelect = (subj) => {
    setSubject(subj);
    setQuestions(pickQuestions(subj.id));
    setTimeLeft(TIMER_SECONDS);
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
  };

  const handleSubmit = useCallback(() => {
    if (submitted || !subject || questions.length === 0) return;
    clearInterval(timerRef.current);
    setSubmitted(true);

    // Compute result
    let correct = 0;
    const bloomMap = {};
    const chapterMap = {};

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) correct++;

      // Bloom
      if (!bloomMap[q.bloomLevel]) bloomMap[q.bloomLevel] = { correct: 0, total: 0 };
      bloomMap[q.bloomLevel].total++;
      if (isCorrect) bloomMap[q.bloomLevel].correct++;

      // Chapter
      const key = q.chapterId;
      if (!chapterMap[key]) chapterMap[key] = { correct: 0, total: 0 };
      chapterMap[key].total++;
      if (isCorrect) chapterMap[key].correct++;
    });

    const score = Math.round((correct / questions.length) * 100);

    // Weak bloom levels (< 50%)
    const weakBloom = Object.entries(bloomMap)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
      .map(([lvl]) => lvl);

    // Weak chapters (< 50%)
    const weakChapters = Object.entries(chapterMap)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
      .map(([chId]) => {
        const ch = subject.chapters.find((c) => c.id === Number(chId));
        return ch ? ch.name : `Chapter ${chId}`;
      });

    const result = {
      subjectId:    subject.id,
      subjectName:  subject.name,
      subjectIcon:  subject.icon,
      subjectGradient: subject.gradient,
      subjectColor: subject.color,
      score,
      correct,
      total:        questions.length,
      bloomMap,
      chapterMap,
      weakBloom,
      weakChapters,
      timeTaken:    TIMER_SECONDS - timeLeft,
      date:         new Date().toISOString(),
      questions:    questions.map((q) => ({
        id:            q.id,
        question:      q.question,
        options:       q.options,
        correctAnswer: q.correctAnswer,
        selectedAnswer: answers[q.id] ?? null,
        isCorrect:     answers[q.id] === q.correctAnswer,
        bloomLevel:    q.bloomLevel,
        chapterId:     q.chapterId,
      })),
    };

    // Save diagnostic result (keyed by subject)
    const existing = JSON.parse(localStorage.getItem("jee_diagnostic_result") || "{}");
    existing[subject.id] = result;
    localStorage.setItem("jee_diagnostic_result", JSON.stringify(existing));

    // Also record in shared test history so Dashboard/Analytics/Profile update
    recordTestCompletion({
      subjectId:    subject.id,
      subject:      subject.id,
      chapterId:    null,
      chapterName:  "Diagnostic Test",
      subjectName:  subject.name,
      score,
      correct,
      total:        questions.length,
      totalTime:    TIMER_SECONDS - timeLeft,
      date:         result.date,
      bloomMap,
      weakTopics:   weakChapters,
    });

    navigate("/diagnostic/result");
  }, [submitted, subject, questions, answers, timeLeft, navigate]);

  submitRef.current = handleSubmit;

  // ── Subject not chosen yet
  if (!subject) return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content"><div className="container"><SubjectSelect onSelect={handleSelect} /></div></main>
      <Footer />
    </div>
  );

  const q        = questions[current];
  const bloom    = BLOOM_CONFIG[q?.bloomLevel] || BLOOM_CONFIG.Remember;
  const answered = Object.keys(answers).length;
  const pct      = Math.round(((current + 1) / questions.length) * 100);
  const danger   = timeLeft < 300;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="test-page">
        <div className="container">

          {/* Header */}
          <div className="test-header animate-fadeInUp">
            <div className="test-header__info">
              <span className="test-header__subject" style={{ color: subject.color }}>
                {subject.icon} {subject.name} — Diagnostic Test
              </span>
              <span className="test-header__chapter">
                Q{current + 1}/{questions.length} · {answered} answered
              </span>
            </div>
            <div className={`test-timer${danger ? " test-timer--danger" : ""}`}>
              ⏱ {fmt(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="test-progress animate-fadeInUp">
            <div className="test-progress__bar">
              <div className="test-progress__fill"
                style={{ width: `${pct}%`, background: subject.gradient }} />
            </div>
            <div className="test-progress__meta">
              <span>Question {current + 1} of {questions.length}</span>
              <span>{answered} answered · {questions.length - answered} remaining</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="test-card animate-fadeInUp" key={q.id}>
            <div className="test-card__meta">
              <span className="badge badge--bloom"
                style={{ background: bloom.bg, color: bloom.color }}>
                🧠 {q.bloomLevel}
              </span>
              <span className="badge badge--topic">
                Ch {q.chapterId}
              </span>
            </div>

            <p className="test-card__question">
              <span className="test-card__qno">Q{current + 1}.</span> {q.question}
            </p>

            <div className="test-card__options">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === i;
                return (
                  <button key={i}
                    className={`option${selected ? " option--selected" : ""}`}
                    style={selected ? { borderColor: subject.color, background: subject.color + "12" } : {}}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: i }))}>
                    <span className="option__letter"
                      style={selected ? { background: subject.color, color: "#fff" } : {}}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="test-nav animate-fadeInUp">
            <button className="diag__nav-btn diag__nav-btn--outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}>
              ← Previous
            </button>

            <div className="test-nav__dots">
              {questions.map((_, i) => (
                <button key={i}
                  className={`dot${i === current ? " dot--active" : ""}${answers[questions[i]?.id] !== undefined ? " dot--answered" : ""}`}
                  onClick={() => setCurrent(i)}
                  title={`Q${i + 1}`} />
              ))}
            </div>

            {current < questions.length - 1 ? (
              <button className="diag__nav-btn"
                style={{ background: subject.gradient }}
                onClick={() => setCurrent((c) => c + 1)}>
                Next →
              </button>
            ) : (
              <button className="diag__nav-btn diag__nav-btn--submit"
                onClick={handleSubmit}>
                Submit Test ✓
              </button>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiagnosticTest;
