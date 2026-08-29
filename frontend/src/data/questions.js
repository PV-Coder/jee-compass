/**
 * @typedef {"Remember"|"Understand"|"Apply"|"Analyze"} BloomLevel
 * @typedef {"Easy"|"Medium"|"Hard"} Difficulty
 *
 * @typedef {Object} Question
 * @property {string}     id            - Unique: "{subjectId}_{chapterId}_{bloomLevel}_{n}"
 * @property {string}     subjectId
 * @property {number}     chapterId
 * @property {BloomLevel} bloomLevel
 * @property {Difficulty} difficulty
 * @property {string}     question
 * @property {string[]}   options       - Always 4 options
 * @property {number}     correctAnswer - 0-indexed
 * @property {string}     explanation
 */

import { SUBJECTS, BLOOM_LEVELS } from "./curriculum";

// ─── Bloom-level difficulty mapping ──────────────────────────────────────────
const BLOOM_DIFFICULTY = {
  Remember:   "Easy",
  Understand: "Easy",
  Apply:      "Medium",
  Analyze:    "Hard",
};

// ─── Bloom verb banks (for generating realistic placeholder stems) ────────────
const BLOOM_VERBS = {
  Remember:   ["Define", "State", "List", "Identify", "Name", "Recall", "What is", "Which of the following defines"],
  Understand: ["Explain", "Describe", "Summarise", "Interpret", "Classify", "What is the significance of", "How does", "Why does"],
  Apply:      ["Calculate", "Solve", "Use", "Determine", "Apply", "Find the value of", "Compute", "A student uses"],
  Analyze:    ["Analyse", "Compare", "Differentiate", "Examine", "Investigate", "What would happen if", "Evaluate the effect of", "Break down"],
};

// ─── Generic option sets per bloom level ─────────────────────────────────────
const makeOptions = (topic, n) => [
  `${topic} — Option A`,
  `${topic} — Option B`,
  `${topic} — Option C`,
  `${topic} — Option D`,
];

// ─── Generator ────────────────────────────────────────────────────────────────
/**
 * Generates 5 placeholder questions per Bloom level for a given chapter.
 * Replace individual entries with real questions without changing the schema.
 *
 * @param {string} subjectId
 * @param {import("./curriculum").Chapter} chapter
 * @param {BloomLevel} bloomLevel
 * @returns {Question[]}
 */
const generatePlaceholders = (subjectId, chapter, bloomLevel) => {
  const verbs    = BLOOM_VERBS[bloomLevel];
  const diff     = BLOOM_DIFFICULTY[bloomLevel];
  const topics   = chapter.topics;

  return Array.from({ length: 5 }, (_, i) => {
    const topic  = topics[i % topics.length];
    const verb   = verbs[i % verbs.length];
    const qIndex = i + 1;

    return {
      id:            `${subjectId}_${chapter.id}_${bloomLevel}_${qIndex}`,
      subjectId,
      chapterId:     chapter.id,
      bloomLevel,
      difficulty:    diff,
      question:      `${verb} the concept of "${topic}" as studied in ${chapter.name}. (Placeholder Q${qIndex})`,
      options:       makeOptions(topic, qIndex),
      correctAnswer: 0,
      explanation:   `This is a placeholder explanation for "${topic}" at the ${bloomLevel} level. Replace with a real explanation when questions are authored.`,
    };
  });
};

// ─── Build full question bank ─────────────────────────────────────────────────
/** @type {Question[]} */
const QUESTION_BANK = [];

Object.values(SUBJECTS).forEach((subject) => {
  subject.chapters.forEach((chapter) => {
    BLOOM_LEVELS.forEach(({ id: bloomLevel }) => {
      QUESTION_BANK.push(...generatePlaceholders(subject.id, chapter, bloomLevel));
    });
  });
});

// ─── Query helpers ────────────────────────────────────────────────────────────

/**
 * All questions for a chapter, grouped by Bloom level.
 * @param {string} subjectId
 * @param {number} chapterId
 * @returns {Record<BloomLevel, Question[]>}
 */
export const getQuestionsByChapter = (subjectId, chapterId) => {
  const id = Number(chapterId);
  return BLOOM_LEVELS.reduce((acc, { id: level }) => {
    acc[level] = QUESTION_BANK.filter(
      (q) => q.subjectId === subjectId && q.chapterId === id && q.bloomLevel === level
    );
    return acc;
  }, {});
};

/**
 * Questions for a specific Bloom level within a chapter.
 * @param {string} subjectId
 * @param {number} chapterId
 * @param {BloomLevel} bloomLevel
 * @returns {Question[]}
 */
export const getQuestionsByBloomLevel = (subjectId, chapterId, bloomLevel) => {
  const id = Number(chapterId);
  return QUESTION_BANK.filter(
    (q) => q.subjectId === subjectId && q.chapterId === id && q.bloomLevel === bloomLevel
  );
};

export { QUESTION_BANK };
export default QUESTION_BANK;
