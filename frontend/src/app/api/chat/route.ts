import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";
import { CLINICAL_SYSTEM_PROMPT, extractClinicalJSON } from "@/lib/llm-prompts";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
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

    return NextResponse.json({
      message: displayMessage,
      clinicalData: clinicalData || null,
      hasExtraction: !!clinicalData,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
