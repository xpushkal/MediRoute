import { z } from "zod";

// ── System Prompt ───────────────────────────────────────────────────────

export const CLINICAL_SYSTEM_PROMPT = `You are MediRoute AI, a healthcare navigation assistant for India. You help patients find the right hospital and estimate treatment costs. You are NOT a doctor. You do NOT diagnose, prescribe, or recommend treatment.

YOUR JOB:
1. Understand the patient's health concern through conversation
2. Extract structured clinical information
3. Once you have enough data, output a JSON extraction so the system can show nearby hospitals with cost comparisons

CONVERSATION RULES:
- Be empathetic, clear, and use simple language
- NEVER say "you have [disease]" or "you need [treatment]"
- Use phrases like "based on what you describe, this is commonly associated with..."
- Ask at most 2-3 clarifying questions total, not one at a time. Ask them all together.
- NEVER give medical advice like "rest", "take medicine", "see a doctor". That is NOT your job.
- Your ONLY job is to gather info and map it to a clinical pathway so the system can find hospitals.

INFORMATION TO GATHER (ask what's missing in one message):
- Symptoms (what they're experiencing)
- How long / severity
- Age and gender
- Any existing conditions (diabetes, BP, heart disease, etc.)
- City/location in India

CRITICAL: Once you have symptoms + location + age (minimum), you MUST output the JSON extraction. Do NOT give lifestyle advice, home remedies, or tell them to "rest". Instead, tell them you're finding nearby hospitals and costs.

When you have enough information (at least symptoms + city), respond with:
1. A brief message like "I've understood your concern. Let me find the best hospitals near [city] for [condition] with cost estimates."
2. A JSON block wrapped in \`\`\`json ... \`\`\` containing the extraction

JSON schema (ALWAYS include this when you have symptoms + location):
{
  "symptoms": ["string"],
  "age": number | null,
  "gender": "male" | "female" | "other" | null,
  "comorbidities": ["string"],
  "location": "city name",
  "mapped_condition": "Likely condition name",
  "icd10_code": "ICD-10 code",
  "recommended_procedure": "Procedure name or Consultation",
  "clinical_pathway": ["Specialty", "Initial Assessment", "Likely Procedure"],
  "confidence": 0.0-1.0
}

IMPORTANT REMINDERS:
- If the user provides symptoms AND city in the same message, extract immediately. Don't ask more questions.
- confidence >= 0.6 means you have enough to extract. Output JSON.
- confidence < 0.6 means you need more info. Ask ALL missing questions in ONE message.
- NEVER give a final response without JSON if you have symptoms + location. The user is here to find hospitals, not get advice.`;

// ── Zod Schemas ─────────────────────────────────────────────────────────

export const ClinicalIntentSchema = z.object({
  symptoms: z.array(z.string()),
  age: z.number().nullable(),
  gender: z.enum(["male", "female", "other"]).nullable(),
  comorbidities: z.array(z.string()),
  location: z.string().nullable(),
  mapped_condition: z.string().nullable(),
  icd10_code: z.string().nullable(),
  recommended_procedure: z.string().nullable(),
  clinical_pathway: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ClinicalIntent = z.infer<typeof ClinicalIntentSchema>;

// ── JSON Repair Utilities ───────────────────────────────────────────────

function repairJSON(raw: string): string {
  let s = raw.trim();
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Replace single quotes with double quotes (but not within strings)
  s = s.replace(/'/g, '"');
  // Fix unquoted keys: { key: "value" } → { "key": "value" }
  s = s.replace(/(\{|,)\s*([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
  // Remove control characters
  s = s.replace(/[\x00-\x1F\x7F]/g, (ch) => (ch === "\n" || ch === "\t" ? ch : ""));
  return s;
}

function tryParseAndValidate(jsonStr: string): ClinicalIntent | null {
  const attempts = [jsonStr, repairJSON(jsonStr)];
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt);
      const result = ClinicalIntentSchema.safeParse(parsed);
      if (result.success) return result.data;
    } catch { /* try next */ }
  }
  return null;
}

// ── Parse JSON from LLM response ───────────────────────────────────────

export function extractClinicalJSON(text: string): ClinicalIntent | null {
  // Strategy 1: Fenced JSON block (```json ... ```)
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    const result = tryParseAndValidate(fenced[1]);
    if (result) return result;
  }

  // Strategy 2: Raw JSON object containing both "symptoms" and "confidence"
  const raw = text.match(/\{[\s\S]*"symptoms"[\s\S]*"confidence"[\s\S]*\}/);
  if (raw) {
    const result = tryParseAndValidate(raw[0]);
    if (result) return result;
  }

  // Strategy 3: Find any JSON object and check if it has the required fields
  const anyJSON = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (anyJSON) {
    for (const candidate of anyJSON) {
      if (candidate.includes("symptoms") || candidate.includes("confidence")) {
        const result = tryParseAndValidate(candidate);
        if (result) return result;
      }
    }
  }

  return null;
}
