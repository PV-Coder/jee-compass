/**
 * revision.js — Smart Revision data layer
 * All data is derived from localStorage keys:
 *   jee_test_history      — array of quiz result objects
 *   jee_subject_progress  — { "physics_ch1": 72, ... }
 *   jee_bookmarks         — array of question objects
 *   jee_wrong_questions   — array of question objects
 */

import { SUBJECTS } from "./curriculum";

/* ── localStorage helpers ────────────────────────────────── */
const ls  = (key, fallback) => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
const lss = (key, val)      => localStorage.setItem(key, JSON.stringify(val));

/* ── Bookmark helpers ────────────────────────────────────── */
export const getBookmarks    = ()      => ls("jee_bookmarks", []);
export const addBookmark     = (q)     => {
  const bm = getBookmarks();
  if (!bm.find((b) => b.id === q.id)) lss("jee_bookmarks", [...bm, { ...q, bookmarkedAt: Date.now() }]);
};
export const removeBookmark  = (qId)  => lss("jee_bookmarks", getBookmarks().filter((b) => b.id !== qId));
export const isBookmarked    = (qId)  => getBookmarks().some((b) => b.id === qId);
export const clearBookmarks  = ()     => lss("jee_bookmarks", []);

/* ── Wrong question helpers ──────────────────────────────── */
export const getWrongQuestions   = ()    => ls("jee_wrong_questions", []);
export const clearWrongQuestions = ()    => lss("jee_wrong_questions", []);
export const markResolved        = (qId) => {
  const wq = getWrongQuestions().map((q) => q.id === qId ? { ...q, resolved: true } : q);
  lss("jee_wrong_questions", wq);
};

/* ── Save wrong questions from a quiz result ─────────────── */
export const saveWrongQuestionsFromResult = (result) => {
  if (!result?.questions) return;
  const existing = getWrongQuestions();
  const existingIds = new Set(existing.map((q) => q.id));
  const newWrong = result.questions
    .filter((q) => !q.isCorrect && !q.isSkipped)
    .map((q) => ({
      ...q,
      subjectId:   result.subjectId,
      chapterId:   result.chapterId,
      chapterName: result.chapterName,
      subjectName: result.subjectName,
      wrongAt:     Date.now(),
      resolved:    false,
      attempts:    existingIds.has(q.id)
        ? (existing.find((e) => e.id === q.id)?.attempts || 1) + 1
        : 1,
    }));

  // Merge: update existing, add new
  const merged = [...existing];
  newWrong.forEach((nq) => {
    const idx = merged.findIndex((e) => e.id === nq.id);
    if (idx >= 0) merged[idx] = nq;
    else merged.push(nq);
  });
  lss("jee_wrong_questions", merged);
};

/* ── Revision Queue ──────────────────────────────────────── */
/**
 * Priority queue: wrong questions first, then weak chapter questions,
 * sorted by attempts desc (most-failed first).
 */
export const getRevisionQueue = () => {
  const wrong    = getWrongQuestions().filter((q) => !q.resolved);
  const progress = ls("jee_subject_progress", {});

  // Weak chapter question stubs (from progress)
  const weakChapterItems = [];
  Object.values(SUBJECTS).forEach((subj) => {
    subj.chapters.forEach((ch) => {
      const score = progress[`${subj.id}_ch${ch.id}`] || 0;
      if (score > 0 && score < 50) {
        weakChapterItems.push({
          id:          `weak_${subj.id}_${ch.id}`,
          type:        "weak_chapter",
          subjectId:   subj.id,
          subjectName: subj.name,
          chapterId:   ch.id,
          chapterName: ch.name,
          score,
          priority:    50 - score, // higher priority = lower score
        });
      }
    });
  });

  const wrongItems = wrong.map((q) => ({
    ...q,
    type:     "wrong_question",
    priority: (q.attempts || 1) * 10 + (100 - (q.score || 0)),
  }));

  return [...wrongItems, ...weakChapterItems]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 20);
};

/* ── Weak Chapters ───────────────────────────────────────── */
export const getWeakChapters = () => {
  const progress = ls("jee_subject_progress", {});
  const result   = [];
  Object.values(SUBJECTS).forEach((subj) => {
    subj.chapters.forEach((ch) => {
      const score = progress[`${subj.id}_ch${ch.id}`] || 0;
      if (score > 0 && score < 60) {
        result.push({
          subjectId:   subj.id,
          subjectName: subj.name,
          subjectIcon: subj.icon,
          subjectColor: subj.color,
          subjectGradient: subj.gradient,
          chapterId:   ch.id,
          chapterName: ch.name,
          score,
          topics:      ch.topics,
        });
      }
    });
  });
  return result.sort((a, b) => a.score - b.score);
};

