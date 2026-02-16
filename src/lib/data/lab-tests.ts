import type { LabCategory, LabTest, LabCategoryMeta } from '@/lib/types/lab-tests'

export const LAB_CATEGORY_META: Record<LabCategory, LabCategoryMeta> = {
  blood_work: {
    key: 'blood_work',
    label: 'Blood Work',
    shortLabel: 'Blood',
    icon: 'droplets',
    color: 'red',
    description: 'Standard blood panels and biomarkers that reveal deficiencies, overtraining, and metabolic health.',
  },
  performance_lab: {
    key: 'performance_lab',
    label: 'Performance Lab Testing',
    shortLabel: 'Lab',
    icon: 'flask-conical',
    color: 'blue',
    description: 'Gold-standard sports science assessments done at a physiology lab to set precise training zones.',
  },
  diy_home: {
    key: 'diy_home',
    label: 'DIY / At-Home Testing',
    shortLabel: 'DIY',
    icon: 'house',
    color: 'green',
    description: 'Portable monitoring tools you can use daily or mid-workout to track readiness and fueling.',
  },
  genetic: {
    key: 'genetic',
    label: 'Genetic / DNA Testing',
    shortLabel: 'DNA',
    icon: 'dna',
    color: 'purple',
    description: 'One-time genetic tests that reveal predispositions for power, endurance, and injury risk.',
  },
}

