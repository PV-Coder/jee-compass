import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: "🎯", title: "Diagnostic Tests", desc: "Chapter-wise tests for Physics, Chemistry & Maths mapped to CBSE Class 12 syllabus." },
    { icon: "📊", title: "Bloom's Analytics", desc: "Deep performance breakdown across Understand, Apply, Analyse and Evaluate levels." },
    { icon: "💡", title: "AI Recommendations", desc: "Personalised YouTube videos, NCERT notes and practice questions for weak topics." },
    { icon: "🏆", title: "Gamification", desc: "Earn XP, badges, streaks and mastery levels as you progress through chapters." },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-circles">
          <span /><span /><span />
        </div>
        <div className="container hero__content animate-fadeInUp">
          <div className="hero__badge">🚀 AI-Powered Learning Analytics for JEE Aspirants</div>
          <h1 className="hero__title">
            Master JEE with <span className="hero__title-accent">EduPilot</span>
          </h1>
          <p className="hero__subtitle">
            EduPilot is an AI-powered competency assessment platform that identifies your weak
            areas, analyses your Bloom's taxonomy performance, and gives personalised recommendations.
          </p>
          <div className="hero__actions">
            <Button size="lg" onClick={() => navigate("/signup")}>Get Started Free</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>Login</Button>
          </div>
          <div className="hero__stats">
            <div className="hero__stat"><strong>3</strong><span>Subjects</span></div>
            <div className="hero__stat"><strong>42</strong><span>Chapters</span></div>
            <div className="hero__stat"><strong>4</strong><span>Bloom Levels</span></div>
            <div className="hero__stat"><strong>100%</strong><span>Free</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="features__heading">Why EduPilot?</h2>
          <p className="features__sub">Everything you need to crack JEE, in one place.</p>
          <div className="features__grid">
            {features.map((f, i) => (
              <div className="feature-card animate-fadeInUp" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta__inner">
          <h2>Ready to find your weak spots?</h2>
          <p>Take a free diagnostic test and get personalised recommendations in minutes.</p>
          <Button size="lg" onClick={() => navigate("/signup")}>Start Your Free Test →</Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;