/* ── Recently Practiced ──────────────────────────────────── */
export const getRecentlyPracticed = () => {
  const history = ls("jee_test_history", []);
  const seen    = new Set();
  return [...history]
    .reverse()
    .filter((h) => {
      const key = `${h.subjectId}_${h.chapterId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8)
    .map((h) => ({
      subjectId:   h.subjectId,
      subjectName: h.subjectName || h.subject,
      chapterId:   h.chapterId,
      chapterName: h.chapterName,
      score:       h.score,
      date:        h.date,
      correct:     h.correct,
      total:       h.total,
    }));
};

/* ── Revision Recommendations ────────────────────────────── */
export const getRecommendations = () => {
  const history  = ls("jee_test_history", []);
  const progress = ls("jee_subject_progress", {});
  const wrong    = getWrongQuestions();
  const recs     = [];

  if (history.length === 0) {
    recs.push({ type: "start", icon: "🚀", title: "Start Your First Quiz", body: "Take a quiz to unlock personalised revision recommendations.", action: "/subjects", actionLabel: "Choose Subject" });
    return recs;
  }

  // Avg score
  const avgScore = Math.round(history.reduce((s, h) => s + h.score, 0) / history.length);

  // Most failed bloom level
  const bloomCount = { Remember: { c: 0, t: 0 }, Understand: { c: 0, t: 0 }, Apply: { c: 0, t: 0 }, Analyze: { c: 0, t: 0 } };
  history.forEach((h) => {
    if (!h.bloomMap) return;
    Object.entries(h.bloomMap).forEach(([lvl, { correct, total }]) => {
      if (bloomCount[lvl]) { bloomCount[lvl].c += correct; bloomCount[lvl].t += total; }
    });
  });
  const weakBloom = Object.entries(bloomCount)
    .filter(([, v]) => v.t > 0)
    .map(([lvl, v]) => ({ lvl, pct: Math.round((v.c / v.t) * 100) }))
    .sort((a, b) => a.pct - b.pct)[0];

  // Unresolved wrong questions
  const unresolvedWrong = wrong.filter((q) => !q.resolved).length;
  if (unresolvedWrong > 0) {
    recs.push({ type: "wrong", icon: "❌", title: `${unresolvedWrong} Wrong Questions Pending`, body: "Review and resolve your wrong answers to strengthen weak spots.", action: null, actionLabel: "Review Now", tab: "wrong" });
  }

  // Weak chapters
  const weakChapters = getWeakChapters();
  if (weakChapters.length > 0) {
    const wc = weakChapters[0];
    recs.push({ type: "chapter", icon: "📖", title: `Revise: ${wc.chapterName}`, body: `Your score is ${wc.score}% — below the 60% threshold. Retake this chapter.`, action: `/quiz/${wc.subjectId}/${wc.chapterId}`, actionLabel: "Retake Quiz" });
  }

  // Bloom tip
  if (weakBloom) {
    const tips = {
      Remember:   "Make flashcards for key definitions and formulas.",
      Understand: "Re-read chapter summaries and explain concepts aloud.",
      Apply:      "Solve 5 application-based problems daily.",
      Analyze:    "Practice past-year analytical questions.",
    };
    recs.push({ type: "bloom", icon: "🧠", title: `Boost ${weakBloom.lvl} Skills (${weakBloom.pct}%)`, body: tips[weakBloom.lvl], action: "/analytics", actionLabel: "View Bloom Stats" });
  }

  // Overall score tip
  if (avgScore < 50) {
    recs.push({ type: "score", icon: "📈", title: "Focus on Fundamentals", body: "Your average is below 50%. Start with Remember-level questions to build a strong base.", action: "/subjects", actionLabel: "Practice Now" });
  } else if (avgScore < 75) {
    recs.push({ type: "score", icon: "🎯", title: "Push Past 75%", body: "You're making progress! Focus on Apply and Analyze level questions to break the 75% barrier.", action: "/subjects", actionLabel: "Practice Now" });
  } else {
    recs.push({ type: "score", icon: "🏆", title: "Maintain Your Edge", body: "Great performance! Keep revising weak chapters and attempt harder questions.", action: "/subjects", actionLabel: "Challenge Yourself" });
  }

  // Bookmarks
  const bm = getBookmarks();
  if (bm.length > 0) {
    recs.push({ type: "bookmark", icon: "🔖", title: `${bm.length} Bookmarked Questions`, body: "You have saved questions waiting for review.", action: null, actionLabel: "Review Bookmarks", tab: "bookmarks" });
  }

  return recs;
};