export const LAB_TESTS: LabTest[] = [
  // ─── BLOOD WORK ──────────────────────────────────────────────────────────────
  {
    id: 'iron-panel',
    category: 'blood_work',
    name: 'Iron Panel (Ferritin, Iron, TIBC)',
    shortName: 'Iron Panel',
    description:
      'Measures ferritin (iron stores), serum iron, and total iron-binding capacity (TIBC) to assess the body\'s ability to deliver oxygen to working muscles.',
    whyItMatters:
      'An extremely high number of professional triathletes have deficiencies in iron. Low ferritin causes fatigue, poor recovery, and declining performance long before full anemia develops. Female athletes and heavy sweaters are especially at risk.',
    submarkers: [
      { name: 'Ferritin', optimalRange: '50–150', unit: 'ng/mL', notes: 'Below 30 is suboptimal for athletes even if "normal"' },
      { name: 'Serum Iron', optimalRange: '60–170', unit: 'µg/dL' },
      { name: 'TIBC', optimalRange: '250–370', unit: 'µg/dL', notes: 'High TIBC can indicate iron deficiency' },
    ],
    frequency: 'Every 3–6 months, more often if supplementing',
    priority: 'essential',
    tags: ['oxygen delivery', 'anemia', 'fatigue', 'recovery'],
  },
  {
    id: 'cbc',
    category: 'blood_work',
    name: 'CBC (Complete Blood Count)',
    shortName: 'CBC',
    description:
      'Comprehensive snapshot of red blood cells, white blood cells, hemoglobin, hematocrit, and platelets. The primary screen for anemia and immune health.',
    whyItMatters:
      'Hemoglobin and hematocrit directly affect oxygen-carrying capacity. Low values impair VO2 max and endurance. White blood cell counts can reveal immune suppression from overtraining.',
    submarkers: [
      { name: 'Hemoglobin', optimalRange: '14–17 (M) / 12–15 (F)', unit: 'g/dL' },
      { name: 'Hematocrit', optimalRange: '40–50 (M) / 36–44 (F)', unit: '%' },
      { name: 'RBC', optimalRange: '4.5–5.5 (M) / 4.0–5.0 (F)', unit: 'M/µL' },
      { name: 'WBC', optimalRange: '4.5–11.0', unit: 'K/µL' },
      { name: 'Platelets', optimalRange: '150–400', unit: 'K/µL' },
    ],
    frequency: 'Every 3–6 months',
    priority: 'essential',
    tags: ['anemia', 'immune', 'oxygen', 'overtraining'],
  },
  {
    id: 'vitamin-d',
    category: 'blood_work',
    name: 'Vitamin D (25-OH)',
    shortName: 'Vitamin D',
    description:
      'Measures 25-hydroxyvitamin D, the storage form of vitamin D. Critical for bone health, immune function, and muscle performance.',
    whyItMatters:
      'Probably one of the most important blood markers for endurance athletes together with iron. Low vitamin D impairs calcium absorption (stress fracture risk), weakens the immune system, and reduces muscle force production. Many athletes who train indoors or live in northern latitudes are deficient.',
    optimalRange: '50–80',
    unit: 'ng/mL',
    frequency: 'Every 6 months, seasonally in winter',
    priority: 'essential',
    tags: ['bone health', 'immune', 'muscle', 'stress fracture'],
  },
  {
    id: 'vitamin-b12',
    category: 'blood_work',
    name: 'Vitamin B12',
    shortName: 'B12',
    description:
      'Essential vitamin for red blood cell production, neurological function, and DNA synthesis.',
    whyItMatters:
      'Critical for red blood cell production. Deficiency causes megaloblastic anemia (large, dysfunctional red blood cells), fatigue, and neurological symptoms. Vegans and vegetarians are especially at risk since B12 is primarily found in animal products.',
    optimalRange: '500–1000',
    unit: 'pg/mL',
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['red blood cells', 'energy', 'neurological', 'vegan'],
  },
  {
    id: 'testosterone',
    category: 'blood_work',
    name: 'Testosterone (Total & Free)',
    shortName: 'Testosterone',
    description:
      'Primary anabolic hormone affecting muscle repair, bone density, mood, and recovery capacity.',
    whyItMatters:
      'Drops signal overtraining or under-fueling. Chronically low testosterone leads to muscle loss, poor recovery, decreased bone density, and low motivation. RED-S (Relative Energy Deficiency in Sport) often presents with suppressed testosterone.',
    submarkers: [
      { name: 'Total Testosterone', optimalRange: '400–900 (M) / 15–70 (F)', unit: 'ng/dL' },
      { name: 'Free Testosterone', optimalRange: '9–25 (M) / 0.3–1.9 (F)', unit: 'pg/mL' },
    ],
    frequency: 'Every 6–12 months, or if symptoms of overtraining',
    priority: 'recommended',
    tags: ['overtraining', 'recovery', 'RED-S', 'hormones'],
  },
  {
    id: 'cortisol',
    category: 'blood_work',
    name: 'Cortisol',
    shortName: 'Cortisol',
    description:
      'The primary stress hormone released by the adrenals. Morning cortisol reflects the body\'s stress response and recovery status.',
    whyItMatters:
      'If levels remain high for a long time, it can cause fatigue, difficulty sleeping, hormone imbalances, and muscle breakdown. Chronically elevated cortisol is a hallmark of overtraining syndrome and can suppress immune function and impair glycogen storage.',
    optimalRange: '6–18 (morning)',
    unit: 'µg/dL',
    frequency: 'Every 6–12 months, or during heavy training blocks',
    priority: 'recommended',
    tags: ['stress', 'overtraining', 'recovery', 'sleep'],
  },
  {
    id: 'crp',
    category: 'blood_work',
    name: 'CRP (C-Reactive Protein)',
    shortName: 'CRP',
    description:
      'An acute-phase protein produced by the liver that rises in response to inflammation anywhere in the body.',
    whyItMatters:
      'Systemic inflammation marker that can reveal hidden injury, illness, or excessive training stress. Persistently elevated CRP means the body is not recovering properly. Should be tested fasted and not within 48 hours of a hard session.',
    optimalRange: '< 1.0',
    unit: 'mg/L',
    frequency: 'Every 3–6 months',
    priority: 'recommended',
    tags: ['inflammation', 'recovery', 'injury', 'overtraining'],
  },
  {
    id: 'creatine-kinase',
    category: 'blood_work',
    name: 'Creatine Kinase (CK)',
    shortName: 'CK',
    description:
      'An enzyme released from damaged muscle tissue. Levels spike after intense or eccentric exercise and indicate muscle breakdown.',
    whyItMatters:
      'Muscle damage and recovery indicator. While some elevation is normal after hard training, persistently high CK suggests inadequate recovery, rhabdomyolysis risk, or overtraining. Useful for monitoring training load relative to recovery.',
    optimalRange: '30–200 (resting)',
    unit: 'U/L',
    frequency: 'Every 3–6 months, or when monitoring heavy training blocks',
    priority: 'recommended',
    tags: ['muscle damage', 'recovery', 'overtraining', 'rhabdomyolysis'],
  },
  {
    id: 'thyroid',
    category: 'blood_work',
    name: 'Thyroid Panel (TSH, T3, T4)',
    shortName: 'Thyroid',
    description:
      'Evaluates thyroid function through TSH (stimulating hormone), free T3 (active hormone), and free T4 (storage hormone).',
    whyItMatters:
      'The thyroid controls energy, metabolism, and thermoregulation — all critical for endurance performance. Low thyroid function (hypothyroidism) causes fatigue, weight gain, cold intolerance, and poor recovery. Heavy training and under-fueling can suppress thyroid output.',
    submarkers: [
      { name: 'TSH', optimalRange: '0.5–2.5', unit: 'mIU/L', notes: 'Lower end may be more optimal for athletes' },
      { name: 'Free T3', optimalRange: '3.0–4.0', unit: 'pg/mL' },
      { name: 'Free T4', optimalRange: '1.0–1.8', unit: 'ng/dL' },
    ],
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['energy', 'metabolism', 'thermoregulation', 'fatigue'],
  },
  {
    id: 'cmp',
    category: 'blood_work',
    name: 'CMP (Comprehensive Metabolic Panel)',
    shortName: 'CMP',
    description:
      'A broad panel measuring electrolytes (sodium, potassium, calcium, chloride), kidney function (BUN, creatinine), liver enzymes (ALT, AST), and fasting glucose.',
    whyItMatters:
      'Electrolytes are critical for muscle contraction and hydration. Kidney markers ensure safe supplement use and hydration status. Liver enzymes can be elevated by overtraining, medications, or supplements. Glucose reflects fueling and metabolic health.',
    submarkers: [
      { name: 'Sodium', optimalRange: '136–145', unit: 'mEq/L' },
      { name: 'Potassium', optimalRange: '3.5–5.0', unit: 'mEq/L' },
      { name: 'Calcium', optimalRange: '8.5–10.5', unit: 'mg/dL' },
      { name: 'Creatinine', optimalRange: '0.7–1.3', unit: 'mg/dL' },
      { name: 'BUN', optimalRange: '7–20', unit: 'mg/dL' },
      { name: 'ALT', optimalRange: '7–56', unit: 'U/L' },
      { name: 'AST', optimalRange: '10–40', unit: 'U/L' },
    ],
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['electrolytes', 'kidney', 'liver', 'hydration'],
  },
  {
    id: 'lipid-panel',
    category: 'blood_work',
    name: 'Lipid Panel',
    shortName: 'Lipids',
    description:
      'Measures total cholesterol, LDL, HDL, and triglycerides to assess cardiovascular health and fat metabolism.',
    whyItMatters:
      'Endurance athletes generally have favorable lipid profiles, but not always. High triglycerides can indicate over-reliance on carbohydrates or metabolic issues. HDL is often elevated in trained athletes and is protective for cardiovascular health.',
    submarkers: [
      { name: 'Total Cholesterol', optimalRange: '< 200', unit: 'mg/dL' },
      { name: 'LDL', optimalRange: '< 100', unit: 'mg/dL' },
      { name: 'HDL', optimalRange: '> 60', unit: 'mg/dL', notes: 'Often high in endurance athletes' },
      { name: 'Triglycerides', optimalRange: '< 100', unit: 'mg/dL' },
    ],
    frequency: 'Annually',
    priority: 'recommended',
    tags: ['cardiovascular', 'cholesterol', 'fat metabolism'],
  },
  {
    id: 'glucose-hba1c',
    category: 'blood_work',
    name: 'Fasting Glucose / HbA1c',
    shortName: 'Glucose',
    description:
      'Fasting glucose is a snapshot of blood sugar regulation. HbA1c reflects average blood sugar over the past 2–3 months.',
    whyItMatters:
      'Blood sugar regulation affects fueling efficiency during training and racing. Poor glucose control means inconsistent energy, bonking risk, and compromised recovery. HbA1c gives a long-term picture that a single fasting reading cannot.',
    submarkers: [
      { name: 'Fasting Glucose', optimalRange: '70–90', unit: 'mg/dL' },
      { name: 'HbA1c', optimalRange: '4.5–5.3', unit: '%', notes: 'Athletes may be lower due to red blood cell turnover' },
    ],
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['blood sugar', 'fueling', 'metabolic health', 'energy'],
  },
  {
    id: 'magnesium',
    category: 'blood_work',
    name: 'Magnesium (RBC Magnesium)',
    shortName: 'Magnesium',
    description:
      'Measures magnesium levels, ideally RBC magnesium (intracellular) rather than serum magnesium which is less accurate for athletes.',
    whyItMatters:
      'Commonly deficient in athletes. Magnesium is involved in over 300 enzymatic reactions including muscle contraction, energy production, and electrolyte balance. Low levels cause cramping, poor sleep, increased injury risk, and impaired recovery.',
    optimalRange: '4.2–6.8 (RBC)',
    unit: 'mg/dL',
    frequency: 'Every 6 months',
    priority: 'essential',
    tags: ['cramping', 'recovery', 'sleep', 'electrolytes'],
  },

  // ─── PERFORMANCE LAB TESTING ─────────────────────────────────────────────────
  {
    id: 'vo2-max',
    category: 'performance_lab',
    name: 'VO2 Max Test',
    shortName: 'VO2 Max',
    description:
      'Maximal oxygen uptake test performed on a treadmill or bike ergometer with a metabolic cart measuring inspired/expired gases. The gold standard for aerobic capacity.',
    whyItMatters:
      'VO2 max represents your aerobic ceiling — the maximum amount of oxygen your body can utilize during maximal exercise. It\'s the single best predictor of endurance performance. Knowing your VO2 max helps set realistic goals and track long-term fitness progression.',
    optimalRange: '55–75+ (elite)',
    unit: 'mL/kg/min',
    frequency: 'Every 6–12 months, or at the start of each training macrocycle',
    priority: 'essential',
    tags: ['aerobic capacity', 'gold standard', 'fitness', 'performance'],
  },
  {
    id: 'lactate-threshold',
    category: 'performance_lab',
    name: 'Lactate Threshold Testing (LT1 & LT2)',
    shortName: 'Lactate Threshold',
    description:
      'Incremental exercise test with blood lactate samples at each stage. Identifies two critical inflection points: LT1 (aerobic threshold, ~2 mmol/L) and LT2 (anaerobic/lactate threshold, ~4 mmol/L).',
    whyItMatters:
      'During a lab test they look for 2 significant changes in blood lactate, called LT1 and LT2. This sets your training zones precisely. LT1 defines the top of your easy/endurance zone. LT2 defines your threshold — the hardest intensity you can sustain for roughly an hour. Training zones based on lactate testing are far more accurate than heart rate formulas.',
    submarkers: [
      { name: 'LT1 (Aerobic Threshold)', optimalRange: '~2.0', unit: 'mmol/L', notes: 'Top of zone 2 / easy endurance' },
      { name: 'LT2 (Anaerobic Threshold)', optimalRange: '~4.0', unit: 'mmol/L', notes: 'Threshold intensity, ~1hr race pace' },
    ],
    frequency: 'Every 3–6 months, or when switching training phases',
    priority: 'essential',
    tags: ['training zones', 'lactate', 'threshold', 'pacing'],
  },
  {
    id: 'running-economy',
    category: 'performance_lab',
    name: 'Running Economy',
    shortName: 'Running Economy',
    description:
      'Measured in millilitres of oxygen per kilogram of body weight per kilometre (mL O₂/kg/km), showing the energy you use at a given speed.',
    whyItMatters:
      'Two athletes with the same VO2 max can have very different race times — the more economical runner uses less oxygen at any given pace. Improvements in running economy through strength work, plyometrics, and technique drills translate directly to faster race times at the same effort.',
    optimalRange: '180–210 (elite)',
    unit: 'mL O₂/kg/km',
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['efficiency', 'oxygen cost', 'technique', 'pacing'],
  },
  {
    id: 'substrate-utilization',
    category: 'performance_lab',
    name: 'Substrate Utilization (Fat/Carb Oxidation)',
    shortName: 'Fat vs Carb',
    description:
      'Measured via respiratory exchange ratio (RER) during an incremental test. Shows what percentage of energy comes from fat vs. carbohydrates at each intensity.',
    whyItMatters:
      'Knowing your fat vs. carb burn ratio at different intensities helps you design fueling strategies for racing and training. A high "fat max" (crossover point where carb burning exceeds fat burning) means better endurance at lower intensities and more efficient glycogen sparing.',
    submarkers: [
      { name: 'Fat Max (peak fat oxidation)', optimalRange: '0.5–1.0+', unit: 'g/min' },
      { name: 'Crossover Point', unit: '% VO2 max', notes: 'Intensity where carb > fat utilization' },
    ],
    frequency: 'Every 6–12 months, or when changing nutrition strategy',
    priority: 'recommended',
    tags: ['fueling', 'fat oxidation', 'nutrition', 'RER'],
  },
  {
    id: 'dexa-scan',
    category: 'performance_lab',
    name: 'DEXA Scan',
    shortName: 'DEXA',
    description:
      'Dual-energy X-ray absorptiometry providing precise measurements of bone mineral density, lean muscle mass, and body fat percentage with regional breakdowns.',
    whyItMatters:
      'The most accurate body composition measurement available. Shows not just total body fat, but regional distribution and muscle asymmetries (left vs. right). Bone density data is critical for identifying stress fracture risk, especially in female athletes and those with RED-S.',
    frequency: 'Every 6–12 months',
    priority: 'recommended',
    tags: ['body composition', 'bone density', 'lean mass', 'RED-S'],
  },
  {
    id: 'sweat-test',
    category: 'performance_lab',
    name: 'Sweat Testing',
    shortName: 'Sweat Test',
    description:
      'Measures sweat rate (mL/hr) and sodium concentration (mmol/L) using absorbent patches during exercise. Used to create a personalized hydration strategy.',
    whyItMatters:
      'Sodium concentration for personalized hydration strategy. Sweat sodium varies massively between athletes (200–2000+ mg/L). Salty sweaters who don\'t replace sodium risk hyponatremia, cramping, and significant performance decline. One test provides your sodium profile for life.',
    submarkers: [
      { name: 'Sweat Rate', unit: 'mL/hr', notes: 'Varies with heat and intensity' },
      { name: 'Sodium Concentration', optimalRange: '200–2000+', unit: 'mg/L', notes: 'Genetically determined, stable over time' },
    ],
    frequency: 'Once (sodium concentration is genetically stable)',
    priority: 'recommended',
    tags: ['hydration', 'sodium', 'cramping', 'heat'],
  },

  // ─── DIY / AT-HOME TESTING ───────────────────────────────────────────────────
  {
    id: 'lactate-strips',
    category: 'diy_home',
    name: 'Lactate Strips (Finger Prick)',
    shortName: 'Lactate Meter',
    description:
      'Portable lactate meters like the Lactate Pro 2 let you test blood lactate mid-workout using a small finger prick and test strip.',
    whyItMatters:
      'Allows you to perform your own field-based lactate testing to validate training zones between lab visits. You can track LT1/LT2 shifts over a training block and confirm that your easy runs are truly below your aerobic threshold.',
    frequency: 'As needed during key sessions or zone-validation workouts',
    priority: 'optional',
    tags: ['lactate', 'field testing', 'zones', 'portable'],
  },
  {
    id: 'cgm',
    category: 'diy_home',
    name: 'Continuous Glucose Monitor (CGM)',
    shortName: 'CGM',
    description:
      'A small sensor worn on the arm that measures interstitial glucose every 1–5 minutes, providing real-time and historical blood sugar data via a phone app.',
    whyItMatters:
      'Continuous glucose monitors are getting popular for fueling optimization. Seeing glucose responses to meals, training, and recovery in real-time helps you dial in pre-race nutrition, identify foods that spike or crash your energy, and optimize carb timing around workouts.',
    frequency: 'Continuous wear (typically 14-day sensor cycles)',
    priority: 'optional',
    tags: ['glucose', 'fueling', 'nutrition', 'real-time'],
  },
  {
    id: 'hrv',
    category: 'diy_home',
    name: 'HRV (Heart Rate Variability)',
    shortName: 'HRV',
    description:
      'Measures the variation in time between heartbeats, typically taken first thing in the morning using a chest strap or wrist device. Higher HRV generally indicates better recovery and readiness.',
    whyItMatters:
      'Daily readiness via wrist device or chest strap. HRV trends reveal whether your autonomic nervous system is recovering properly. A declining HRV trend over days signals accumulated fatigue, illness onset, or life stress — allowing you to modify training before overreaching.',
    frequency: 'Daily (morning, upon waking)',
    priority: 'essential',
    tags: ['readiness', 'recovery', 'autonomic', 'daily'],
  },
  {
    id: 'resting-hr',
    category: 'diy_home',
    name: 'Resting Heart Rate',
    shortName: 'Resting HR',
    description:
      'Your heart rate measured first thing in the morning before getting out of bed. One of the simplest and oldest indicators of recovery and fitness.',
    whyItMatters:
      'Simple daily recovery check. An elevated resting HR (5–10 bpm above baseline) can indicate incomplete recovery, dehydration, illness, or overtraining. Tracking trends over weeks and months also shows improving cardiovascular fitness as resting HR drops.',
    frequency: 'Daily (morning, before rising)',
    priority: 'essential',
    tags: ['recovery', 'fitness', 'daily', 'simple'],
  },
  {
    id: 'urine-sg',
    category: 'diy_home',
    name: 'Urine Specific Gravity',
    shortName: 'Urine SG',
    description:
      'A refractometer test measuring the concentration of urine to assess hydration status. Also estimated by urine color (lighter = more hydrated).',
    whyItMatters:
      'Hydration status directly impacts blood volume, thermoregulation, and performance. Dehydration of just 2% bodyweight can impair performance by 10–20%. Morning urine SG provides an objective hydration baseline before training.',
    optimalRange: '1.005–1.015',
    unit: 'SG',
    frequency: 'Daily or before key sessions',
    priority: 'optional',
    tags: ['hydration', 'urine', 'thermoregulation', 'daily'],
  },

  // ─── GENETIC / DNA TESTING ───────────────────────────────────────────────────
  {
    id: 'actn3',
    category: 'genetic',
    name: 'ACTN3 Gene (Alpha-Actinin-3)',
    shortName: 'ACTN3',
    description:
      'The ACTN3 gene encodes a protein found exclusively in fast-twitch muscle fibers. The R577X variant determines whether you produce alpha-actinin-3.',
    whyItMatters:
      'Power vs. endurance predisposition. The RR genotype is associated with sprint/power performance (found in most Olympic sprinters). The XX genotype is more common in endurance athletes. Knowing your variant helps tailor training emphasis — though environmental factors and training always outweigh genetics.',
    frequency: 'Once (genetics don\'t change)',
    priority: 'optional',
    tags: ['power', 'endurance', 'fast-twitch', 'predisposition'],
  },
  {
    id: 'ace',
    category: 'genetic',
    name: 'ACE Gene (Angiotensin-Converting Enzyme)',
    shortName: 'ACE',
    description:
      'The ACE gene has an insertion (I) and deletion (D) polymorphism that influences cardiovascular efficiency and muscle fiber composition.',
    whyItMatters:
      'Endurance capacity markers. The II genotype is associated with superior endurance performance and is overrepresented in elite distance athletes. The DD genotype is linked to higher strength and power. The ID genotype offers a balanced profile suited for middle-distance and triathlon.',
    frequency: 'Once (genetics don\'t change)',
    priority: 'optional',
    tags: ['endurance', 'cardiovascular', 'predisposition', 'distance'],
  },
]

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

export function getTestsByCategory(category: LabCategory): LabTest[] {
  return LAB_TESTS.filter((t) => t.category === category)
}

export function getLabCategories(): LabCategory[] {
  const cats = new Set(LAB_TESTS.map((t) => t.category))
  return Array.from(cats)
}

export function getTestsByPriority(priority: LabTest['priority']): LabTest[] {
  return LAB_TESTS.filter((t) => t.priority === priority)
}
