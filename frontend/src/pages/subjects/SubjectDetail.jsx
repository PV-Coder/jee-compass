import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getSubjectById } from "../../data/subjects";
import { getMasteryLevel } from "../../data/curriculum";
import "./SubjectDetail.css";

/* ── Completion Ring (SVG) ───────────────────────────────── */
const CompletionRing = ({ progress, color, size = 52 }) => {
  const r      = (size - 6) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="sd__ring">
      <circle cx={size / 2} cy={size / 2} r={r} className="sd__ring-track" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        className="sd__ring-fill"
      />
      <text x="50%" y="54%" className="sd__ring-text" textAnchor="middle">
        {progress > 0 ? `${progress}%` : "—"}
      </text>
    </svg>
  );
};

/* ── Status config ───────────────────────────────────────── */
const getStatus = (prog) => {
  if (prog === 0)   return { label: "Not Started", cls: "sd__status--new" };
  if (prog < 40)    return { label: "Needs Work",  cls: "sd__status--low" };
  if (prog < 70)    return { label: "In Progress", cls: "sd__status--mid" };
  if (prog < 100)   return { label: "Good",        cls: "sd__status--good" };
  return              { label: "Mastered",        cls: "sd__status--done" };
};

const scoreColor = (p) => p >= 70 ? "#22c55e" : p >= 40 ? "#f59e0b" : "#ef4444";

/* ── Chapter Card ────────────────────────────────────────── */
const ChapterCard = ({ ch, index, subject, progress, onTest, onAnalysis, onView }) => {
  const prog    = progress[`${subject.id}_ch${ch.id}`] || 0;
  const status  = getStatus(prog);
  const mastery = prog > 0 ? getMasteryLevel(prog) : null;
  const label   = ch.unit || ch.category || null;

  return (
    <div
      className={`sd__card animate-fadeInUp ${prog > 0 ? "sd__card--attempted" : ""}`}
      style={{ animationDelay: `${index * 0.04}s`, "--subject-color": subject.color }}
    >
      {/* Top row */}
      <div className="sd__card-top">
        <div className="sd__card-left">
          <div className="sd__card-num" style={{ background: subject.gradient }}>
            Ch {String(ch.id).padStart(2, "0")}
          </div>
          {label && <span className="sd__card-unit">{label}</span>}
        </div>
        <span className={`sd__status ${status.cls}`}>{status.label}</span>
      </div>

      {/* Chapter name */}
      <h3 className="sd__card-name">{ch.name}</h3>

      {/* Topics */}
      <div className="sd__card-topics">
        {ch.topics.slice(0, 4).map((t) => (
          <span key={t} className="sd__card-topic">{t}</span>
        ))}
        {ch.topics.length > 4 && (
          <span className="sd__card-topic sd__card-topic--more">
            +{ch.topics.length - 4}
          </span>
        )}
      </div>

      {/* Progress section */}
      <div className="sd__card-progress">
        <CompletionRing progress={prog} color={prog > 0 ? scoreColor(prog) : "#e2e8f0"} />
        <div className="sd__card-progress-info">
          {mastery ? (
            <>
              <span className="sd__mastery-label" style={{ color: mastery.color }}>
                {mastery.label}
              </span>
              <div className="sd__mastery-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < mastery.stars ? "sd__star sd__star--on" : "sd__star"}>★</span>
                ))}
              </div>
              <div className="progress-bar progress-bar--sm sd__card-bar">
                <div
                  className="progress-bar__fill"
                  style={{ width: `${prog}%`, background: scoreColor(prog) }}
                />
              </div>
            </>
          ) : (
            <p className="sd__card-hint">Take the test to track your progress</p>
          )}
        </div>
      </div>

      <div className="sd__card-actions">
        <button
          className="sd__btn sd__btn--primary"
          style={{ background: subject.gradient }}
          onClick={() => onView(subject.id, ch.id)}
        >
          View Chapter
        </button>
        <button
          className="sd__btn sd__btn--outline"
          style={{ borderColor: subject.color, color: subject.color }}
          onClick={() => onTest(subject.id, ch.id)}
        >
          {prog > 0 ? "↺ Retake" : "▶ Start"}
        </button>
      </div>
    </div>
  );
};

