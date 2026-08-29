import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SUBJECT_LIST } from "../data/subjects";
import "./Subjects.css";

const Subjects = () => {
  const navigate    = useNavigate();
  const [user, setUser]         = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!u) { navigate("/login"); return; }
    setUser(u);
    setProgress(JSON.parse(localStorage.getItem("jee_subject_progress") || "{}"));
  }, [navigate]);

  if (!user) return null;

  const getSubjectProgress = (subject) => {
    const attempted = subject.chapters.filter(
      (ch) => (progress[`${subject.id}_ch${ch.id}`] || 0) > 0
    );
    if (!attempted.length) return { attempted: 0, avg: 0 };
    const avg = Math.round(
      attempted.reduce((sum, ch) => sum + (progress[`${subject.id}_ch${ch.id}`] || 0), 0) /
      attempted.length
    );
    return { attempted: attempted.length, avg };
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="subjects__header animate-fadeInUp">
            <div>
              <h1 className="section-heading">📚 CBSE Class 12 Subjects</h1>
              <p className="section-sub">Choose a subject to explore its chapters and start your diagnostic test.</p>
            </div>
            <button className="subjects__back-btn" onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
          </div>

          {/* Subject Cards */}
          <div className="subjects__cards animate-fadeInUp">
            {SUBJECT_LIST.map((subject, i) => {
              const { attempted, avg } = getSubjectProgress(subject);
              const scoreColor = avg >= 70 ? "#22c55e" : avg >= 40 ? "#f59e0b" : "#ef4444";

              return (
                <div
                  key={subject.id}
                  className="subject-select-card animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.1}s`, "--subject-color": subject.color }}
                  onClick={() => navigate(`/subjects/${subject.id}`)}
                >
                  {/* Gradient Header */}
                  <div className="subject-select-card__header" style={{ background: subject.gradient }}>
                    <span className="subject-select-card__icon">{subject.icon}</span>
                    <div className="subject-select-card__title">
                      <h2>{subject.name}</h2>
                      <span>{subject.chapters.length} Chapters</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="subject-select-card__body">
                    <p className="subject-select-card__desc">{subject.description}</p>

                    <div className="subject-select-card__meta">
                      <span>{attempted} / {subject.chapters.length} attempted</span>
                      {avg > 0 && (
                        <span style={{ color: scoreColor, fontWeight: 700 }}>{avg}% avg</span>
                      )}
                    </div>

                    <div className="progress-bar progress-bar--sm">
                      <div
                        className="progress-bar__fill"
                        style={{
                          width: `${(attempted / subject.chapters.length) * 100}%`,
                          background: subject.color,
                        }}
                      />
                    </div>

                    <button
                      className="subject-select-card__btn"
                      style={{ background: subject.gradient }}
                    >
                      Explore {subject.name} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subjects;
