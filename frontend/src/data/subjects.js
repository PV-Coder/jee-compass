/**
 * @typedef {Object} Chapter
 * @property {number} id
 * @property {string} name
 * @property {string[]} topics
 * @property {string} [category]  - Chemistry branch (Physical / Inorganic / Organic)
 * @property {string} [unit]      - Physics / Maths grouping label
 */

/**
 * @typedef {Object} Subject
 * @property {string} id           - Unique slug (e.g. "physics")
 * @property {string} name         - Display name
 * @property {string} icon         - Emoji icon
 * @property {string} description  - Short description shown on subject card
 * @property {string} color        - Primary hex color
 * @property {string} colorLight   - Light tint for backgrounds
 * @property {string} colorDark    - Darker shade for hover states
 * @property {string} gradient     - CSS gradient string
 * @property {Chapter[]} chapters  - Ordered list of chapters
 */

import { SUBJECTS as _SUBJECTS } from "./curriculum";

/** Enriched descriptions for each subject */
const DESCRIPTIONS = {
  physics:     "Electrostatics, Optics, Modern Physics & more — master the physical world.",
  chemistry:   "Physical, Inorganic & Organic Chemistry — from solutions to biomolecules.",
  mathematics: "Calculus, Algebra, Vectors & Probability — build your problem-solving edge.",
};

/**
 * All subjects as an ordered array — add new subjects to curriculum.js
 * and they will automatically appear here.
 * @type {Subject[]}
 */
export const SUBJECT_LIST = Object.values(_SUBJECTS).map((s) => ({
  ...s,
  description: DESCRIPTIONS[s.id] ?? `Explore ${s.name} chapters and topics.`,
}));

/**
 * Look up a single subject by id.
 * @param {string} id
 * @returns {Subject | undefined}
 */
export const getSubjectById = (id) => SUBJECT_LIST.find((s) => s.id === id);

// Re-export raw map for components that need keyed access
export { _SUBJECTS as SUBJECTS_MAP };
