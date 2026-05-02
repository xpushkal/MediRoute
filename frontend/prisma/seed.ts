import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function query(sql: string, params: unknown[] = []) {
  const res = await pool.query(sql, params);
  return res.rows;
}

async function main() {
  console.log("Seeding MediRoute database...");

  // Clean existing data
  await query("DELETE FROM \"ProcedureCost\"");
  await query("DELETE FROM \"ProviderSpecialization\"");
  await query("DELETE FROM \"Procedure\"");
  await query("DELETE FROM \"Provider\"");
  await query("DELETE FROM \"Specialty\"");
  await query("DELETE FROM \"City\"");
  await query("DELETE FROM \"UserSession\"");

  // ── Cities ──────────────────────────────────────────────────────────
  const citiesData = [
    ["Mumbai", "Maharashtra", "METRO", 19.076, 72.8777, 1.3],
    ["Delhi", "Delhi", "METRO", 28.6139, 77.209, 1.3],
    ["Bangalore", "Karnataka", "METRO", 12.9716, 77.5946, 1.2],
    ["Pune", "Maharashtra", "METRO", 18.5204, 73.8567, 1.1],
    ["Chennai", "Tamil Nadu", "METRO", 13.0827, 80.2707, 1.2],
    ["Hyderabad", "Telangana", "METRO", 17.385, 78.4867, 1.15],
    ["Nagpur", "Maharashtra", "TIER_2", 21.1458, 79.0882, 0.9],
    ["Jaipur", "Rajasthan", "TIER_2", 26.9124, 75.7873, 0.9],
    ["Lucknow", "Uttar Pradesh", "TIER_2", 26.8467, 80.9462, 0.85],
    ["Coimbatore", "Tamil Nadu", "TIER_2", 11.0168, 76.9558, 0.85],
    ["Bhopal", "Madhya Pradesh", "TIER_2", 23.2599, 77.4126, 0.8],
    ["Raipur", "Chhattisgarh", "TIER_3", 21.2514, 81.6296, 0.7],
    ["Dehradun", "Uttarakhand", "TIER_3", 30.3165, 78.0322, 0.7],
  ] as const;

  const cityMap: Record<string, string> = {};
  for (const [name, state, tier, lat, lng, pf] of citiesData) {
    const rows = await query(
      `INSERT INTO "City" (id, name, state, tier, latitude, longitude, "pricingFactor") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, state, tier, lat, lng, pf]
    );
    cityMap[name] = rows[0].id;
  }
  console.log(`  ✓ ${Object.keys(cityMap).length} cities`);

  // ── Specialties ──────────────────────────────────────────────────────
  const specNames = ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Gastroenterology", "Ophthalmology", "General Surgery", "Urology"];
  const specMap: Record<string, string> = {};
  for (const name of specNames) {
    const rows = await query(`INSERT INTO "Specialty" (id, name) VALUES (gen_random_uuid(), $1) RETURNING id`, [name]);
    specMap[name] = rows[0].id;
  }
  console.log(`  ✓ ${specNames.length} specialties`);

  // ── Procedures ───────────────────────────────────────────────────────
  const proceduresData = [
    { name: "Angioplasty", icd10: "I25.1", cat: "Cardiac", spec: "Cardiology", minC: 150000, maxC: 350000, sfp: 0.18, days: 4, sMin: 4000, sMax: 12000 },
    { name: "Coronary Artery Bypass Graft", icd10: "I25.10", cat: "Cardiac", spec: "Cardiology", minC: 250000, maxC: 600000, sfp: 0.20, days: 7, sMin: 5000, sMax: 15000 },
    { name: "Knee Replacement", icd10: "M17.1", cat: "Orthopaedic", spec: "Orthopaedics", minC: 180000, maxC: 400000, sfp: 0.15, days: 5, sMin: 3000, sMax: 10000 },
    { name: "Hip Replacement", icd10: "M16.1", cat: "Orthopaedic", spec: "Orthopaedics", minC: 200000, maxC: 450000, sfp: 0.16, days: 6, sMin: 3500, sMax: 11000 },
    { name: "Cataract Surgery", icd10: "H25.1", cat: "Ophthalmic", spec: "Ophthalmology", minC: 25000, maxC: 90000, sfp: 0.20, days: 1, sMin: 2000, sMax: 5000 },
    { name: "Appendectomy", icd10: "K35.8", cat: "General", spec: "General Surgery", minC: 40000, maxC: 120000, sfp: 0.15, days: 2, sMin: 2500, sMax: 7000 },
    { name: "Cholecystectomy", icd10: "K80.2", cat: "General", spec: "General Surgery", minC: 60000, maxC: 180000, sfp: 0.14, days: 2, sMin: 3000, sMax: 8000 },
    { name: "Chemotherapy Cycle", icd10: "C80.1", cat: "Oncology", spec: "Oncology", minC: 15000, maxC: 80000, sfp: 0.05, days: 1, sMin: 3000, sMax: 10000 },
    { name: "Kidney Stone Removal", icd10: "N20.0", cat: "Urology", spec: "Urology", minC: 50000, maxC: 150000, sfp: 0.15, days: 2, sMin: 3000, sMax: 8000 },
    { name: "Herniated Disc Surgery", icd10: "M51.1", cat: "Neurology", spec: "Neurology", minC: 150000, maxC: 400000, sfp: 0.20, days: 4, sMin: 4000, sMax: 12000 },
  ];

  interface ProcRecord { id: string; name: string; specId: string; baseCostMin: number; baseCostMax: number; }
  const procedures: ProcRecord[] = [];
  for (const p of proceduresData) {
    const rows = await query(
      `INSERT INTO "Procedure" (id, name, "icd10Code", category, "specialtyId", "baseCostMin", "baseCostMax", "surgeonFeePercent", "expectedStayDays", "stayPerDayMin", "stayPerDayMax")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [p.name, p.icd10, p.cat, specMap[p.spec], p.minC, p.maxC, p.sfp, p.days, p.sMin, p.sMax]
    );
    procedures.push({ id: rows[0].id, name: p.name, specId: specMap[p.spec], baseCostMin: p.minC, baseCostMax: p.maxC });
  }
  console.log(`  ✓ ${procedures.length} procedures`);

  // ── Providers ────────────────────────────────────────────────────────
  const providerData = [
    { name: "Apollo Hospitals", city: "Pune", tier: "PREMIUM", nabh: true, jci: true, beds: 350, rating: 4.5, reviews: 2800, lat: 18.5308, lng: 73.8475, addr: "154/11, Bannerghatta Rd, Pune", strengths: ["JCI Accredited", "Premium Care", "Multi-Specialty"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "General Surgery"] },
    { name: "Ruby Hall Clinic", city: "Pune", tier: "PREMIUM", nabh: true, jci: false, beds: 550, rating: 4.3, reviews: 3200, lat: 18.5362, lng: 73.8926, addr: "40, Sassoon Rd, Pune", strengths: ["High Cardiac Volume", "NABH Accredited", "24x7 Emergency"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Neurology"] },
    { name: "Sahyadri Hospitals", city: "Pune", tier: "MID", nabh: true, jci: false, beds: 280, rating: 4.1, reviews: 1500, lat: 18.5074, lng: 73.8077, addr: "Plot 30, Karve Rd, Pune", strengths: ["NABH Accredited", "Affordable", "Good Nursing"], specs: ["Cardiology", "Orthopaedics", "Ophthalmology", "Urology"] },
    { name: "Deenanath Mangeshkar Hospital", city: "Pune", tier: "MID", nabh: true, jci: false, beds: 200, rating: 4.2, reviews: 1800, lat: 18.4973, lng: 73.8164, addr: "Erandwane, Pune", strengths: ["NABH Accredited", "Research Hospital"], specs: ["Cardiology", "Oncology", "Gastroenterology", "Neurology"] },
    { name: "Aditya Birla Hospital", city: "Pune", tier: "PREMIUM", nabh: true, jci: false, beds: 500, rating: 4.4, reviews: 2100, lat: 18.6298, lng: 73.7997, addr: "Chinchwad, Pune", strengths: ["Premium Care", "NABH Accredited", "Large Capacity"], specs: ["Cardiology", "Orthopaedics", "Urology", "General Surgery"] },
    { name: "City Care Hospital", city: "Pune", tier: "BUDGET", nabh: false, jci: false, beds: 80, rating: 3.8, reviews: 600, lat: 18.5113, lng: 73.8413, addr: "MG Rd, Camp, Pune", strengths: ["Budget-Friendly", "Available Next Day"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology"] },
    { name: "Lilavati Hospital", city: "Mumbai", tier: "PREMIUM", nabh: true, jci: true, beds: 300, rating: 4.6, reviews: 4100, lat: 19.0509, lng: 72.8294, addr: "A-791, Bandra Reclamation, Mumbai", strengths: ["JCI Accredited", "Top Specialists", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Oncology"] },
    { name: "Hinduja Hospital", city: "Mumbai", tier: "PREMIUM", nabh: true, jci: false, beds: 400, rating: 4.4, reviews: 3500, lat: 19.0389, lng: 72.8442, addr: "Veer Savarkar Marg, Mumbai", strengths: ["NABH Accredited", "Research Hub", "High Volume"], specs: ["Cardiology", "Gastroenterology", "Urology", "General Surgery"] },
    { name: "Wockhardt Hospital", city: "Nagpur", tier: "MID", nabh: true, jci: false, beds: 180, rating: 4.0, reviews: 900, lat: 21.1458, lng: 79.0782, addr: "Shankar Nagar, Nagpur", strengths: ["NABH Accredited", "Cardiac Specialty"], specs: ["Cardiology", "Orthopaedics", "General Surgery"] },
    { name: "KIMS Hospital", city: "Nagpur", tier: "BUDGET", nabh: false, jci: false, beds: 100, rating: 3.7, reviews: 450, lat: 21.155, lng: 79.095, addr: "Central Bazaar Rd, Nagpur", strengths: ["Budget-Friendly", "Accessible Location"], specs: ["General Surgery", "Ophthalmology", "Orthopaedics"] },
    { name: "AIIMS Delhi", city: "Delhi", tier: "MID", nabh: true, jci: false, beds: 2500, rating: 4.2, reviews: 8000, lat: 28.5672, lng: 77.21, addr: "Ansari Nagar, New Delhi", strengths: ["Government Excellence", "Research Leader", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Ophthalmology", "Urology", "General Surgery", "Gastroenterology"] },
    { name: "Fortis Escorts", city: "Delhi", tier: "PREMIUM", nabh: true, jci: true, beds: 310, rating: 4.5, reviews: 3800, lat: 28.5545, lng: 77.227, addr: "Okhla Rd, New Delhi", strengths: ["JCI Accredited", "Heart Institute", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology"] },
    { name: "Narayana Health", city: "Bangalore", tier: "MID", nabh: true, jci: false, beds: 600, rating: 4.3, reviews: 2600, lat: 12.8889, lng: 77.5977, addr: "258/A, Bommasandra, Bangalore", strengths: ["High Volume", "Affordable Premium", "NABH Accredited"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Urology"] },
    { name: "SMS Hospital", city: "Jaipur", tier: "BUDGET", nabh: false, jci: false, beds: 1400, rating: 3.5, reviews: 2200, lat: 26.8941, lng: 75.8063, addr: "JLN Marg, Jaipur", strengths: ["Government Hospital", "Large Capacity", "Budget-Friendly"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology", "Cardiology"] },
    { name: "GKNM Hospital", city: "Coimbatore", tier: "MID", nabh: true, jci: false, beds: 400, rating: 4.1, reviews: 1800, lat: 11.0168, lng: 76.965, addr: "Pappanaickenpalayam, Coimbatore", strengths: ["NABH Accredited", "Cancer Centre", "Affordable"], specs: ["Cardiology", "Oncology", "Orthopaedics", "General Surgery"] },
  ];

  for (const p of providerData) {
    const rows = await query(
      `INSERT INTO "Provider" (id, name, type, tier, nabh, jci, "bedCount", rating, "reviewCount", latitude, longitude, address, "cityId", strengths)
       VALUES (gen_random_uuid(), $1, 'HOSPITAL', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [p.name, p.tier, p.nabh, p.jci, p.beds, p.rating, p.reviews, p.lat, p.lng, p.addr, cityMap[p.city], p.strengths]
    );
    const providerId = rows[0].id;

    // Specializations
    for (const specName of p.specs) {
      if (specMap[specName]) {
        await query(
          `INSERT INTO "ProviderSpecialization" (id, "providerId", "specialtyId", "volumeProxy") VALUES (gen_random_uuid(), $1, $2, $3)`,
          [providerId, specMap[specName], Math.floor(Math.random() * 500) + 50]
        );
      }
    }

    // Procedure costs
    for (const proc of procedures) {
      if (p.specs.some(s => specMap[s] === proc.specId)) {
        const tierMult = p.tier === "PREMIUM" ? 1.6 : p.tier === "MID" ? 1.0 : 0.6;
        await query(
          `INSERT INTO "ProcedureCost" (id, "providerId", "procedureId", "costMin", "costMax", "waitDays") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
          [providerId, proc.id, Math.round(proc.baseCostMin * tierMult), Math.round(proc.baseCostMax * tierMult), p.tier === "BUDGET" ? 1 : p.tier === "MID" ? 5 : 10]
        );
      }
    }
  }
  console.log(`  ✓ ${providerData.length} providers with specializations and procedure costs`);

  console.log("Seed complete!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => pool.end());
