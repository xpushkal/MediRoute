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

const COMORBIDITY_FACTORS: Record<string, { factor: number; label: string }> = {
  diabetes: { factor: 0.10, label: "Diabetes (+10% complication risk)" },
  "cardiac history": { factor: 0.20, label: "Cardiac history (+20% risk)" },
  hypertension: { factor: 0.08, label: "Hypertension (+8% risk)" },
  obesity: { factor: 0.08, label: "Obesity (+8% complication risk)" },
  "kidney disease": { factor: 0.15, label: "Kidney disease (+15% risk)" },
};

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

  // Comorbidity contingency
  let contingencyFactor = 0;
  for (const c of input.comorbidities) {
    const key = c.toLowerCase();
    const match = Object.entries(COMORBIDITY_FACTORS).find(([k]) => key.includes(k));
    if (match) {
      contingencyFactor += match[1].factor;
      riskFlags.push(match[1].label);
    }
  }

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

  // Confidence: higher if we have more data points
  let confidence = 0.5;
  if (input.patientAge) confidence += 0.1;
  if (input.comorbidities.length > 0) confidence += 0.1;
  if (geoMult !== 1.0) confidence += 0.05;
  if (tierMult !== 1.0) confidence += 0.05;
  confidence = Math.min(confidence, 0.95);

  return { totalMin, totalMax, components, confidence, adjustments, riskFlags };
}

export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}
