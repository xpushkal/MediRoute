// ═══════════════════════════════════════════════════════════════════════════
// MediRoute Symptom Intelligence Engine
// ═══════════════════════════════════════════════════════════════════════════
// Local symptom → condition → procedure mapping that:
//   1. Works as a FAST fallback when LLM is slow/down
//   2. Validates and enriches LLM extractions
//   3. Provides procedure matching with fuzzy TF-IDF-like scoring
//   4. Maps ICD-10 codes to specialties for provider filtering
// ═══════════════════════════════════════════════════════════════════════════

export interface ConditionMapping {
  condition: string;
  icd10: string;
  specialty: string;
  procedures: string[];
  symptoms: string[];          // canonical symptoms
  synonyms: string[];          // fuzzy matches / colloquial terms
  urgency: "low" | "moderate" | "high" | "emergency";
  followUpQuestions: string[]; // clarification prompts
}

// ── Master Knowledge Base ───────────────────────────────────────────────

export const CONDITION_DATABASE: ConditionMapping[] = [
  // ─── Cardiology ───────────────────────────────────────────────────────
  {
    condition: "Coronary Artery Disease",
    icd10: "I25.1",
    specialty: "Cardiology",
    procedures: ["Angioplasty", "Coronary Artery Bypass Graft"],
    symptoms: ["chest pain", "chest tightness", "shortness of breath", "arm pain", "jaw pain", "sweating"],
    synonyms: ["heart attack", "heart pain", "seene mein dard", "dil ka dard", "heart block", "angina", "cardiac arrest"],
    urgency: "high",
    followUpQuestions: [
      "Does the pain occur during physical activity or at rest?",
      "Do you have a history of high blood pressure or diabetes?",
    ],
  },
  {
    condition: "Heart Valve Disease",
    icd10: "I35.0",
    specialty: "Cardiology",
    procedures: ["Valve Replacement Surgery"],
    symptoms: ["heart murmur", "fatigue", "shortness of breath", "swollen ankles", "dizziness", "fainting"],
    synonyms: ["valve problem", "leaking valve", "mitral valve", "aortic valve"],
    urgency: "high",
    followUpQuestions: ["Have you been told you have a heart murmur?"],
  },

  // ─── Orthopaedics ────────────────────────────────────────────────────
  {
    condition: "Knee Osteoarthritis",
    icd10: "M17.1",
    specialty: "Orthopaedics",
    procedures: ["Knee Replacement"],
    symptoms: ["knee pain", "knee swelling", "stiffness", "difficulty walking", "grinding sound"],
    synonyms: ["ghutne mein dard", "knee problem", "joint pain knee", "arthritis knee", "knee replacement", "total knee"],
    urgency: "moderate",
    followUpQuestions: [
      "Which knee is affected — left, right, or both?",
      "How long have you been experiencing this pain?",
    ],
  },
  {
    condition: "Hip Osteoarthritis",
    icd10: "M16.1",
    specialty: "Orthopaedics",
    procedures: ["Hip Replacement"],
    symptoms: ["hip pain", "groin pain", "limping", "difficulty sitting", "thigh pain"],
    synonyms: ["hip problem", "hip joint pain", "kamar dard", "hip replacement"],
    urgency: "moderate",
    followUpQuestions: ["Does the pain radiate to your groin or thigh?"],
  },
  {
    condition: "Fracture",
    icd10: "S72.0",
    specialty: "Orthopaedics",
    procedures: ["Fracture Fixation Surgery"],
    symptoms: ["broken bone", "fracture", "severe pain after fall", "swelling after injury", "deformity"],
    synonyms: ["haddi tuti", "bone broken", "fracture surgery", "rod fitting", "plate surgery"],
    urgency: "high",
    followUpQuestions: ["Which bone is fractured? Was there a fall or accident?"],
  },

  // ─── Ophthalmology ────────────────────────────────────────────────────
  {
    condition: "Cataract",
    icd10: "H25.1",
    specialty: "Ophthalmology",
    procedures: ["Cataract Surgery"],
    symptoms: ["blurry vision", "cloudy vision", "difficulty seeing at night", "faded colors", "sensitivity to light"],
    synonyms: ["motiyabind", "cataract", "eye problem", "vision loss", "aankhon mein dhundla", "eye surgery"],
    urgency: "low",
    followUpQuestions: [
      "Is one eye or both affected?",
      "Are you experiencing double vision?",
    ],
  },
  {
    condition: "Glaucoma",
    icd10: "H40.1",
    specialty: "Ophthalmology",
    procedures: ["Glaucoma Surgery"],
    symptoms: ["eye pressure", "tunnel vision", "eye pain", "halos around lights", "peripheral vision loss"],
    synonyms: ["kala motia", "eye pressure", "glaucoma"],
    urgency: "moderate",
    followUpQuestions: ["Do you see halos around lights at night?"],
  },

  // ─── General Surgery ──────────────────────────────────────────────────
  {
    condition: "Acute Appendicitis",
    icd10: "K35.8",
    specialty: "General Surgery",
    procedures: ["Appendectomy"],
    symptoms: ["lower right abdomen pain", "nausea", "vomiting", "fever", "loss of appetite"],
    synonyms: ["appendix", "appendicitis", "pet mein dard right side", "appendix operation"],
    urgency: "emergency",
    followUpQuestions: ["When did the pain start? Is it getting worse?"],
  },
  {
    condition: "Gallstones",
    icd10: "K80.2",
    specialty: "General Surgery",
    procedures: ["Cholecystectomy"],
    symptoms: ["upper right abdomen pain", "pain after eating", "nausea", "bloating", "shoulder blade pain"],
    synonyms: ["gallbladder stone", "pitte ki pathri", "gallstone", "gallbladder removal"],
    urgency: "moderate",
    followUpQuestions: ["Does the pain worsen after eating fatty foods?"],
  },
  {
    condition: "Hernia",
    icd10: "K40.9",
    specialty: "General Surgery",
    procedures: ["Hernia Repair Surgery"],
    symptoms: ["bulge in groin", "pain when lifting", "swelling in abdomen", "heaviness in groin"],
    synonyms: ["hernia", "harniya", "bulge", "hernia operation", "inguinal hernia"],
    urgency: "moderate",
    followUpQuestions: ["Where is the bulge — groin, belly button, or surgical scar?"],
  },

  // ─── Oncology ─────────────────────────────────────────────────────────
  {
    condition: "Cancer (General)",
    icd10: "C80.1",
    specialty: "Oncology",
    procedures: ["Chemotherapy Cycle"],
    symptoms: ["unexplained weight loss", "persistent fatigue", "lump", "unusual bleeding", "chronic pain"],
    synonyms: ["cancer", "tumor", "tumour", "karkrog", "chemo", "chemotherapy", "cancer treatment"],
    urgency: "high",
    followUpQuestions: [
      "What type of cancer has been diagnosed?",
      "What stage has been identified?",
    ],
  },

  // ─── Urology ──────────────────────────────────────────────────────────
  {
    condition: "Kidney Stones",
    icd10: "N20.0",
    specialty: "Urology",
    procedures: ["Kidney Stone Removal"],
    symptoms: ["severe back pain", "blood in urine", "painful urination", "nausea", "flank pain"],
    synonyms: ["kidney stone", "pathri", "gurde ki pathri", "renal calculus", "stone in kidney"],
    urgency: "high",
    followUpQuestions: ["What is the size of the stone? Has it been diagnosed via ultrasound?"],
  },
  {
    condition: "Prostate Enlargement",
    icd10: "N40.0",
    specialty: "Urology",
    procedures: ["TURP Surgery"],
    symptoms: ["frequent urination", "weak urine stream", "difficulty starting urination", "night urination"],
    synonyms: ["prostate", "prostate problem", "BPH", "enlarged prostate", "urine problem"],
    urgency: "moderate",
    followUpQuestions: ["How many times do you wake up at night to urinate?"],
  },

  // ─── Neurology ────────────────────────────────────────────────────────
  {
    condition: "Herniated Disc",
    icd10: "M51.1",
    specialty: "Neurology",
    procedures: ["Herniated Disc Surgery"],
    symptoms: ["back pain", "leg numbness", "sciatica", "weakness in legs", "tingling"],
    synonyms: ["slip disc", "slipped disc", "disc problem", "back pain", "kamar dard", "spine problem"],
    urgency: "moderate",
    followUpQuestions: ["Does the pain radiate down your leg?"],
  },
  {
    condition: "Brain Tumor",
    icd10: "D43.2",
    specialty: "Neurology",
    procedures: ["Craniotomy"],
    symptoms: ["persistent headache", "seizures", "vision changes", "personality changes", "balance problems"],
    synonyms: ["brain tumor", "brain tumour", "brain surgery", "dimag mein gaanth"],
    urgency: "emergency",
    followUpQuestions: ["Have you had an MRI? What did it show?"],
  },

  // ─── Gastroenterology ─────────────────────────────────────────────────
  {
    condition: "Liver Cirrhosis",
    icd10: "K74.6",
    specialty: "Gastroenterology",
    procedures: ["Liver Transplant Evaluation"],
    symptoms: ["jaundice", "abdominal swelling", "fatigue", "easy bruising", "confusion"],
    synonyms: ["liver problem", "liver damage", "cirrhosis", "fatty liver", "liver failure", "liver transplant"],
    urgency: "high",
    followUpQuestions: ["Do you have a history of alcohol consumption or hepatitis?"],
  },
  {
    condition: "Peptic Ulcer",
    icd10: "K27.9",
    specialty: "Gastroenterology",
    procedures: ["Endoscopy"],
    symptoms: ["stomach pain", "burning in stomach", "acid reflux", "bloating", "nausea after eating"],
    synonyms: ["ulcer", "acidity", "pet mein jalan", "gastric", "stomach ulcer", "endoscopy"],
    urgency: "moderate",
    followUpQuestions: ["Does the pain improve or worsen after eating?"],
  },
];

