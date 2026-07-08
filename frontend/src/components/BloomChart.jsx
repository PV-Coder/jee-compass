import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * BloomChart — Radar chart showing performance across Bloom's taxonomy levels
 * @param {Object} bloomMap - { bloomLevel: { correct, total } }
 */
const BloomChart = ({ bloomMap }) => {
  const data = Object.entries(bloomMap).map(([level, { correct, total }]) => ({
    level,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="level" tick={{ fontSize: 12, fill: "#64748b", fontFamily: "Poppins" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <Radar
          name="Score %"
          dataKey="score"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, "Score"]}
          contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 13 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default BloomChart;
