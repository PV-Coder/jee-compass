import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

/**
 * TopicChart — Horizontal bar chart showing per-topic score %
 * @param {Object} topicMap - { topic: { correct, total } }
 */
const TopicChart = ({ topicMap }) => {
  const data = Object.entries(topicMap).map(([topic, { correct, total }]) => ({
    topic: topic.length > 18 ? topic.slice(0, 16) + "…" : topic,
    fullTopic: topic,
    score: total > 0 ? Math.round((correct / total) * 100) : 0,
  }));

  const getColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
        <YAxis
          type="category"
          dataKey="topic"
          width={130}
          tick={{ fontSize: 11, fill: "#64748b", fontFamily: "Poppins" }}
        />
        <Tooltip
          formatter={(v, _, props) => [`${v}%`, props.payload.fullTopic]}
          contentStyle={{ borderRadius: 10, fontFamily: "Poppins", fontSize: 13 }}
        />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopicChart;
