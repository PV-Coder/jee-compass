import axios from "axios";
import questions from "../data/questions.json";

const API_BASE = "http://localhost:8000/api";

// ─── Question Service ────────────────────────────────────────────────
export const QuestionService = {
  // Returns all questions (local JSON; swap with axios.get for backend)
  getAll: () => Promise.resolve(questions),

  getByChapter: (chapterNo) =>
    Promise.resolve(questions.filter((q) => q.chapterNo === chapterNo)),

  // Future: fetch from FastAPI
  fetchFromAPI: () => axios.get(`${API_BASE}/questions`).then((r) => r.data),
};

// ─── Analysis Service ────────────────────────────────────────────────
export const AnalysisService = {
  /**
   * Computes full analysis from answered questions.
   * @param {Array} questions - all question objects
   * @param {Object} answers  - { questionId: selectedOption }
   * @returns analysis object
   */
  compute: (allQuestions, answers) => {
    const total = allQuestions.length;
    let correct = 0;

    const topicMap = {};   // topic -> { correct, total }
    const bloomMap = {};   // bloomLevel -> { correct, total }

    allQuestions.forEach((q) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      if (isCorrect) correct++;

      // Topic aggregation
      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (isCorrect) topicMap[q.topic].correct++;

      // Bloom aggregation
      if (!bloomMap[q.bloomLevel]) bloomMap[q.bloomLevel] = { correct: 0, total: 0 };
      bloomMap[q.bloomLevel].total++;
      if (isCorrect) bloomMap[q.bloomLevel].correct++;
    });

    const score = Math.round((correct / total) * 100);

    // Topics where score < 50% are considered weak
    const weakTopics = Object.entries(topicMap)
      .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
      .map(([topic]) => topic);

    return { score, correct, total, topicMap, bloomMap, weakTopics };
  },
};

// ─── Recommendation Service ──────────────────────────────────────────
const resourceBank = {
  "Coulomb's Law": {
    video: "https://www.youtube.com/watch?v=rYjo774UpHI",
    notes: "https://ncert.nic.in/textbook/pdf/leph101.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Coulombs-Law",
    formula: "F = kq₁q₂/r²",
  },
  "Electric Field": {
    video: "https://www.youtube.com/watch?v=mdulzEfQXDE",
    notes: "https://ncert.nic.in/textbook/pdf/leph101.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Electric-Field",
    formula: "E = F/q = kQ/r²",
  },
  "Gauss's Law": {
    video: "https://www.youtube.com/watch?v=rYjo774UpHI",
    notes: "https://ncert.nic.in/textbook/pdf/leph101.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Gauss-Law",
    formula: "∮E·dA = Q_enc/ε₀",
  },
  "Electric Dipole": {
    video: "https://www.youtube.com/watch?v=mdulzEfQXDE",
    notes: "https://ncert.nic.in/textbook/pdf/leph101.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Electric-Dipole",
    formula: "p = q·d, τ = pE sinθ",
  },
  "Electric Potential": {
    video: "https://www.youtube.com/watch?v=Vpa_uApmNoo",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Electric-Potential",
    formula: "V = kQ/r",
  },
  "Capacitance": {
    video: "https://www.youtube.com/watch?v=X4EUwTwZ110",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Capacitance",
    formula: "C = Q/V = ε₀A/d",
  },
  "Energy Stored": {
    video: "https://www.youtube.com/watch?v=X4EUwTwZ110",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Energy-Stored-Capacitor",
    formula: "U = ½CV²",
  },
  "Dielectrics": {
    video: "https://www.youtube.com/watch?v=X4EUwTwZ110",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Dielectrics",
    formula: "C = Kε₀A/d",
  },
  "Equipotential Surfaces": {
    video: "https://www.youtube.com/watch?v=Vpa_uApmNoo",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Equipotential-Surfaces",
    formula: "W = 0 along equipotential",
  },
  "Capacitor Combinations": {
    video: "https://www.youtube.com/watch?v=X4EUwTwZ110",
    notes: "https://ncert.nic.in/textbook/pdf/leph102.pdf",
    practice: "https://www.embibe.com/subjects/Physics/Electrostatics/Capacitor-Combinations",
    formula: "Series: 1/C = Σ1/Cᵢ | Parallel: C = ΣCᵢ",
  },
};

const defaultResource = {
  video: "https://www.youtube.com/results?search_query=JEE+Physics",
  notes: "https://ncert.nic.in/textbook.php",
  practice: "https://www.embibe.com/exams/jee-main/",
  formula: "Refer NCERT textbook",
};

export const RecommendationService = {
  /**
   * Returns recommendation cards for weak topics.
   * @param {string[]} weakTopics
   */
  get: (weakTopics) =>
    weakTopics.map((topic) => ({
      topic,
      ...(resourceBank[topic] || defaultResource),
    })),
};
