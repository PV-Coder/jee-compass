import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">
      <div className="footer__brand">
        <span className="footer__logo">🧭 JEE <strong>Compass</strong></span>
        <p>AI-Based Competency Assessment Platform for JEE aspirants.</p>
      </div>
      <div className="footer__links">
        <h4>Quick Links</h4>
        <a href="/dashboard">Dashboard</a>
        <a href="/test">Diagnostic Test</a>
        <a href="/analysis">Analysis</a>
        <a href="/recommendations">Recommendations</a>
      </div>
      <div className="footer__links">
        <h4>Resources</h4>
        <a href="https://ncert.nic.in" target="_blank" rel="noreferrer">NCERT Books</a>
        <a href="https://jeemain.nta.nic.in" target="_blank" rel="noreferrer">JEE Main NTA</a>
        <a href="https://www.embibe.com" target="_blank" rel="noreferrer">Practice Tests</a>
      </div>
    </div>
    <div className="footer__bottom">
      <p>© {new Date().getFullYear()} JEE Compass. Built for JEE aspirants.</p>
    </div>
  </footer>
);

export default Footer;