/* ── Page ────────────────────────────────────────────────── */
const SubjectDetail = () => {
  const { subjectId }           = useParams();
  const navigate                = useNavigate();
  const [user, setUser]         = useState(null);
  const [progress, setProgress] = useState({});
  const [filter, setFilter]     = useState("all");

  const subject = getSubjectById(subjectId);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    setProgress(JSON.parse(localStorage.getItem("jee_subject_progress") || "{}"));
  }, [navigate]);

  useEffect(() => {
    if (user && !subject) navigate("/subjects");
  }, [user, subject, navigate]);

  if (!user || !subject) return null;

  const getChProg   = (ch) => progress[`${subject.id}_ch${ch.id}`] || 0;
  const attempted   = subject.chapters.filter((ch) => getChProg(ch) > 0).length;
  const mastered    = subject.chapters.filter((ch) => getChProg(ch) >= 70).length;
  const overallAvg  = attempted
    ? Math.round(subject.chapters.reduce((s, ch) => s + getChProg(ch), 0) / subject.chapters.length)
    : 0;

  /* Unit/category filter options */
  const unitKey     = subject.chapters[0]?.unit ? "unit" : "category";
  const units       = ["all", ...new Set(subject.chapters.map((ch) => ch[unitKey]).filter(Boolean))];

  const filtered = filter === "all"
    ? subject.chapters
    : subject.chapters.filter((ch) => ch[unitKey] === filter);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Breadcrumb */}
          <nav className="sd__breadcrumb animate-fadeInUp">
            <button onClick={() => navigate("/subjects")}>📚 Subjects</button>
            <span>/</span>
            <span>{subject.icon} {subject.name}</span>
            <button
              style={{ marginLeft: "auto", background: subject.gradient, color: "#fff",
                border: "none", borderRadius: 10, padding: "7px 18px", fontSize: "0.82rem",
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => navigate(`/dashboard/${subject.id}`)}
            >
              📊 {subject.name} Dashboard
            </button>
          </nav>

          {/* Banner */}
          <div className="sd__banner animate-fadeInUp" style={{ background: subject.gradient }}>
            <div className="sd__banner-left">
              <span className="sd__banner-icon">{subject.icon}</span>
              <div>
                <h1>{subject.name}</h1>
                <p>{subject.description}</p>
              </div>
            </div>
            <div className="sd__banner-stats">
              <div className="sd__stat">
                <strong>{subject.chapters.length}</strong>
                <span>Chapters</span>
              </div>
              <div className="sd__stat">
                <strong>{attempted}</strong>
                <span>Attempted</span>
              </div>
              <div className="sd__stat">
                <strong>{mastered}</strong>
                <span>Mastered</span>
              </div>
              <div className="sd__stat">
                <strong>{overallAvg}%</strong>
                <span>Avg Score</span>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          {attempted > 0 && (
            <div className="sd__overall-progress animate-fadeInUp">
              <div className="sd__overall-label">
                <span>Overall Progress</span>
                <span>{attempted} / {subject.chapters.length} chapters attempted</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill"
                  style={{
                    width: `${(attempted / subject.chapters.length) * 100}%`,
                    background: subject.gradient,
                  }}
                />
              </div>
            </div>
          )}

          {/* Unit filter tabs */}
          {units.length > 2 && (
            <div className="sd__filters animate-fadeInUp">
              {units.map((u) => (
                <button
                  key={u}
                  className={`sd__filter-btn ${filter === u ? "sd__filter-btn--active" : ""}`}
                  style={filter === u ? { background: subject.gradient, borderColor: "transparent" } : {}}
                  onClick={() => setFilter(u)}
                >
                  {u === "all" ? "All Chapters" : u}
                  <span className="sd__filter-count">
                    {u === "all"
                      ? subject.chapters.length
                      : subject.chapters.filter((ch) => ch[unitKey] === u).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Chapter grid */}
          <div className="sd__grid">
            {filtered.map((ch, i) => (
              <ChapterCard
                key={ch.id}
                ch={ch}
                index={i}
                subject={subject}
                progress={progress}
                onView={(sid, cid) => navigate(`/subjects/${sid}/${cid}`)}
                onTest={(sid, cid) => navigate(`/test?subject=${sid}&chapter=${cid}`)}
                onAnalysis={(sid, cid) => navigate(`/analysis?subject=${sid}&chapter=${cid}`)}
              />
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubjectDetail;
