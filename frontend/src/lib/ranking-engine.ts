// Provider Ranking Engine — 8-signal weighted scoring (PRD §4.2)

interface RankingInput {
  specializationRelevance: number; // 0-1, does provider have the needed specialty?
  procedureVolume: number;         // raw volume proxy
  maxVolume: number;               // max volume across all candidates (for normalization)
  aggregateRating: number;         // 0-5
  reviewSentiment: number;         // 0-1 (placeholder, default 0.7)
  accreditationScore: number;      // 0, 0.5, or 1 (none / NABH / NABH+JCI)
  distanceKm: number;
  maxDistanceKm: number;           // for normalization
  waitDays: number;
  hospitalTierScore: number;       // budget=1, mid=0.6, premium=0.3 (affordability)
}

interface RankingWeights {
  specializationRelevance: number;
  procedureVolume: number;
  aggregateRating: number;
  reviewSentiment: number;
  accreditation: number;
  distance: number;
  waitTime: number;
  affordability: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  specializationRelevance: 0.20,
  procedureVolume: 0.15,
  aggregateRating: 0.15,
  reviewSentiment: 0.10,
  accreditation: 0.10,
  distance: 0.10,
  waitTime: 0.05,
  affordability: 0.15,
};

export function computeRankingScore(input: RankingInput, weights = DEFAULT_WEIGHTS) {
  const scores: Record<string, number> = {};

  // 1. Specialization relevance (binary 0 or 1)
  scores.specializationRelevance = input.specializationRelevance * 100;

  // 2. Procedure volume (normalized 0-100)
  scores.procedureVolume = input.maxVolume > 0
    ? (input.procedureVolume / input.maxVolume) * 100 : 50;

  // 3. Aggregate rating (0-5 → 0-100)
  scores.aggregateRating = (input.aggregateRating / 5) * 100;

  // 4. Review sentiment (0-1 → 0-100)
  scores.reviewSentiment = input.reviewSentiment * 100;

  // 5. Accreditation (0, 0.5, 1 → 0-100)
  scores.accreditation = input.accreditationScore * 100;

  // 6. Distance (inverse — closer is better)
  scores.distance = input.maxDistanceKm > 0
    ? Math.max(0, (1 - input.distanceKm / input.maxDistanceKm)) * 100 : 50;

  // 7. Wait time (inverse — shorter is better, cap at 30 days)
  scores.waitTime = Math.max(0, (1 - input.waitDays / 30)) * 100;

  // 8. Affordability (tier-based)
  scores.affordability = input.hospitalTierScore * 100;

  // Composite
  const composite = Object.entries(weights).reduce((sum, [key, weight]) => {
    return sum + (scores[key] || 0) * weight;
  }, 0);

  return {
    composite: Math.round(composite),
    breakdown: scores,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────

export function getAccreditationScore(nabh: boolean, jci: boolean): number {
  if (nabh && jci) return 1.0;
  if (nabh) return 0.5;
  return 0;
}

export function getAffordabilityScore(tier: string): number {
  switch (tier) {
    case "BUDGET": return 1.0;
    case "MID": return 0.6;
    case "PREMIUM": return 0.3;
    default: return 0.5;
  }
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
