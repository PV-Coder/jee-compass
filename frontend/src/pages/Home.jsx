import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: "🎯", title: "Diagnostic Tests", desc: "Chapter-wise tests mapped to JEE syllabus with real exam patterns." },
    { icon: "📊", title: "Smart Analysis", desc: "Bloom's taxonomy-based performance breakdown across all topics." },
    { icon: "💡", title: "AI Recommendations", desc: "Personalised study resources for your weak areas." },
    { icon: "📈", title: "Progress Tracking", desc: "Track improvement over multiple test attempts." },
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
          <div className="hero__badge">🚀 JEE 2025 Preparation</div>
          <h1 className="hero__title">
            Master JEE with <span className="hero__title-accent">AI-Powered</span> Insights
          </h1>
          <p className="hero__subtitle">
            JEE Compass is an AI-based competency assessment platform that identifies your weak
            areas, analyses your Bloom's taxonomy performance, and gives personalised recommendations.
          </p>
          <div className="hero__actions">
            <Button size="lg" onClick={() => navigate("/signup")}>Get Started Free</Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")}>Login</Button>
          </div>
          <div className="hero__stats">
            <div className="hero__stat"><strong>20+</strong><span>Questions</span></div>
            <div className="hero__stat"><strong>4</strong><span>Bloom Levels</span></div>
            <div className="hero__stat"><strong>2</strong><span>Chapters</span></div>
            <div className="hero__stat"><strong>100%</strong><span>Free</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="features__heading">Why JEE Compass?</h2>
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
