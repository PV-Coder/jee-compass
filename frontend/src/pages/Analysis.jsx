import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import Button from "../components/Button";
import BloomChart from "../components/BloomChart";
import TopicChart from "../components/TopicChart";
import "./Analysis.css";

const COLORS = ["#22c55e", "#ef4444"];

const Analysis = () => {
  const navigate  = useNavigate();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("jee_user") || "null");
    if (!user) { navigate("/login"); return; }
    const data = JSON.parse(localStorage.getItem("jee_last_analysis") || "null");
    if (!data) { navigate("/dashboard"); return; }
    setAnalysis(data);
  }, [navigate]);

  if (!analysis) return null;

  const { score, correct, total, topicMap, bloomMap, weakTopics } = analysis;

  const pieData = [
    { name: "Correct",   value: correct },
    { name: "Incorrect", value: total - correct },
  ];

  const getGrade = (s) => {
    if (s >= 80) return { label: "Excellent 🏆", color: "#22c55e" };
    if (s >= 60) return { label: "Good 👍",      color: "#3b82f6" };
    if (s >= 40) return { label: "Average 📚",   color: "#f59e0b" };
    return              { label: "Needs Work 💪", color: "#ef4444" };
  };

  const grade = getGrade(score);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Score Banner */}
          <div className="analysis__banner animate-fadeInUp">
            <div className="analysis__score-circle" style={{ borderColor: grade.color }}>
              <span className="analysis__score-num" style={{ color: grade.color }}>{score}%</span>
              <span className="analysis__score-label">Score</span>
            </div>
            <div className="analysis__banner-info">
              <h1>Test Analysis</h1>
              <p className="analysis__grade" style={{ color: grade.color }}>{grade.label}</p>
              <p>{correct} out of {total} questions answered correctly.</p>
              <div className="analysis__banner-actions">
                <Button onClick={() => navigate("/recommendations")}>Get Recommendations</Button>
                <Button variant="outline" onClick={() => navigate("/test")}>Retake Test</Button>
              </div>
            </div>
          </div>

          {/* Weak Topics Alert */}
          {weakTopics.length > 0 && (
            <div className="analysis__weak-alert animate-fadeInUp">
              <span>⚠️</span>
              <div>
                <strong>Weak Topics Detected:</strong>
                <span> {weakTopics.join(", ")}</span>
              </div>
            </div>
          )}

          {/* Charts Row */}
          <div className="analysis__charts animate-fadeInUp">
            <Card>
              <h2 className="section-title">🎯 Overall Performance</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [v, ""]}
                    contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 13 }}
                  />
                  <Legend wrapperStyle={{ fontFamily: "Poppins", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h2 className="section-title">🧠 Bloom's Taxonomy Performance</h2>
              <BloomChart bloomMap={bloomMap} />
            </Card>
          </div>

          {/* Topic Performance */}
          <Card className="animate-fadeInUp">
            <h2 className="section-title">📚 Topic-wise Performance</h2>
            <div className="analysis__legend">
              <span className="legend-dot" style={{ background: "#22c55e" }} /> Strong (≥70%)
              <span className="legend-dot" style={{ background: "#f59e0b" }} /> Average (40–69%)
              <span className="legend-dot" style={{ background: "#ef4444" }} /> Weak (&lt;40%)
            </div>
            <TopicChart topicMap={topicMap} />
          </Card>

          {/* Topic Table */}
          <Card className="animate-fadeInUp">
            <h2 className="section-title">📋 Detailed Topic Breakdown</h2>
            <div className="analysis__table-wrap">
              <table className="analysis__table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Correct</th>
                    <th>Total</th>
                    <th>Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(topicMap).map(([topic, { correct: c, total: t }]) => {
                    const pct = t > 0 ? Math.round((c / t) * 100) : 0;
                    const isWeak = pct < 50;
                    return (
                      <tr key={topic}>
                        <td>{topic}</td>
                        <td>{c}</td>
                        <td>{t}</td>
                        <td>
                          <div className="table-progress">
                            <div
                              className="table-progress__fill"
                              style={{ width: `${pct}%`, background: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444" }}
                            />
                          </div>
                          <span>{pct}%</span>
                        </td>
                        <td>
                          <span className={`status-badge ${isWeak ? "status-badge--weak" : "status-badge--strong"}`}>
                            {isWeak ? "Weak" : "Strong"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
