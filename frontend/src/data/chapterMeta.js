/**
 * Chapter metadata — kept separate from curriculum.js so it can be
 * swapped for an API call without touching subject/chapter structure.
 *
 * @typedef {Object} ChapterMeta
 * @property {string}   subjectId
 * @property {number}   chapterId
 * @property {string}   overview          - 2-3 sentence description
 * @property {string[]} objectives        - Learning objectives (what student will be able to do)
 * @property {"Easy"|"Medium"|"Hard"} difficulty
 * @property {number}   studyTimeMinutes  - Estimated study time
 * @property {number}   questionCount     - Total questions available
 * @property {string[]} keyFormulas       - Important formulas / theorems (optional)
 * @property {string}   examWeight        - Marks weightage in CBSE board exam
 */

/** @type {ChapterMeta[]} */
const CHAPTER_META = [

  // ─── PHYSICS ──────────────────────────────────────────────────────────────
  {
    subjectId: "physics", chapterId: 1,
    overview: "Introduces the concept of electric charge, Coulomb's law, and the electric field produced by point charges and continuous distributions. Gauss's law simplifies field calculations for symmetric charge distributions.",
    objectives: ["State and apply Coulomb's law for point charges", "Calculate electric field due to dipoles and continuous distributions", "Apply Gauss's law to find fields for symmetric geometries", "Distinguish between conductors and insulators in electrostatic equilibrium"],
    difficulty: "Medium", studyTimeMinutes: 90, questionCount: 45, examWeight: "8 marks",
    keyFormulas: ["F = kq₁q₂/r²", "E = F/q₀", "Φ = q/ε₀"],
  },
  {
    subjectId: "physics", chapterId: 2,
    overview: "Covers electric potential, potential energy, and capacitance. Explores how dielectrics affect capacitors and how energy is stored in electric fields.",
    objectives: ["Define and calculate electric potential and potential difference", "Derive capacitance of parallel plate and spherical capacitors", "Explain the effect of dielectrics on capacitance", "Calculate energy stored in a capacitor"],
    difficulty: "Medium", studyTimeMinutes: 85, questionCount: 40, examWeight: "8 marks",
    keyFormulas: ["V = kq/r", "C = ε₀A/d", "U = ½CV²"],
  },
  {
    subjectId: "physics", chapterId: 3,
    overview: "Studies the flow of electric charge through conductors. Covers Ohm's law, resistivity, Kirchhoff's laws, and measuring instruments like the Wheatstone bridge and potentiometer.",
    objectives: ["Apply Ohm's law and understand its limitations", "Use Kirchhoff's current and voltage laws to solve circuits", "Explain the working of Wheatstone bridge and potentiometer", "Derive expressions for drift velocity and mobility"],
    difficulty: "Hard", studyTimeMinutes: 100, questionCount: 55, examWeight: "7 marks",
    keyFormulas: ["V = IR", "R = ρl/A", "P = I²R"],
  },
  {
    subjectId: "physics", chapterId: 4,
    overview: "Explores the magnetic effects of electric current. Covers Biot-Savart law, Ampere's circuital law, force on current-carrying conductors, and the cyclotron.",
    objectives: ["Apply Biot-Savart law to calculate magnetic fields", "Use Ampere's law for solenoids and toroids", "Analyse motion of charged particles in magnetic fields", "Explain the principle of a cyclotron"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "8 marks",
    keyFormulas: ["dB = μ₀Idl×r̂/4πr²", "F = qv×B", "B = μ₀nI"],
  },
  {
    subjectId: "physics", chapterId: 5,
    overview: "Examines the magnetic properties of materials including diamagnetic, paramagnetic, and ferromagnetic substances. Covers Earth's magnetism and the bar magnet as a magnetic dipole.",
    objectives: ["Compare diamagnetic, paramagnetic, and ferromagnetic materials", "Explain Earth's magnetic field and its elements", "Relate bar magnet properties to magnetic dipole moment", "Define magnetic susceptibility and permeability"],
    difficulty: "Easy", studyTimeMinutes: 60, questionCount: 30, examWeight: "5 marks",
    keyFormulas: ["M = m×2l", "B = μ₀μᵣH", "χ = M/H"],
  },
  {
    subjectId: "physics", chapterId: 6,
    overview: "Covers Faraday's laws of electromagnetic induction, Lenz's law, self and mutual inductance, and eddy currents. Foundation for understanding AC circuits and transformers.",
    objectives: ["State and apply Faraday's laws of electromagnetic induction", "Apply Lenz's law to determine direction of induced current", "Calculate self and mutual inductance of coils", "Explain eddy currents and their applications"],
    difficulty: "Hard", studyTimeMinutes: 90, questionCount: 48, examWeight: "8 marks",
    keyFormulas: ["ε = -dΦ/dt", "L = NΦ/I", "M = μ₀N₁N₂A/l"],
  },
  {
    subjectId: "physics", chapterId: 7,
    overview: "Studies alternating current circuits including resistors, inductors, and capacitors. Covers resonance in LCR circuits, power factor, and the working of transformers.",
    objectives: ["Analyse AC circuits with R, L, and C components", "Derive resonance condition for LCR series circuit", "Calculate power in AC circuits and power factor", "Explain the working principle of a transformer"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 52, examWeight: "8 marks",
    keyFormulas: ["Z = √(R²+(XL-XC)²)", "f₀ = 1/2π√LC", "P = VrmsIrmscosφ"],
  },
  {
    subjectId: "physics", chapterId: 8,
    overview: "Introduces Maxwell's equations and the concept of displacement current. Covers the nature, properties, and spectrum of electromagnetic waves.",
    objectives: ["Explain Maxwell's modification of Ampere's law", "Describe the nature and properties of EM waves", "Identify different regions of the electromagnetic spectrum", "Explain the significance of displacement current"],
    difficulty: "Easy", studyTimeMinutes: 55, questionCount: 28, examWeight: "5 marks",
    keyFormulas: ["c = 1/√μ₀ε₀", "c = νλ", "E₀/B₀ = c"],
  },
  {
    subjectId: "physics", chapterId: 9,
    overview: "Covers reflection, refraction, total internal reflection, and the lens and mirror formulae. Explains the working of optical instruments like microscopes and telescopes.",
    objectives: ["Apply mirror and lens formulae to solve problems", "Explain total internal reflection and its applications", "Derive magnification for microscopes and telescopes", "Understand dispersion of light through prisms"],
    difficulty: "Hard", studyTimeMinutes: 110, questionCount: 60, examWeight: "10 marks",
    keyFormulas: ["1/f = 1/v - 1/u", "n = sin i/sin r", "P = 1/f(m)"],
  },
  {
    subjectId: "physics", chapterId: 10,
    overview: "Explores the wave nature of light through Huygens' principle, interference (Young's double slit), diffraction, and polarisation.",
    objectives: ["Apply Huygens' principle to explain reflection and refraction", "Derive conditions for constructive and destructive interference", "Explain diffraction patterns from single slits", "Describe polarisation by reflection and Brewster's law"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "10 marks",
    keyFormulas: ["β = λD/d", "2d sinθ = nλ", "tan iB = n"],
  },
  {
    subjectId: "physics", chapterId: 11,
    overview: "Covers the photoelectric effect, Einstein's photoelectric equation, and the wave-particle duality of matter through de Broglie's hypothesis.",
    objectives: ["Explain the photoelectric effect and its observations", "Apply Einstein's photoelectric equation", "Calculate de Broglie wavelength of particles", "Describe the Davisson-Germer experiment"],
    difficulty: "Medium", studyTimeMinutes: 75, questionCount: 40, examWeight: "7 marks",
    keyFormulas: ["KE = hν - φ", "λ = h/mv", "eV₀ = hν - φ"],
  },
  {
    subjectId: "physics", chapterId: 12,
    overview: "Studies atomic models from Thomson to Bohr. Covers Bohr's postulates, hydrogen spectrum, and energy levels of the hydrogen atom.",
    objectives: ["Compare Thomson, Rutherford, and Bohr atomic models", "Apply Bohr's postulates to calculate energy levels", "Explain the origin of hydrogen spectral series", "Calculate radius and velocity of electron in Bohr orbits"],
    difficulty: "Medium", studyTimeMinutes: 70, questionCount: 38, examWeight: "6 marks",
    keyFormulas: ["Eₙ = -13.6/n² eV", "rₙ = n²a₀", "1/λ = R(1/n₁²-1/n₂²)"],
  },
  {
    subjectId: "physics", chapterId: 13,
    overview: "Covers nuclear structure, binding energy, radioactive decay laws, and nuclear reactions including fission and fusion.",
    objectives: ["Calculate binding energy and binding energy per nucleon", "Apply radioactive decay law and calculate half-life", "Distinguish between alpha, beta, and gamma decay", "Explain nuclear fission and fusion reactions"],
    difficulty: "Medium", studyTimeMinutes: 80, questionCount: 42, examWeight: "6 marks",
    keyFormulas: ["E = Δmc²", "N = N₀e^(-λt)", "t½ = 0.693/λ"],
  },
  {
    subjectId: "physics", chapterId: 14,
    overview: "Covers semiconductor physics, p-n junction diodes, Zener diodes, transistors, and basic logic gates.",
    objectives: ["Distinguish between conductors, semiconductors, and insulators", "Explain the working of p-n junction in forward and reverse bias", "Analyse transistor as a switch and amplifier", "Construct truth tables for basic logic gates"],
    difficulty: "Medium", studyTimeMinutes: 85, questionCount: 45, examWeight: "7 marks",
    keyFormulas: ["IE = IB + IC", "β = IC/IB", "VCC = ICRC + VCE"],
  },

  // ─── CHEMISTRY ────────────────────────────────────────────────────────────
  {
    subjectId: "chemistry", chapterId: 1,
    overview: "Studies types of solutions, concentration terms, and colligative properties. Raoult's law and Van't Hoff factor are central to understanding solution behaviour.",
    objectives: ["Express concentration in molarity, molality, and mole fraction", "Apply Raoult's law to ideal and non-ideal solutions", "Calculate colligative properties: elevation of boiling point, depression of freezing point", "Use Van't Hoff factor for electrolyte solutions"],
    difficulty: "Medium", studyTimeMinutes: 80, questionCount: 42, examWeight: "5 marks",
    keyFormulas: ["ΔTb = Kb·m", "ΔTf = Kf·m", "π = iMRT"],
  },
  {
    subjectId: "chemistry", chapterId: 2,
    overview: "Covers electrochemical cells, electrode potentials, Nernst equation, electrolysis, and corrosion. Kohlrausch's law relates conductance to concentration.",
    objectives: ["Distinguish between galvanic and electrolytic cells", "Apply Nernst equation to calculate cell potential", "Use Kohlrausch's law for molar conductivity", "Explain the mechanism of corrosion and its prevention"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "5 marks",
    keyFormulas: ["E = E° - (RT/nF)lnQ", "ΛM = ΛM° - K√C", "ΔG° = -nFE°"],
  },
  {
    subjectId: "chemistry", chapterId: 3,
    overview: "Studies the rate of chemical reactions, factors affecting rate, rate laws, and the Arrhenius equation. Covers integrated rate equations for zero and first order reactions.",
    objectives: ["Define rate of reaction and rate constant", "Derive integrated rate equations for zero and first order reactions", "Apply Arrhenius equation to calculate activation energy", "Distinguish between molecularity and order of reaction"],
    difficulty: "Hard", studyTimeMinutes: 90, questionCount: 48, examWeight: "5 marks",
    keyFormulas: ["r = k[A]ⁿ", "k = Ae^(-Ea/RT)", "t½ = 0.693/k"],
  },
  {
    subjectId: "chemistry", chapterId: 4,
    overview: "Covers adsorption, colloids, emulsions, and catalysis. Explains the Tyndall effect, Brownian motion, and the distinction between lyophilic and lyophobic colloids.",
    objectives: ["Distinguish between adsorption and absorption", "Explain Freundlich and Langmuir adsorption isotherms", "Describe properties of colloids and emulsions", "Explain homogeneous and heterogeneous catalysis"],
    difficulty: "Easy", studyTimeMinutes: 60, questionCount: 30, examWeight: "4 marks",
    keyFormulas: ["x/m = kp^(1/n)", "θ = ap/(1+ap)"],
  },
  {
    subjectId: "chemistry", chapterId: 5,
    overview: "Covers the chemistry of p-block elements in groups 15–18. Includes preparation, properties, and uses of important compounds like ammonia, sulphuric acid, and halogens.",
    objectives: ["Describe trends in properties of group 15, 16, 17, and 18 elements", "Explain preparation and properties of NH₃, HNO₃, H₂SO₄, and HCl", "Compare oxidising power of halogens", "Explain the anomalous behaviour of nitrogen and oxygen"],
    difficulty: "Hard", studyTimeMinutes: 110, questionCount: 58, examWeight: "7 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 6,
    overview: "Studies transition metals and inner transition metals (lanthanides and actinides). Covers variable oxidation states, coloured compounds, and catalytic properties.",
    objectives: ["Explain variable oxidation states of transition metals", "Describe the preparation and properties of KMnO₄ and K₂Cr₂O₇", "Compare properties of lanthanides and actinides", "Explain catalytic and magnetic properties of transition metals"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "5 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 7,
    overview: "Covers coordination compounds, IUPAC nomenclature, isomerism, bonding theories (VBT and CFT), and stability of complexes.",
    objectives: ["Apply IUPAC rules to name coordination compounds", "Identify and explain types of isomerism in complexes", "Apply Crystal Field Theory to explain colour and magnetism", "Calculate stability constants of coordination compounds"],
    difficulty: "Hard", studyTimeMinutes: 100, questionCount: 52, examWeight: "5 marks",
    keyFormulas: ["Δ₀ = hν"],
  },
  {
    subjectId: "chemistry", chapterId: 8,
    overview: "Covers nomenclature, preparation, and reactions of haloalkanes and haloarenes. Includes SN1, SN2, and elimination reactions, and the Grignard reagent.",
    objectives: ["Name haloalkanes and haloarenes by IUPAC system", "Distinguish between SN1 and SN2 mechanisms", "Explain the preparation and reactions of Grignard reagent", "Compare reactivity of haloalkanes and haloarenes"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "6 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 9,
    overview: "Studies the preparation, physical and chemical properties of alcohols, phenols, and ethers. Covers acidity, oxidation reactions, and Williamson synthesis.",
    objectives: ["Prepare alcohols and phenols from various precursors", "Compare acidity of alcohols and phenols", "Explain Williamson synthesis of ethers", "Describe oxidation reactions of primary, secondary, and tertiary alcohols"],
    difficulty: "Medium", studyTimeMinutes: 85, questionCount: 45, examWeight: "6 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 10,
    overview: "Covers the chemistry of carbonyl compounds and carboxylic acids. Includes nucleophilic addition, aldol condensation, Cannizzaro reaction, and esterification.",
    objectives: ["Explain nucleophilic addition to carbonyl compounds", "Describe aldol condensation and Cannizzaro reaction", "Compare acidity of carboxylic acids", "Explain esterification and Hell-Volhard-Zelinsky reaction"],
    difficulty: "Hard", studyTimeMinutes: 100, questionCount: 55, examWeight: "6 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 11,
    overview: "Studies classification, preparation, and reactions of amines. Covers basicity, diazonium salts, and coupling reactions used in dye synthesis.",
    objectives: ["Classify amines as primary, secondary, and tertiary", "Compare basicity of aliphatic and aromatic amines", "Explain preparation and reactions of diazonium salts", "Describe Hofmann bromamide and Gabriel synthesis"],
    difficulty: "Medium", studyTimeMinutes: 80, questionCount: 42, examWeight: "4 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 12,
    overview: "Covers the structure and functions of carbohydrates, proteins, enzymes, nucleic acids, vitamins, and hormones.",
    objectives: ["Classify carbohydrates and explain their structures", "Describe the structure of proteins and peptide bonds", "Explain the role of enzymes as biological catalysts", "Describe the structure of DNA and RNA"],
    difficulty: "Easy", studyTimeMinutes: 65, questionCount: 32, examWeight: "4 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 13,
    overview: "Covers classification, preparation, and properties of polymers including addition and condensation polymers, rubber, and biodegradable polymers.",
    objectives: ["Classify polymers based on source, structure, and mode of polymerisation", "Explain addition and condensation polymerisation mechanisms", "Describe properties and uses of nylon, Bakelite, and rubber", "Explain biodegradable and non-biodegradable polymers"],
    difficulty: "Easy", studyTimeMinutes: 60, questionCount: 30, examWeight: "3 marks",
    keyFormulas: [],
  },
  {
    subjectId: "chemistry", chapterId: 14,
    overview: "Applies chemistry to everyday life — drugs, soaps, detergents, food additives, and antiseptics. Covers drug-receptor interactions and cleansing action of soaps.",
    objectives: ["Classify drugs based on pharmacological effect and target", "Explain drug-receptor interaction", "Describe the cleansing action of soaps and detergents", "Identify common food preservatives, antacids, and antiseptics"],
    difficulty: "Easy", studyTimeMinutes: 55, questionCount: 28, examWeight: "3 marks",
    keyFormulas: [],
  },

  // ─── MATHEMATICS ──────────────────────────────────────────────────────────
  {
    subjectId: "mathematics", chapterId: 1,
    overview: "Revisits relations and functions with a focus on types of functions, composition, and invertibility. Introduces binary operations and their properties.",
    objectives: ["Identify and classify types of relations and functions", "Compute composition of functions and verify associativity", "Determine if a function is invertible and find its inverse", "Analyse binary operations for commutativity and associativity"],
    difficulty: "Easy", studyTimeMinutes: 60, questionCount: 30, examWeight: "5 marks",
    keyFormulas: ["(fog)(x) = f(g(x))"],
  },
  {
    subjectId: "mathematics", chapterId: 2,
    overview: "Covers inverse trigonometric functions, their domains, ranges, and principal values. Includes important identities and simplification techniques.",
    objectives: ["State domain and range of all inverse trig functions", "Find principal values of inverse trig expressions", "Apply properties and identities to simplify expressions", "Prove and use addition formulae for inverse trig functions"],
    difficulty: "Medium", studyTimeMinutes: 70, questionCount: 35, examWeight: "5 marks",
    keyFormulas: ["sin⁻¹x + cos⁻¹x = π/2", "tan⁻¹x + cot⁻¹x = π/2"],
  },
  {
    subjectId: "mathematics", chapterId: 3,
    overview: "Covers matrix algebra including types of matrices, operations, transpose, and symmetric/skew-symmetric matrices. Foundation for solving linear systems.",
    objectives: ["Perform addition, subtraction, and multiplication of matrices", "Find transpose and verify properties of symmetric matrices", "Apply elementary row operations", "Understand conditions for matrix multiplication"],
    difficulty: "Medium", studyTimeMinutes: 75, questionCount: 38, examWeight: "5 marks",
    keyFormulas: ["(AB)ᵀ = BᵀAᵀ", "(A+B)ᵀ = Aᵀ+Bᵀ"],
  },
  {
    subjectId: "mathematics", chapterId: 4,
    overview: "Covers determinants, their properties, cofactors, adjoint, and inverse of a matrix. Applications include solving systems of equations using Cramer's rule.",
    objectives: ["Evaluate determinants using properties and cofactor expansion", "Find adjoint and inverse of a square matrix", "Apply Cramer's rule to solve systems of linear equations", "Use determinants to find area of triangles"],
    difficulty: "Hard", studyTimeMinutes: 90, questionCount: 48, examWeight: "5 marks",
    keyFormulas: ["A⁻¹ = adj(A)/|A|", "Area = ½|det|"],
  },
  {
    subjectId: "mathematics", chapterId: 5,
    overview: "Covers continuity and differentiability of functions. Includes chain rule, implicit and logarithmic differentiation, and mean value theorems.",
    objectives: ["Test continuity of functions at a point and on an interval", "Differentiate composite, implicit, and parametric functions", "Apply logarithmic differentiation to complex expressions", "State and verify Rolle's and Lagrange's mean value theorems"],
    difficulty: "Hard", studyTimeMinutes: 100, questionCount: 55, examWeight: "8 marks",
    keyFormulas: ["d/dx[f(g(x))] = f'(g(x))·g'(x)", "d/dx[ln x] = 1/x"],
  },
  {
    subjectId: "mathematics", chapterId: 6,
    overview: "Applies derivatives to real-world problems: rate of change, increasing/decreasing functions, tangents, normals, and optimisation.",
    objectives: ["Find rate of change of quantities using derivatives", "Determine intervals where functions are increasing or decreasing", "Find equations of tangents and normals to curves", "Solve optimisation problems using first and second derivative tests"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 52, examWeight: "8 marks",
    keyFormulas: ["slope = dy/dx", "normal slope = -dx/dy"],
  },
  {
    subjectId: "mathematics", chapterId: 7,
    overview: "Covers indefinite and definite integration techniques including substitution, integration by parts, partial fractions, and properties of definite integrals.",
    objectives: ["Apply substitution and integration by parts", "Decompose rational functions using partial fractions", "Evaluate definite integrals using properties", "Integrate standard forms and trigonometric functions"],
    difficulty: "Hard", studyTimeMinutes: 110, questionCount: 60, examWeight: "8 marks",
    keyFormulas: ["∫u dv = uv - ∫v du", "∫₀ᵃ f(x)dx = ∫₀ᵃ f(a-x)dx"],
  },
  {
    subjectId: "mathematics", chapterId: 8,
    overview: "Uses definite integration to calculate areas bounded by curves, lines, and axes. Covers area between two curves.",
    objectives: ["Set up integrals to find area under a curve", "Calculate area between two intersecting curves", "Identify limits of integration from graphs", "Apply integration to find areas of standard curves"],
    difficulty: "Medium", studyTimeMinutes: 70, questionCount: 35, examWeight: "6 marks",
    keyFormulas: ["A = ∫ₐᵇ |f(x)| dx"],
  },
  {
    subjectId: "mathematics", chapterId: 9,
    overview: "Covers formation and solution of differential equations. Methods include variable separable, homogeneous, and linear first-order equations.",
    objectives: ["Form differential equations by eliminating arbitrary constants", "Solve differential equations by variable separable method", "Identify and solve homogeneous differential equations", "Solve linear first-order differential equations using integrating factor"],
    difficulty: "Hard", studyTimeMinutes: 90, questionCount: 48, examWeight: "6 marks",
    keyFormulas: ["dy/dx + Py = Q", "IF = e^∫P dx"],
  },
  {
    subjectId: "mathematics", chapterId: 10,
    overview: "Covers vector algebra including types of vectors, dot and cross products, and scalar triple product. Applications in geometry and physics.",
    objectives: ["Perform addition, subtraction, and scalar multiplication of vectors", "Calculate dot product and find angle between vectors", "Compute cross product and find area of parallelogram", "Evaluate scalar triple product and test coplanarity"],
    difficulty: "Medium", studyTimeMinutes: 80, questionCount: 42, examWeight: "6 marks",
    keyFormulas: ["a·b = |a||b|cosθ", "|a×b| = |a||b|sinθ"],
  },
  {
    subjectId: "mathematics", chapterId: 11,
    overview: "Extends 2D coordinate geometry to 3D. Covers direction cosines, equations of lines and planes, and shortest distance between skew lines.",
    objectives: ["Find direction cosines and direction ratios of a line", "Write equations of lines and planes in vector and Cartesian form", "Calculate angle between two lines, two planes, or a line and plane", "Find shortest distance between two skew lines"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 50, examWeight: "6 marks",
    keyFormulas: ["l²+m²+n²=1", "d = |(b₁×b₂)·(a₂-a₁)|/|b₁×b₂|"],
  },
  {
    subjectId: "mathematics", chapterId: 12,
    overview: "Covers formulation and graphical solution of linear programming problems. Includes finding feasible regions and optimal solutions using the corner point method.",
    objectives: ["Formulate real-world problems as LPPs", "Identify feasible region and corner points graphically", "Apply corner point method to find optimal solution", "Solve maximisation and minimisation problems"],
    difficulty: "Easy", studyTimeMinutes: 60, questionCount: 28, examWeight: "5 marks",
    keyFormulas: [],
  },
  {
    subjectId: "mathematics", chapterId: 13,
    overview: "Covers conditional probability, Bayes' theorem, random variables, probability distributions, and the binomial distribution.",
    objectives: ["Calculate conditional probability using multiplication theorem", "Apply Bayes' theorem to solve inverse probability problems", "Define random variables and construct probability distributions", "Calculate mean and variance of binomial distribution"],
    difficulty: "Hard", studyTimeMinutes: 95, questionCount: 52, examWeight: "8 marks",
    keyFormulas: ["P(A|B) = P(A∩B)/P(B)", "P(Aᵢ|B) = P(Aᵢ)P(B|Aᵢ)/ΣP(Aⱼ)P(B|Aⱼ)"],
  },
];

/**
 * Get metadata for a specific chapter.
 * Returns null if not found — safe for future DB-backed async version.
 * @param {string} subjectId
 * @param {number} chapterId
 * @returns {ChapterMeta | null}
 */
export const getChapterMeta = (subjectId, chapterId) =>
  CHAPTER_META.find(
    (m) => m.subjectId === subjectId && m.chapterId === Number(chapterId)
  ) ?? null;

export default CHAPTER_META;
