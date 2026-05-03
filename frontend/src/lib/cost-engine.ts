// Cost Estimation Engine — Component-level with adjustments (PRD §4.3)

interface CostInput {
  baseCostMin: number;
  baseCostMax: number;
  surgeonFeePercent: number;
  anaesthesiaPercent: number;
  diagnosticsPercent: number;
  medicationPercent: number;
  stayPerDayMin: number;
  stayPerDayMax: number;
  expectedStayDays: number;
  // Adjustment factors
  cityPricingFactor: number;    // Metro=1.2-1.3, Tier2=0.85-0.9, Tier3=0.7
  hospitalTierMultiplier: number; // Budget=0.6, Mid=1.0, Premium=1.6
  patientAge: number | null;
  comorbidities: string[];
}

interface CostComponent {
  label: string;
  min: number;
  max: number;
}

interface CostResult {
  totalMin: number;
  totalMax: number;
  components: CostComponent[];
  confidence: number;
  adjustments: string[];
  riskFlags: string[];
}

// ── Comorbidity Matching with Aliases ───────────────────────────────────

interface ComorbidityEntry {
  factor: number;
  label: string;
  aliases: string[];
}

const COMORBIDITY_DATABASE: ComorbidityEntry[] = [
  {
    factor: 0.10,
    label: "Diabetes (+10% complication risk)",
    aliases: ["diabetes", "diabetic", "type 2 diabetes", "type 1 diabetes", "diabetes mellitus", "high sugar", "blood sugar", "sugar"],
  },
  {
    factor: 0.20,
    label: "Cardiac history (+20% risk)",
    aliases: ["cardiac history", "heart disease", "heart condition", "cardiac", "heart attack", "myocardial", "coronary", "heart failure", "angina"],
  },
  {
    factor: 0.08,
    label: "Hypertension (+8% risk)",
    aliases: ["hypertension", "high bp", "high blood pressure", "hbp", "elevated bp", "bp"],
  },
  {
    factor: 0.08,
    label: "Obesity (+8% complication risk)",
    aliases: ["obesity", "obese", "overweight", "high bmi", "morbid obesity"],
  },
  {
    factor: 0.15,
    label: "Kidney disease (+15% risk)",
    aliases: ["kidney disease", "renal", "ckd", "chronic kidney", "kidney failure", "dialysis", "kidney"],
  },
  {
    factor: 0.05,
    label: "Asthma/COPD (+5% anaesthesia risk)",
    aliases: ["asthma", "copd", "chronic obstructive", "breathing problem", "lung disease", "respiratory"],
  },
  {
    factor: 0.06,
    label: "Thyroid disorder (+6% recovery risk)",
    aliases: ["thyroid", "hypothyroid", "hyperthyroid", "thyroidism"],
  },
];

function matchComorbidities(comorbidities: string[]): { factor: number; labels: string[] } {
  let totalFactor = 0;
  const labels: string[] = [];
  const matched = new Set<number>();

  for (const c of comorbidities) {
    const normalized = c.toLowerCase().trim();
    for (let i = 0; i < COMORBIDITY_DATABASE.length; i++) {
      if (matched.has(i)) continue; // Don't double-count
      const entry = COMORBIDITY_DATABASE[i];
      if (entry.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))) {
        totalFactor += entry.factor;
        labels.push(entry.label);
        matched.add(i);
        break;
      }
    }
  }

  return { factor: totalFactor, labels };
}

// ── Main Estimation Function ────────────────────────────────────────────

