import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estimateCost, formatINR } from "@/lib/cost-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, procedureName, icd10Code, comorbidities = [], age = null } = body;

    if (!providerId) {
      return NextResponse.json({ error: "providerId required" }, { status: 400 });
    }

    // Find provider with city
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: { city: true, procedureCosts: { include: { procedure: true } } },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Find the procedure
    let procedure = null;
    if (icd10Code) {
      procedure = await prisma.procedure.findFirst({
        where: { icd10Code: { contains: icd10Code, mode: "insensitive" } },
      });
    }
    if (!procedure && procedureName) {
      procedure = await prisma.procedure.findFirst({
        where: { name: { contains: procedureName, mode: "insensitive" } },
      });
    }
    if (!procedure && provider.procedureCosts.length > 0) {
      procedure = provider.procedureCosts[0].procedure;
    }

    if (!procedure) {
      return NextResponse.json({ error: "No matching procedure found" }, { status: 404 });
    }

    // Tier multiplier
    const tierMap: Record<string, number> = { BUDGET: 0.6, MID: 1.0, PREMIUM: 1.6 };
    const tierMult = tierMap[provider.tier] || 1.0;

    const result = estimateCost({
      baseCostMin: procedure.baseCostMin,
      baseCostMax: procedure.baseCostMax,
      surgeonFeePercent: procedure.surgeonFeePercent,
      anaesthesiaPercent: procedure.anaesthesiaPercent,
      diagnosticsPercent: procedure.diagnosticsPercent,
      medicationPercent: procedure.medicationPercent,
      stayPerDayMin: procedure.stayPerDayMin,
      stayPerDayMax: procedure.stayPerDayMax,
      expectedStayDays: procedure.expectedStayDays,
      cityPricingFactor: provider.city.pricingFactor,
      hospitalTierMultiplier: tierMult,
      patientAge: age,
      comorbidities,
    });

    return NextResponse.json({
      provider: { id: provider.id, name: provider.name, tier: provider.tier, city: provider.city.name },
      procedure: { name: procedure.name, icd10: procedure.icd10Code, category: procedure.category },
      estimate: {
        totalRange: `${formatINR(result.totalMin)} – ${formatINR(result.totalMax)}`,
        totalMin: result.totalMin,
        totalMax: result.totalMax,
        confidence: result.confidence,
        components: result.components.map((c) => ({
          label: c.label,
          range: `${formatINR(c.min)} – ${formatINR(c.max)}`,
          min: c.min,
          max: c.max,
        })),
        adjustments: result.adjustments,
        riskFlags: result.riskFlags,
      },
      disclaimer: "This is an estimate for informational purposes only. Not a medical diagnosis. Actual costs may vary.",
    });
  } catch (error) {
    console.error("Cost estimate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
