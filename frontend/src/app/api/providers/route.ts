import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeRankingScore,
  getAccreditationScore,
  getAffordabilityScore,
  haversineDistance,
} from "@/lib/ranking-engine";

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const city = params.get("city");
    const condition = params.get("condition"); // ICD-10 or procedure name
    const maxDistance = Number(params.get("maxDistance") || 50);
    const tiers = params.getAll("tier"); // BUDGET, MID, PREMIUM
    const accreditation = params.getAll("accreditation"); // NABH, JCI

    if (!city) {
      return NextResponse.json({ error: "city parameter required" }, { status: 400 });
    }

    // Find the city
    const cityRecord = await prisma.city.findFirst({
      where: { name: { contains: city, mode: "insensitive" } },
    });

    if (!cityRecord) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // Build provider query
    const whereClause: Record<string, unknown> = { cityId: cityRecord.id };
    if (tiers.length > 0) {
      whereClause.tier = { in: tiers };
    }
    if (accreditation.includes("NABH")) whereClause.nabh = true;
    if (accreditation.includes("JCI")) whereClause.jci = true;

    const providers = await prisma.provider.findMany({
      where: whereClause,
      include: {
        specializations: { include: { specialty: true } },
        procedureCosts: { include: { procedure: true } },
      },
    });

    // Find matching procedure if condition specified
    let targetProcedure = null;
    if (condition) {
      targetProcedure = await prisma.procedure.findFirst({
        where: {
          OR: [
            { icd10Code: { contains: condition, mode: "insensitive" } },
            { name: { contains: condition, mode: "insensitive" } },
            { category: { contains: condition, mode: "insensitive" } },
          ],
        },
        include: { specialty: true },
      });
    }

    // Compute distances and find max for normalization
    const providersWithDistance = providers.map((p) => ({
      ...p,
      distance: haversineDistance(cityRecord.latitude, cityRecord.longitude, p.latitude, p.longitude),
    })).filter((p) => p.distance <= maxDistance);

    const maxDist = Math.max(...providersWithDistance.map((p) => p.distance), 1);
    const maxVolume = Math.max(
      ...providersWithDistance.flatMap((p) => p.specializations.map((s) => s.volumeProxy)),
      1
    );

    // Rank
    const ranked = providersWithDistance.map((p) => {
      const hasSpecialty = targetProcedure
        ? p.specializations.some((s) => s.specialtyId === targetProcedure.specialtyId) ? 1 : 0
        : 0.5;

      const volume = targetProcedure
        ? p.specializations.find((s) => s.specialtyId === targetProcedure.specialtyId)?.volumeProxy || 0
        : Math.max(...p.specializations.map((s) => s.volumeProxy), 0);

      const { composite, breakdown } = computeRankingScore({
        specializationRelevance: hasSpecialty,
        procedureVolume: volume,
        maxVolume,
        aggregateRating: p.rating,
        reviewSentiment: 0.7,
        accreditationScore: getAccreditationScore(p.nabh, p.jci),
        distanceKm: p.distance,
        maxDistanceKm: maxDist,
        waitDays: p.procedureCosts[0]?.waitDays || 7,
        hospitalTierScore: getAffordabilityScore(p.tier),
      });

      // Find cost for the target procedure
      const costEntry = targetProcedure
        ? p.procedureCosts.find((c) => c.procedureId === targetProcedure.id)
        : p.procedureCosts[0];

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        distance: Math.round(p.distance * 10) / 10,
        tier: p.tier,
        nabh: p.nabh,
        jci: p.jci,
        rating: p.rating,
        reviewCount: p.reviewCount,
        rankingScore: composite,
        scoreBreakdown: breakdown,
        costMin: costEntry?.costMin || 0,
        costMax: costEntry?.costMax || 0,
        costEstimate: costEntry
          ? `₹${(costEntry.costMin / 100000).toFixed(1)}L – ₹${(costEntry.costMax / 100000).toFixed(1)}L`
          : "N/A",
        waitDays: costEntry?.waitDays || 7,
        strengths: p.strengths,
      };
    });

    ranked.sort((a, b) => b.rankingScore - a.rankingScore);

    return NextResponse.json({
      city: cityRecord.name,
      condition: targetProcedure?.name || condition || "General",
      providers: ranked,
      count: ranked.length,
    });
  } catch (error) {
    console.error("Provider search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