export function estimateCost(input: CostInput): CostResult {
  const adjustments: string[] = [];
  const riskFlags: string[] = [];

  // Base procedure cost adjusted by city + hospital tier
  const geoMult = input.cityPricingFactor;
  const tierMult = input.hospitalTierMultiplier;
  const baseMult = geoMult * tierMult;

  const procedureMin = Math.round(input.baseCostMin * baseMult);
  const procedureMax = Math.round(input.baseCostMax * baseMult);
  adjustments.push(`Geographic factor: ${geoMult}x`);
  adjustments.push(`Hospital tier: ${tierMult}x`);

  // Surgeon fee
  const surgeonMin = Math.round(procedureMin * input.surgeonFeePercent);
  const surgeonMax = Math.round(procedureMax * input.surgeonFeePercent);

  // Hospital stay
  let stayDays = input.expectedStayDays;
  let stayMin = input.stayPerDayMin * stayDays * tierMult;
  let stayMax = input.stayPerDayMax * stayDays * tierMult;

  // Age adjustment
  if (input.patientAge && input.patientAge > 60) {
    const ageFactor = input.patientAge > 75 ? 0.25 : 0.15;
    stayDays = Math.ceil(stayDays * (1 + ageFactor));
    stayMin = Math.round(stayMin * (1 + ageFactor));
    stayMax = Math.round(stayMax * (1 + ageFactor));
    adjustments.push(`Elderly patient (${input.patientAge}y): +${Math.round(ageFactor * 100)}% stay`);
    riskFlags.push(`Patient age ${input.patientAge} — extended recovery and monitoring likely`);
  }

  // Diagnostics
  const diagMin = Math.round(procedureMin * input.diagnosticsPercent);
  const diagMax = Math.round(procedureMax * input.diagnosticsPercent);

  // Anaesthesia
  const anaesMin = Math.round(procedureMin * input.anaesthesiaPercent);
  const anaesMax = Math.round(procedureMax * input.anaesthesiaPercent);

  // Medication
  const medMin = Math.round(procedureMin * input.medicationPercent);
  const medMax = Math.round(procedureMax * input.medicationPercent);

  // Comorbidity contingency — using alias-based matching
  const comorbidityResult = matchComorbidities(input.comorbidities);
  const contingencyFactor = comorbidityResult.factor;
  riskFlags.push(...comorbidityResult.labels);

  const contingencyMin = Math.round((procedureMin + stayMin) * contingencyFactor);
  const contingencyMax = Math.round((procedureMax + stayMax) * contingencyFactor);
  if (contingencyFactor > 0) {
    adjustments.push(`Comorbidity contingency: +${Math.round(contingencyFactor * 100)}%`);
  }

  // Components
  const components: CostComponent[] = [
    { label: "Procedure / Surgery Cost", min: procedureMin, max: procedureMax },
    { label: "Surgeon / Specialist Fee", min: surgeonMin, max: surgeonMax },
    { label: `Hospital Stay (${stayDays} days)`, min: Math.round(stayMin), max: Math.round(stayMax) },
    { label: "Diagnostics (pre/post)", min: diagMin, max: diagMax },
    { label: "Anaesthesia", min: anaesMin, max: anaesMax },
    { label: "Post-procedure Medication", min: medMin, max: medMax },
  ];

  if (contingencyFactor > 0) {
    components.push({ label: "Complication Contingency", min: contingencyMin, max: contingencyMax });
  }

  const totalMin = components.reduce((s, c) => s + c.min, 0);
  const totalMax = components.reduce((s, c) => s + c.max, 0);

  // ── Calibrated Confidence Score (PRD §6.2) ────────────────────────────
  // Base: we always have procedure benchmarks from DB = reasonable start
  let confidence = 0.65;

  // Data completeness bonuses
  if (input.patientAge) confidence += 0.08;           // Know patient age
  if (input.comorbidities.length > 0) confidence += 0.07; // Know comorbidities
  if (geoMult !== 1.0) confidence += 0.05;            // City-specific pricing
  if (tierMult !== 1.0) confidence += 0.05;           // Hospital-tier data

  // Penalties for sparse data
  if (input.baseCostMin === 0 || input.baseCostMax === 0) confidence -= 0.20;
  if (input.expectedStayDays === 0) confidence -= 0.05;

  // Wider cost ranges mean less certainty
  const rangeRatio = input.baseCostMax / Math.max(input.baseCostMin, 1);
  if (rangeRatio > 3) confidence -= 0.10;
  else if (rangeRatio > 2) confidence -= 0.05;

  confidence = Math.max(0.3, Math.min(confidence, 0.92));

  return { totalMin, totalMax, components, confidence, adjustments, riskFlags };
}

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function formatINRSmart(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
