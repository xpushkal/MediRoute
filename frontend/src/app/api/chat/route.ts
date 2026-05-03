import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, checkRateLimit } from "@/lib/openrouter";
import { CLINICAL_SYSTEM_PROMPT, extractClinicalJSON } from "@/lib/llm-prompts";
import { matchSymptoms, validateExtraction, normalizeCityName } from "@/lib/symptom-engine";
import { prisma } from "@/lib/prisma";

// ── LLM Response Cache (in-memory, TTL = 10 min) ───────────────────────
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCacheKey(messages: { role: string; content: string }[]): string {
  // Hash last 3 messages for cache key
  const recent = messages.slice(-3).map(m => `${m.role}:${m.content}`).join("|");
  let hash = 0;
  for (let i = 0; i < recent.length; i++) {
    const chr = recent.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `chat_${hash}`;
}

function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of responseCache) {
    if (now - entry.timestamp > CACHE_TTL_MS) responseCache.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment before trying again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    // Validate message structure
    for (const m of messages) {
      if (!m.role || !m.content || typeof m.content !== "string") {
        return NextResponse.json({ error: "Each message must have role and content" }, { status: 400 });
      }
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // ── Phase 1: Local Symptom Intelligence (instant, no LLM needed) ──
    const localMatches = matchSymptoms(lastUserMessage);
    const bestLocalMatch = localMatches.length > 0 ? localMatches[0] : null;

    // ── Phase 2: LLM Call (with caching) ────────────────────────────────
    const cacheKey = getCacheKey(messages);
    cleanCache();

    let response;
    const cached = responseCache.get(cacheKey);
    if (cached) {
      response = cached.data;
    } else {
      const llmMessages = [
        { role: "system", content: CLINICAL_SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ];

      response = await callOpenRouter(llmMessages);
      responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
    }

    let assistantMessage = (response as { choices?: { message?: { content?: string } }[] })
      ?.choices?.[0]?.message?.content || "I'm having trouble processing that. Could you rephrase?";

    // ── Phase 3: Extract + Validate Clinical Data ───────────────────────
    let clinicalData = extractClinicalJSON(assistantMessage);

    // Validate and enrich with local engine
    if (clinicalData) {
      const validation = validateExtraction({
        mapped_condition: clinicalData.mapped_condition ?? undefined,
        icd10_code: clinicalData.icd10_code ?? undefined,
        recommended_procedure: clinicalData.recommended_procedure ?? undefined,
        symptoms: clinicalData.symptoms,
      });

      if (validation.isValid) {
        // Correct any hallucinated ICD-10 codes
        if (validation.correctedIcd10 && validation.correctedIcd10 !== clinicalData.icd10_code) {
          clinicalData = {
            ...clinicalData,
            icd10_code: validation.correctedIcd10,
            mapped_condition: validation.correctedCondition || clinicalData.mapped_condition,
            recommended_procedure: validation.correctedProcedure || clinicalData.recommended_procedure,
          };
        }
      }

      // Normalize city name
      if (clinicalData.location) {
        clinicalData = {
          ...clinicalData,
          location: normalizeCityName(clinicalData.location),
        };
      }
    }

    // If LLM didn't extract but local engine has a strong match, use it
    if (!clinicalData && bestLocalMatch && bestLocalMatch.score > 0.5) {
      // Extract city from user text using local engine
      const cityMatch = lastUserMessage.match(/(?:in|near|at|from)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/);
      const city = cityMatch ? normalizeCityName(cityMatch[1]) : null;

      clinicalData = {
        symptoms: bestLocalMatch.condition.symptoms.slice(0, 3),
        age: null,
        gender: null,
        comorbidities: [],
        location: city,
        mapped_condition: bestLocalMatch.condition.condition,
        icd10_code: bestLocalMatch.condition.icd10,
        recommended_procedure: bestLocalMatch.condition.procedures[0],
        clinical_pathway: [bestLocalMatch.condition.specialty, ...bestLocalMatch.condition.procedures],
        confidence: bestLocalMatch.score * 0.85, // slightly lower than LLM
      };
    }

    // ── Phase 4: Clean display message ──────────────────────────────────
    let displayMessage = assistantMessage
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/\{[\s\S]*?"symptoms"[\s\S]*?"confidence"[\s\S]*?\}/g, "")
      .replace(/---+/g, "")
      .trim();

    // If extraction succeeded but display is empty
    if (clinicalData && (!displayMessage || displayMessage.length < 20)) {
      const condition = clinicalData.mapped_condition || "your concern";
      const location = clinicalData.location || "your area";
      displayMessage = `I've understood your concern. Let me find the best hospitals near ${location} for ${condition} with cost comparisons and estimates.`;
    }

    // ── Phase 5: Urgency alerts ─────────────────────────────────────────
    let urgencyAlert = null;
    if (bestLocalMatch && bestLocalMatch.condition.urgency === "emergency") {
      urgencyAlert = "⚠️ This may require immediate medical attention. If you are experiencing a medical emergency, please call 108 or visit the nearest emergency room immediately.";
    }

    // ── Phase 6: Log anonymous session (PRD §6.1) ───────────────────────
    if (clinicalData) {
      try {
        await prisma.userSession.create({
          data: {
            query: lastUserMessage.substring(0, 500),
            mappedIcd10: clinicalData.icd10_code,
            confidence: clinicalData.confidence,
            city: clinicalData.location,
          },
        });
      } catch (e) {
        console.warn("Session logging failed:", e);
      }
    }

    return NextResponse.json({
      message: displayMessage,
      clinicalData: clinicalData || null,
      hasExtraction: !!clinicalData,
      urgencyAlert,
      localMatchScore: bestLocalMatch?.score || 0,
      matchedConditions: localMatches.slice(0, 3).map(m => ({
        condition: m.condition.condition,
        score: Math.round(m.score * 100),
        specialty: m.condition.specialty,
      })),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    const errMsg = error instanceof Error ? error.message : "Failed to process request";
    const status = errMsg.includes("OPENROUTER_API_KEY") ? 503 : 500;

    return NextResponse.json({ error: errMsg }, { status });
  }
}
