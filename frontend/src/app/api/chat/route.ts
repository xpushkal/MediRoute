import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, checkRateLimit } from "@/lib/openrouter";
import { CLINICAL_SYSTEM_PROMPT, extractClinicalJSON } from "@/lib/llm-prompts";
import { prisma } from "@/lib/prisma";

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

    // Build conversation with system prompt
    const llmMessages = [
      { role: "system", content: CLINICAL_SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await callOpenRouter(llmMessages);
    let assistantMessage = response.choices?.[0]?.message?.content || "I'm having trouble processing that. Could you rephrase?";

    // Try to extract structured clinical data
    const clinicalData = extractClinicalJSON(assistantMessage);

    // Clean the message for display:
    // 1. Remove JSON blocks
    // 2. Remove <think>...</think> blocks (some models output these)
    // 3. Remove markdown artifacts
    let displayMessage = assistantMessage
      .replace(/```json[\s\S]*?```/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .replace(/\{[\s\S]*?"symptoms"[\s\S]*?"confidence"[\s\S]*?\}/g, "")
      .replace(/---+/g, "")
      .trim();

    // If extraction succeeded but display message is empty/too short, provide a transition message
    if (clinicalData && (!displayMessage || displayMessage.length < 20)) {
      const condition = clinicalData.mapped_condition || "your concern";
      const location = clinicalData.location || "your area";
      displayMessage = `I've understood your concern. Let me find the best hospitals near ${location} for ${condition} with cost comparisons and estimates.`;
    }

    // Log anonymous session if clinical data was extracted (PRD §6.1)
    if (clinicalData) {
      try {
        await prisma.userSession.create({
          data: {
            query: messages[messages.length - 1]?.content?.substring(0, 500) || "",
            mappedIcd10: clinicalData.icd10_code,
            confidence: clinicalData.confidence,
            city: clinicalData.location,
          },
        });
      } catch (e) {
        // Non-critical — don't fail the request if session logging fails
        console.warn("Session logging failed:", e);
      }
    }

    return NextResponse.json({
      message: displayMessage,
      clinicalData: clinicalData || null,
      hasExtraction: !!clinicalData,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Return helpful error for missing API key
    const errMsg = error instanceof Error ? error.message : "Failed to process request";
    const status = errMsg.includes("OPENROUTER_API_KEY") ? 503 : 500;

    return NextResponse.json(
      { error: errMsg },
      { status }
    );
  }
}
