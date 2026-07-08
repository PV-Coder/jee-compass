import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import { RecommendationService } from "../services/api";
import "./Recommendation.css";

const Recommendation = () => {
  const navigate = useNavigate();
  const [recs,      setRecs]      = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [noData,    setNoData]    = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!user) { navigate("/login"); return; }
    const analysis = JSON.parse(localStorage.getItem("jee_last_analysis") || "null");
    if (!analysis) { setNoData(true); return; }
    setWeakTopics(analysis.weakTopics);
    setRecs(RecommendationService.get(analysis.weakTopics));
  }, [navigate]);

  if (noData) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container rec-empty">
            <span>📋</span>
            <h2>No Analysis Found</h2>
            <p>Take a diagnostic test first to get personalised recommendations.</p>
            <Button onClick={() => navigate("/test")}>Take Diagnostic Test</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="rec-header animate-fadeInUp">
            <div>
              <h1>📚 Personalised Recommendations</h1>
              <p>Based on your diagnostic test, here are curated resources for your weak topics.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/analysis")}>← Back to Analysis</Button>
          </div>

          {weakTopics.length === 0 ? (
            <Card className="rec-all-strong animate-fadeInUp">
              <span>🎉</span>
              <h2>Great Job! No Weak Topics Found.</h2>
              <p>You scored above 50% in all topics. Keep practising to maintain your performance!</p>
              <Button onClick={() => navigate("/test")}>Take Another Test</Button>
            </Card>
          ) : (
            <>
              <div className="rec-summary animate-fadeInUp">
                <span>⚠️ {weakTopics.length} weak topic{weakTopics.length > 1 ? "s" : ""} identified:</span>
                <div className="rec-summary__tags">
                  {weakTopics.map((t) => <span key={t} className="rec-tag">{t}</span>)}
                </div>
              </div>

              <div className="rec-grid">
                {recs.map((rec, i) => (
                  <div key={i} className="rec-card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="rec-card__header">
                      <h3>📌 {rec.topic}</h3>
                    </div>

                    <div className="rec-card__formula">
                      <span className="rec-card__formula-label">Key Formula</span>
                      <code>{rec.formula}</code>
                    </div>

                    <div className="rec-card__resources">
                      <a href={rec.video} target="_blank" rel="noreferrer" className="rec-resource rec-resource--video">
                        <span>▶</span>
                        <div>
                          <strong>Watch Video</strong>
                          <p>YouTube explanation</p>
                        </div>
                      </a>
                      <a href={rec.notes} target="_blank" rel="noreferrer" className="rec-resource rec-resource--notes">
                        <span>📄</span>
                        <div>
                          <strong>Study Notes</strong>
                          <p>NCERT reference</p>
                        </div>
                      </a>
                      <a href={rec.practice} target="_blank" rel="noreferrer" className="rec-resource rec-resource--practice">
                        <span>✏️</span>
                        <div>
                          <strong>Practice Questions</strong>
                          <p>Topic-wise problems</p>
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* General Resources */}
          <Card className="animate-fadeInUp rec-general">
            <h2>🌐 General JEE Resources</h2>
            <div className="rec-general__grid">
              {[
                { icon: "📘", title: "NCERT Physics",    desc: "Official textbooks",          url: "https://ncert.nic.in/textbook.php" },
                { icon: "🎯", title: "JEE Main NTA",     desc: "Official exam portal",        url: "https://jeemain.nta.nic.in" },
                { icon: "📊", title: "Previous Papers",  desc: "Past year questions",         url: "https://www.embibe.com/exams/jee-main/" },
                { icon: "🧮", title: "Formula Sheets",   desc: "Quick revision formulas",     url: "https://www.vedantu.com/formula/physics-formulas-for-class-12" },
              ].map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" className="rec-general__item">
                  <span>{r.icon}</span>
                  <div>
                    <strong>{r.title}</strong>
                    <p>{r.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Recommendation;
