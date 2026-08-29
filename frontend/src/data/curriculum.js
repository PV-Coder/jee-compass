// ─── Complete CBSE Class 12 Curriculum Data ─────────────────────────────────

export const SUBJECTS = {
  physics: {
    id: "physics",
    name: "Physics",
    icon: "⚡",
    color: "#2563eb",
    colorLight: "#eff6ff",
    colorDark: "#1d4ed8",
    gradient: "linear-gradient(135deg, #1e40af, #2563eb, #0ea5e9)",
    chapters: [
      { id: 1,  name: "Electric Charges and Fields",             unit: "Electrostatics",   topics: ["Coulomb's Law", "Electric Field", "Electric Dipole", "Gauss's Law", "Field Lines", "Conductors & Insulators"] },
      { id: 2,  name: "Electrostatic Potential and Capacitance", unit: "Electrostatics",   topics: ["Electric Potential", "Equipotential Surfaces", "Capacitance", "Energy Stored", "Dielectrics", "Parallel Plate Capacitor"] },
      { id: 3,  name: "Current Electricity",                     unit: "Current",          topics: ["Ohm's Law", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer", "EMF & Internal Resistance", "Drift Velocity"] },
      { id: 4,  name: "Moving Charges and Magnetism",            unit: "Magnetism",        topics: ["Biot-Savart Law", "Ampere's Law", "Lorentz Force", "Cyclotron", "Solenoid", "Galvanometer"] },
      { id: 5,  name: "Magnetism and Matter",                    unit: "Magnetism",        topics: ["Bar Magnet", "Magnetic Field Lines", "Earth's Magnetism", "Diamagnetism", "Paramagnetism", "Ferromagnetism"] },
      { id: 6,  name: "Electromagnetic Induction",               unit: "EMI & AC",         topics: ["Faraday's Law", "Lenz's Law", "Mutual Inductance", "Self Inductance", "Eddy Currents", "Motional EMF"] },
      { id: 7,  name: "Alternating Current",                     unit: "EMI & AC",         topics: ["AC Generator", "RMS Values", "LCR Circuit", "Resonance", "Transformer", "Power Factor"] },
      { id: 8,  name: "Electromagnetic Waves",                   unit: "EM Waves",         topics: ["Maxwell's Equations", "Displacement Current", "EM Spectrum", "Properties of EM Waves", "Infrared", "UV Rays"] },
      { id: 9,  name: "Ray Optics and Optical Instruments",      unit: "Optics",           topics: ["Reflection", "Refraction", "Total Internal Reflection", "Lens Formula", "Microscope", "Telescope"] },
      { id: 10, name: "Wave Optics",                             unit: "Optics",           topics: ["Huygens Principle", "Interference", "YDSE", "Diffraction", "Polarisation", "Brewster's Law"] },
      { id: 11, name: "Dual Nature of Radiation and Matter",     unit: "Modern Physics",   topics: ["Photoelectric Effect", "Einstein's Equation", "de Broglie Wavelength", "Davisson-Germer", "Work Function"] },
      { id: 12, name: "Atoms",                                   unit: "Modern Physics",   topics: ["Rutherford Model", "Bohr Model", "Hydrogen Spectrum", "Energy Levels", "Atomic Spectra"] },
      { id: 13, name: "Nuclei",                                  unit: "Modern Physics",   topics: ["Nuclear Binding Energy", "Radioactivity", "Alpha Decay", "Beta Decay", "Nuclear Fission", "Nuclear Fusion"] },
      { id: 14, name: "Semiconductor Electronics",               unit: "Semiconductors",   topics: ["p-n Junction", "Diode", "Zener Diode", "Transistor", "Logic Gates", "Rectifier"] },
    ],
  },

  chemistry: {
    id: "chemistry",
    name: "Chemistry",
    icon: "🧪",
    color: "#16a34a",
    colorLight: "#f0fdf4",
    colorDark: "#15803d",
    gradient: "linear-gradient(135deg, #14532d, #16a34a, #22c55e)",
    chapters: [
      { id: 1,  name: "Solutions",                               category: "Physical",  topics: ["Molarity", "Molality", "Raoult's Law", "Colligative Properties", "Van't Hoff Factor", "Osmotic Pressure"] },
      { id: 2,  name: "Electrochemistry",                        category: "Physical",  topics: ["Galvanic Cell", "Nernst Equation", "Electrolysis", "Kohlrausch's Law", "Corrosion", "Conductance"] },
      { id: 3,  name: "Chemical Kinetics",                       category: "Physical",  topics: ["Rate of Reaction", "Order of Reaction", "Arrhenius Equation", "Half Life", "Activation Energy", "Rate Law"] },
      { id: 4,  name: "Surface Chemistry",                       category: "Physical",  topics: ["Adsorption", "Colloids", "Emulsions", "Catalysis", "Tyndall Effect", "Brownian Motion"] },
      { id: 5,  name: "p-Block Elements",                        category: "Inorganic", topics: ["Group 15 Elements", "Group 16 Elements", "Group 17 Elements", "Group 18 Elements", "Ozone", "Oxoacids"] },
      { id: 6,  name: "d- and f-Block Elements",                 category: "Inorganic", topics: ["Transition Metals", "Lanthanides", "Actinides", "Oxidation States", "Catalytic Properties", "Interstitial Compounds"] },
      { id: 7,  name: "Coordination Compounds",                  category: "Inorganic", topics: ["Ligands", "IUPAC Nomenclature", "Isomerism", "Crystal Field Theory", "Stability", "Bonding"] },
      { id: 8,  name: "Haloalkanes and Haloarenes",              category: "Organic",   topics: ["SN1 Reaction", "SN2 Reaction", "Elimination", "Grignard Reagent", "Aryl Halides", "Optical Isomerism"] },
      { id: 9,  name: "Alcohols, Phenols and Ethers",            category: "Organic",   topics: ["Preparation of Alcohols", "Reactions of Phenols", "Williamson Synthesis", "Acidity", "Oxidation", "Lucas Test"] },
      { id: 10, name: "Aldehydes, Ketones and Carboxylic Acids", category: "Organic",   topics: ["Nucleophilic Addition", "Aldol Condensation", "Cannizzaro Reaction", "Esterification", "Hell-Volhard-Zelinsky"] },
      { id: 11, name: "Amines",                                  category: "Organic",   topics: ["Classification", "Basicity", "Diazonium Salts", "Coupling Reaction", "Hofmann Bromamide", "Gabriel Synthesis"] },
      { id: 12, name: "Biomolecules",                            category: "Organic",   topics: ["Carbohydrates", "Proteins", "Enzymes", "Nucleic Acids", "Vitamins", "Hormones"] },
      { id: 13, name: "Polymers",                                category: "Organic",   topics: ["Addition Polymers", "Condensation Polymers", "Natural Rubber", "Nylon", "Bakelite", "Biodegradable Polymers"] },
      { id: 14, name: "Chemistry in Everyday Life",              category: "Organic",   topics: ["Drugs & Medicines", "Soaps", "Detergents", "Food Preservatives", "Antacids", "Antiseptics"] },
    ],
  },

  mathematics: {
    id: "mathematics",
    name: "Mathematics",
    icon: "📐",
    color: "#7c3aed",
    colorLight: "#f5f3ff",
    colorDark: "#6d28d9",
    gradient: "linear-gradient(135deg, #4c1d95, #7c3aed, #a78bfa)",
    chapters: [
      { id: 1,  name: "Relations and Functions",          unit: "Algebra",      topics: ["Types of Relations", "Types of Functions", "Composition of Functions", "Invertible Functions", "Binary Operations"] },
      { id: 2,  name: "Inverse Trigonometric Functions",  unit: "Algebra",      topics: ["Domain and Range", "Principal Values", "Properties", "Identities", "Simplification"] },
      { id: 3,  name: "Matrices",                         unit: "Algebra",      topics: ["Types of Matrices", "Matrix Operations", "Transpose", "Symmetric Matrices", "Elementary Operations"] },
      { id: 4,  name: "Determinants",                     unit: "Algebra",      topics: ["Properties of Determinants", "Cofactors", "Adjoint", "Inverse of Matrix", "Cramer's Rule", "Area of Triangle"] },
      { id: 5,  name: "Continuity and Differentiability", unit: "Calculus",     topics: ["Continuity", "Differentiability", "Chain Rule", "Implicit Differentiation", "Logarithmic Differentiation", "Rolle's Theorem"] },
      { id: 6,  name: "Applications of Derivatives",     unit: "Calculus",     topics: ["Rate of Change", "Increasing & Decreasing", "Maxima and Minima", "Tangents and Normals", "Approximations"] },
      { id: 7,  name: "Integrals",                        unit: "Calculus",     topics: ["Integration by Parts", "Substitution", "Partial Fractions", "Definite Integrals", "Properties of Integrals"] },
      { id: 8,  name: "Applications of Integrals",        unit: "Calculus",     topics: ["Area Under Curve", "Area Between Curves", "Area Using Definite Integrals"] },
      { id: 9,  name: "Differential Equations",           unit: "Calculus",     topics: ["Order and Degree", "Variable Separable", "Homogeneous DE", "Linear DE", "Bernoulli's Equation"] },
      { id: 10, name: "Vector Algebra",                   unit: "Vectors & 3D", topics: ["Types of Vectors", "Dot Product", "Cross Product", "Scalar Triple Product", "Projection of Vectors"] },
      { id: 11, name: "Three-Dimensional Geometry",       unit: "Vectors & 3D", topics: ["Direction Cosines", "Equation of Line", "Equation of Plane", "Angle Between Lines", "Shortest Distance"] },
      { id: 12, name: "Linear Programming",               unit: "LPP",          topics: ["Feasible Region", "Corner Point Method", "Maximisation", "Minimisation", "Graphical Method"] },
      { id: 13, name: "Probability",                      unit: "Probability",  topics: ["Conditional Probability", "Bayes' Theorem", "Random Variables", "Binomial Distribution", "Mean and Variance"] },
    ],
  },
};

// ─── Bloom's Taxonomy Levels ─────────────────────────────────────────────────
export const BLOOM_LEVELS = [
  { id: "Remember",   color: "#22c55e", bg: "#dcfce7", icon: "🟢", desc: "Recall facts and basic concepts" },
  { id: "Understand", color: "#3b82f6", bg: "#dbeafe", icon: "🔵", desc: "Explain ideas or concepts" },
  { id: "Apply",      color: "#f59e0b", bg: "#fef3c7", icon: "🟠", desc: "Use information in new situations" },
  { id: "Analyze",    color: "#ef4444", bg: "#fee2e2", icon: "🔴", desc: "Draw connections and break down info" },
];

// ─── Mastery Levels ───────────────────────────────────────────────────────────
export const MASTERY_LEVELS = [
  { min: 0,  max: 20,  label: "Beginner",    stars: 1, color: "#94a3b8" },
  { min: 20, max: 40,  label: "Developing",  stars: 2, color: "#f59e0b" },
  { min: 40, max: 60,  label: "Proficient",  stars: 3, color: "#3b82f6" },
  { min: 60, max: 80,  label: "Advanced",    stars: 4, color: "#8b5cf6" },
  { min: 80, max: 101, label: "Master",      stars: 5, color: "#22c55e" },
];

export const getMasteryLevel = (score) =>
  MASTERY_LEVELS.find((m) => score >= m.min && score < m.max) || MASTERY_LEVELS[0];

// ─── Badge Definitions ────────────────────────────────────────────────────────
export const BADGES = [
  { id: "first_test",    icon: "🎯", name: "First Step",      desc: "Completed your first test",         condition: (s) => s.totalTests >= 1 },
  { id: "streak_3",      icon: "🔥", name: "On Fire",         desc: "3-day study streak",                condition: (s) => s.streak >= 3 },
  { id: "streak_7",      icon: "⚡", name: "Week Warrior",    desc: "7-day study streak",                condition: (s) => s.streak >= 7 },
  { id: "perfect_score", icon: "🏆", name: "Perfect Score",   desc: "Scored 100% on any test",           condition: (s) => s.bestScore >= 100 },
  { id: "physics_ace",   icon: "⚛",  name: "Physics Ace",     desc: "Completed 5 Physics tests",         condition: (s) => (s.subjectTests?.physics || 0) >= 5 },
  { id: "chem_wizard",   icon: "🧬", name: "Chem Wizard",     desc: "Completed 5 Chemistry tests",       condition: (s) => (s.subjectTests?.chemistry || 0) >= 5 },
  { id: "math_genius",   icon: "🔢", name: "Math Genius",     desc: "Completed 5 Mathematics tests",     condition: (s) => (s.subjectTests?.mathematics || 0) >= 5 },
  { id: "xp_500",        icon: "⭐", name: "Rising Star",     desc: "Earned 500 XP",                     condition: (s) => s.xp >= 500 },
  { id: "xp_1000",       icon: "🌟", name: "Star Performer",  desc: "Earned 1000 XP",                    condition: (s) => s.xp >= 1000 },
  { id: "all_subjects",  icon: "📚", name: "All Rounder",     desc: "Tested in all 3 subjects",          condition: (s) => s.subjectTests?.physics >= 1 && s.subjectTests?.chemistry >= 1 && s.subjectTests?.mathematics >= 1 },
];

// ─── XP Calculation ───────────────────────────────────────────────────────────
export const calculateXP = (score, totalQuestions) => {
  const base = Math.round((score / 100) * totalQuestions * 10);
  const bonus = score >= 80 ? 50 : score >= 60 ? 25 : 0;
  return base + bonus;
};
