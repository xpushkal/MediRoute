import { NextRequest, NextResponse } from "next/server";

// Demo API key for hackathon — in production this would be per-partner
const DEMO_API_KEY = process.env.LENDER_API_KEY || "medi-lender-demo-key-2025";

export async function POST(req: NextRequest) {
  try {
    // Check API key (accept demo key if env not set)
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== DEMO_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized. Provide a valid x-api-key header." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, phone, estimatedAmount, costEstimate } = body;

    if (!name || !phone || !estimatedAmount) {
      return NextResponse.json(
        { error: "name, phone, estimatedAmount are required" },
        { status: 400 }
      );
    }

    // Mock pre-qualification logic
    const amount = Number(estimatedAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "estimatedAmount must be a positive number" },
        { status: 400 }
      );
    }

    const approved = amount <= 500000; // auto-approve under 5 lakh
    const maxApproved = approved ? Math.min(amount * 1.2, 600000) : 0;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 500));

    if (approved) {
      return NextResponse.json({
        status: "PRE_QUALIFIED",
        preQualifiedAmount: maxApproved,
        interestRate: "10.5% p.a.",
        tenure: "12-36 months",
        partner: "MediFinance NBFC (Mock)",
        message: `You are pre-qualified for up to ₹${maxApproved.toLocaleString("en-IN")} with our partner NBFC.`,
        nextStep: "PROCEED_APPLICATION",
        costEstimateRef: costEstimate?.totalRange || null,
        disclaimer: "Pre-qualification is not a guarantee of loan approval. Final approval subject to documentation and credit check.",
      });
    }

    return NextResponse.json({
      status: "MANUAL_REVIEW",
      message: "We need additional details for this amount. A representative will contact you within 24 hours.",
      nextStep: "CALLBACK_REQUESTED",
      disclaimer: "Pre-qualification is not a guarantee of loan approval.",
    });
  } catch (error) {
    console.error("Lender API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