// ── Symptom Matching Engine ─────────────────────────────────────────────

interface MatchResult {
  condition: ConditionMapping;
  score: number;          // 0-1 match confidence
  matchedTerms: string[]; // which user terms matched
}

/**
 * Fuzzy TF-IDF-like symptom matching.
 * Scores each condition by how many of the user's terms match its
 * symptoms + synonyms, weighted by term specificity (rarer terms score higher).
 */
export function matchSymptoms(userText: string): MatchResult[] {
  const normalizedInput = userText.toLowerCase().trim();
  const inputTokens = normalizedInput.split(/[\s,;.]+/).filter(t => t.length > 2);

  // Build inverse document frequency — rarer terms across conditions are more valuable
  const termDocCount: Record<string, number> = {};
  for (const cond of CONDITION_DATABASE) {
    const allTerms = new Set([
      ...cond.symptoms.flatMap(s => s.toLowerCase().split(/\s+/)),
      ...cond.synonyms.flatMap(s => s.toLowerCase().split(/\s+/)),
    ]);
    for (const term of allTerms) {
      termDocCount[term] = (termDocCount[term] || 0) + 1;
    }
  }
  const totalDocs = CONDITION_DATABASE.length;

  const results: MatchResult[] = [];

  for (const cond of CONDITION_DATABASE) {
    const allPhrases = [...cond.symptoms, ...cond.synonyms].map(s => s.toLowerCase());
    let score = 0;
    const matchedTerms: string[] = [];

    // Phase 1: Exact phrase matching (highest signal)
    for (const phrase of allPhrases) {
      if (normalizedInput.includes(phrase)) {
        const idf = Math.log(totalDocs / (termDocCount[phrase.split(/\s+/)[0]] || 1));
        score += 0.4 * Math.max(idf, 0.5);
        matchedTerms.push(phrase);
      }
    }

    // Phase 2: Individual token matching with IDF weighting
    for (const token of inputTokens) {
      for (const phrase of allPhrases) {
        if (phrase.includes(token) && !matchedTerms.includes(phrase)) {
          const idf = Math.log(totalDocs / (termDocCount[token] || 1));
          score += 0.15 * Math.max(idf, 0.3);
          matchedTerms.push(`${token} → ${phrase}`);
          break; // only count each token once per condition
        }
      }
    }

    // Phase 3: Procedure name direct match (user says "knee replacement")
    for (const proc of cond.procedures) {
      if (normalizedInput.includes(proc.toLowerCase())) {
        score += 0.8;
        matchedTerms.push(`procedure: ${proc}`);
      }
    }

    // Phase 4: Condition name direct match
    if (normalizedInput.includes(cond.condition.toLowerCase())) {
      score += 0.7;
      matchedTerms.push(`condition: ${cond.condition}`);
    }

    if (score > 0.1) {
      // Normalize score to 0-1 range
      const normalizedScore = Math.min(score / 1.5, 1.0);
      results.push({ condition: cond, score: normalizedScore, matchedTerms });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5); // top 5
}

// ── LLM Validation ──────────────────────────────────────────────────────

/**
 * Validates and enriches LLM-extracted clinical data against the local database.
 * Returns corrections if the LLM hallucinated ICD-10 codes or conditions.
 */
export function validateExtraction(extraction: {
  mapped_condition?: string;
  icd10_code?: string;
  recommended_procedure?: string;
  symptoms?: string[];
}): {
  isValid: boolean;
  correctedIcd10?: string;
  correctedCondition?: string;
  correctedProcedure?: string;
  specialty?: string;
  urgency?: string;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Try to find the condition in our database
  let matched: ConditionMapping | undefined;

  // Match by ICD-10 first (most specific)
  if (extraction.icd10_code) {
    matched = CONDITION_DATABASE.find(c =>
      c.icd10.toLowerCase() === extraction.icd10_code!.toLowerCase()
    );
    if (!matched) {
      warnings.push(`ICD-10 code "${extraction.icd10_code}" not found in local database — may be hallucinated`);
    }
  }

  // Match by condition name
  if (!matched && extraction.mapped_condition) {
    matched = CONDITION_DATABASE.find(c =>
      c.condition.toLowerCase().includes(extraction.mapped_condition!.toLowerCase()) ||
      extraction.mapped_condition!.toLowerCase().includes(c.condition.toLowerCase())
    );
  }

  // Match by symptoms as last resort
  if (!matched && extraction.symptoms && extraction.symptoms.length > 0) {
    const symptomResults = matchSymptoms(extraction.symptoms.join(" "));
    if (symptomResults.length > 0 && symptomResults[0].score > 0.3) {
      matched = symptomResults[0].condition;
      warnings.push(`Condition inferred from symptoms (confidence: ${Math.round(symptomResults[0].score * 100)}%)`);
    }
  }

  if (!matched) {
    return { isValid: false, warnings: [...warnings, "Could not validate extraction against known conditions"] };
  }

  return {
    isValid: true,
    correctedIcd10: matched.icd10,
    correctedCondition: matched.condition,
    correctedProcedure: matched.procedures[0],
    specialty: matched.specialty,
    urgency: matched.urgency,
    warnings,
  };
}

// ── ICD-10 → Specialty Lookup ───────────────────────────────────────────

export function getSpecialtyForIcd10(icd10: string): string | null {
  const match = CONDITION_DATABASE.find(c => c.icd10 === icd10);
  return match?.specialty || null;
}

export function getFollowUpQuestions(icd10: string): string[] {
  const match = CONDITION_DATABASE.find(c => c.icd10 === icd10);
  return match?.followUpQuestions || [];
}

// ── City Name Normalization ─────────────────────────────────────────────

const CITY_ALIASES: Record<string, string> = {
  "bombay": "Mumbai", "mumbai": "Mumbai",
  "delhi": "Delhi", "new delhi": "Delhi", "dilli": "Delhi",
  "bangalore": "Bangalore", "bengaluru": "Bangalore",
  "pune": "Pune", "poona": "Pune",
  "chennai": "Chennai", "madras": "Chennai",
  "hyderabad": "Hyderabad", "secunderabad": "Hyderabad",
  "nagpur": "Nagpur",
  "jaipur": "Jaipur",
  "lucknow": "Lucknow", "lakhnau": "Lucknow",
  "coimbatore": "Coimbatore", "kovai": "Coimbatore",
  "bhopal": "Bhopal",
  "raipur": "Raipur",
  "dehradun": "Dehradun",
  "kolkata": "Kolkata", "calcutta": "Kolkata",
  "ahmedabad": "Ahmedabad", "amdavad": "Ahmedabad",
  "chandigarh": "Chandigarh",
  "kochi": "Kochi", "cochin": "Kochi", "ernakulam": "Kochi",
  "visakhapatnam": "Visakhapatnam", "vizag": "Visakhapatnam",
  "patna": "Patna",
  "indore": "Indore",
  "thiruvananthapuram": "Thiruvananthapuram", "trivandrum": "Thiruvananthapuram",
  "guwahati": "Guwahati",
  "varanasi": "Varanasi", "banaras": "Varanasi", "kashi": "Varanasi",
  "surat": "Surat",
  "mangalore": "Mangalore", "mangaluru": "Mangalore",
};

export function normalizeCityName(input: string): string {
  const lower = input.toLowerCase().trim();
  return CITY_ALIASES[lower] || input.trim();
}
