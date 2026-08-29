// ─── Shared Progress Utilities ────────────────────────────────────────────────
// Centralised helpers for test history, XP, and streak management.
// Used by both QuizPage and DiagnosticTest so all test types update
// the Dashboard, Analytics, and Profile consistently.

import { calculateXP } from "../data/curriculum";

/**
 * Add a test entry to the shared test history (jee_test_history).
 * @param {Object} entry - { subjectId, subject, chapterId, chapterName,
 *   subjectName, score, correct, total, totalTime, date, bloomMap, weakTopics }
 */
export const addTestToHistory = (entry) => {
  const history = JSON.parse(localStorage.getItem("jee_test_history") || "[]");
  history.push(entry);
  localStorage.setItem("jee_test_history", JSON.stringify(history));
  return history;
};

/**
 * Award XP based on score and question count, then persist.
 * @param {number} score - 0-100 percentage
 * @param {number} total - number of questions
 * @returns {number} new total XP
 */
export const awardXP = (score, total) => {
  const gained = calculateXP(score, total);
  const current = JSON.parse(localStorage.getItem("jee_xp") || "0");
  const updated = current + gained;
  localStorage.setItem("jee_xp", JSON.stringify(updated));
  return updated;
};

/**
 * Update the daily streak. If the last activity was yesterday, increment.
 * If it was today, keep the streak. If it was earlier, reset to 1.
 * @returns {number} new streak value
 */
export const updateStreak = () => {
  const today = new Date().toDateString();
  const last = localStorage.getItem("jee_last_activity");
  let streak = JSON.parse(localStorage.getItem("jee_streak") || "0");

  if (last === today) {
    // Already active today — keep streak
  } else if (last) {
    const lastDate = new Date(last);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate.toDateString() === yesterday.toDateString()) {
      streak += 1; // Consecutive day
    } else {
      streak = 1; // Streak broken
    }
  } else {
    streak = 1; // First activity
  }

  localStorage.setItem("jee_streak", JSON.stringify(streak));
  localStorage.setItem("jee_last_activity", today);
  return streak;
};

/**
 * Compute weak topics from a list of answered questions.
 * A topic is "weak" if more than half of its questions were answered incorrectly.
 * @param {Array} questions - question objects with { topicId, topicName, isCorrect }
 * @returns {Array<string>} weak topic names
 */
export const computeWeakTopics = (questions) => {
  const topicMap = {};
  questions.forEach((q) => {
    if (!q.topicId && !q.topicName) return;
    const key = q.topicId || q.topicName;
    if (!topicMap[key]) topicMap[key] = { name: q.topicName || key, correct: 0, total: 0 };
    topicMap[key].total++;
    if (q.isCorrect) topicMap[key].correct++;
  });
  return Object.values(topicMap)
    .filter((t) => t.total > 0 && t.correct / t.total < 0.5)
    .map((t) => t.name);
};

/**
 * Record a completed test: add to history, award XP, update streak.
 * @param {Object} entry - test entry (see addTestToHistory)
 * @returns {Object} { history, xp, streak }
 */
export const recordTestCompletion = (entry) => {
  const history = addTestToHistory(entry);
  const xp = awardXP(entry.score, entry.total);
  const streak = updateStreak();
  return { history, xp, streak };
};