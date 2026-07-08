import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { QuestionService, AnalysisService } from "../services/api";
import "./DiagnosticTest.css";

const TIMER_SECONDS = 30 * 60; // 30 minutes

const DiagnosticTest = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState({});
  const [timeLeft,  setTimeLeft]  = useState(TIMER_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(true);

  // Load questions
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!user) { navigate("/login"); return; }
    QuestionService.getAll().then((qs) => { setQuestions(qs); setLoading(false); });
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (submitted || loading) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, submitted, loading]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleSelect = (option) => {
    if (submitted) return;
    setAnswers({ ...answers, [questions[current].id]: option });
  };

  const handleSubmit = useCallback(() => {
    if (submitted) return;
    setSubmitted(true);
    const analysis = AnalysisService.compute(questions, answers);
    const record = {
      ...analysis,
      date: new Date().toISOString(),
      answers,
    };
    // Save to history
    const history = JSON.parse(localStorage.getItem("jee_test_history") || "[]");
    history.push(record);
    localStorage.setItem("jee_test_history", JSON.stringify(history));
    localStorage.setItem("jee_last_analysis", JSON.stringify(record));
    navigate("/analysis");
  }, [submitted, questions, answers, navigate]);

  if (loading) return <div className="test-loading">Loading questions…</div>;

  const q           = questions[current];
  const progress    = Math.round(((current + 1) / questions.length) * 100);
  const answered    = Object.keys(answers).length;
  const timerDanger = timeLeft < 300;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="test-page">
        <div className="container">

          {/* Header bar */}
          <div className="test-header animate-fadeInUp">
            <div className="test-header__info">
              <span className="test-header__subject">⚡ Physics — Electrostatics</span>
              <span className="test-header__chapter">{q.chapter}</span>
            </div>
            <div className={`test-timer${timerDanger ? " test-timer--danger" : ""}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="test-progress animate-fadeInUp">
            <div className="test-progress__bar">
              <div className="test-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="test-progress__meta">
              <span>Question {current + 1} of {questions.length}</span>
              <span>{answered} answered</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="test-card animate-fadeInUp">
            <div className="test-card__meta">
              <span className={`badge badge--${q.difficulty}`}>{q.difficulty}</span>
              <span className="badge badge--bloom">{q.bloomLevel}</span>
              <span className="badge badge--topic">{q.topic}</span>
            </div>

            <p className="test-card__question">
              <span className="test-card__qno">Q{current + 1}.</span> {q.question}
            </p>

            <div className="test-card__options">
              {q.options.map((opt, i) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={i}
                    className={`option${selected ? " option--selected" : ""}`}
                    onClick={() => handleSelect(opt)}
                  >
                    <span className="option__letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="test-nav animate-fadeInUp">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              ← Previous
            </Button>

            <div className="test-nav__dots">
              {questions.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === current ? " dot--active" : ""}${answers[questions[i].id] ? " dot--answered" : ""}`}
                  onClick={() => setCurrent(i)}
                  title={`Q${i + 1}`}
                />
              ))}
            </div>

            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => c + 1)}>Next →</Button>
            ) : (
              <Button variant="danger" onClick={handleSubmit}>Submit Test</Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default DiagnosticTest;
