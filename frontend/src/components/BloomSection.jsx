import { useState } from "react";
import "./BloomSection.css";

/* ── Mini SVG ring ───────────────────────────────────────── */
const MiniRing = ({ done, total, color, size = 48 }) => {
  const pct  = total > 0 ? Math.round((done / total) * 100) : 0;
  const r    = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="bs__ring">
      <circle cx={size/2} cy={size/2} r={r} className="bs__ring-track" strokeWidth={4} />
      <circle
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={off}
        className="bs__ring-fill"
      />
      <text x="50%" y="56%" className="bs__ring-text" textAnchor="middle">{pct}%</text>
    </svg>
  );
};

/* ── Question Card ───────────────────────────────────────── */
const QuestionCard = ({ question, index, color, bg }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bs__q-card" style={{ "--bloom-color": color, "--bloom-bg": bg }}>
      <div className="bs__q-header">
        <span className="bs__q-num" style={{ background: color }}>Q{index + 1}</span>
        <span className="bs__q-diff">{question.difficulty}</span>
      </div>

      <p className="bs__q-text">{question.question}</p>

      <div className="bs__q-options">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={`bs__q-option ${revealed && i === question.correctAnswer ? "bs__q-option--correct" : ""}`}
          >
            <span className="bs__q-opt-label">{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
          </div>
        ))}
      </div>

      {revealed && (
        <div className="bs__q-explanation animate-fadeIn">
          <span className="bs__q-exp-icon">💡</span>
          <p>{question.explanation}</p>
        </div>
      )}

      <button
        className="bs__q-reveal-btn"
        style={{ color, borderColor: color + "40", background: bg }}
        onClick={() => setRevealed((r) => !r)}
      >
        {revealed ? "Hide Answer" : "Reveal Answer"}
      </button>
    </div>
  );
};

/* ── BloomSection ────────────────────────────────────────── */
/**
 * @param {{ level: import("../data/curriculum").BloomLevel, color: string, bg: string, icon: string, desc: string, questions: import("../data/questions").Question[], index: number }} props
 */
const BloomSection = ({ level, color, bg, icon, desc, questions, index }) => {
  const [open, setOpen] = useState(index === 0);

  // placeholder: 0 done until scoring is implemented
  const done  = 0;
  const total = questions.length;

  return (
    <div
      className={`bs__section animate-fadeInUp ${open ? "bs__section--open" : ""}`}
      style={{ "--bloom-color": color, "--bloom-bg": bg, animationDelay: `${index * 0.1}s` }}
    >
      {/* ── Header (always visible) ── */}
      <button className="bs__header" onClick={() => setOpen((o) => !o)}>
        <div className="bs__header-left">
          <div className="bs__level-icon" style={{ background: bg, border: `2px solid ${color}30` }}>
            {icon}
          </div>
          <div className="bs__header-info">
            <div className="bs__header-top">
              <span className="bs__level-name" style={{ color }}>{level}</span>
              <span className="bs__q-count" style={{ background: bg, color }}>{total} questions</span>
            </div>
            <p className="bs__level-desc">{desc}</p>
          </div>
        </div>

        <div className="bs__header-right">
          <MiniRing done={done} total={total} color={color} />
          <div className="bs__header-meta">
            <span className="bs__done-label">{done}/{total} done</span>
            <span className="bs__diff-badge">{questions[0]?.difficulty}</span>
          </div>
          <span className="bs__chevron" style={{ color }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* ── Progress bar (always visible) ── */}
      <div className="bs__progress-bar">
        <div
          className="bs__progress-fill"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, background: color }}
        />
      </div>

      {/* ── Questions (collapsible) ── */}
      {open && (
        <div className="bs__questions animate-fadeIn">
          <div className="bs__questions-grid">
            {questions.map((q, i) => (
              <QuestionCard key={q.id} question={q} index={i} color={color} bg={bg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BloomSection;
