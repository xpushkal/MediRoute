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
  await query('DELETE FROM "ProcedureCost"');
  await query('DELETE FROM "ProviderSpecialization"');
  await query('DELETE FROM "Procedure"');
  await query('DELETE FROM "Provider"');
  await query('DELETE FROM "Specialty"');
  await query('DELETE FROM "City"');
  await query('DELETE FROM "UserSession"');

  // ── Cities (25 across India) ─────────────────────────────────────────
  const citiesData = [
    ["Mumbai", "Maharashtra", "METRO", 19.076, 72.8777, 1.3],
    ["Delhi", "Delhi", "METRO", 28.6139, 77.209, 1.3],
    ["Bangalore", "Karnataka", "METRO", 12.9716, 77.5946, 1.2],
    ["Pune", "Maharashtra", "METRO", 18.5204, 73.8567, 1.1],
    ["Chennai", "Tamil Nadu", "METRO", 13.0827, 80.2707, 1.2],
    ["Hyderabad", "Telangana", "METRO", 17.385, 78.4867, 1.15],
    ["Kolkata", "West Bengal", "METRO", 22.5726, 88.3639, 1.1],
    ["Ahmedabad", "Gujarat", "METRO", 23.0225, 72.5714, 1.05],
    ["Nagpur", "Maharashtra", "TIER_2", 21.1458, 79.0882, 0.9],
    ["Jaipur", "Rajasthan", "TIER_2", 26.9124, 75.7873, 0.9],
    ["Lucknow", "Uttar Pradesh", "TIER_2", 26.8467, 80.9462, 0.85],
    ["Coimbatore", "Tamil Nadu", "TIER_2", 11.0168, 76.9558, 0.85],
    ["Bhopal", "Madhya Pradesh", "TIER_2", 23.2599, 77.4126, 0.8],
    ["Chandigarh", "Punjab", "TIER_2", 30.7333, 76.7794, 0.95],
    ["Kochi", "Kerala", "TIER_2", 9.9312, 76.2673, 0.9],
    ["Visakhapatnam", "Andhra Pradesh", "TIER_2", 17.6868, 83.2185, 0.85],
    ["Patna", "Bihar", "TIER_2", 25.6093, 85.1376, 0.8],
    ["Indore", "Madhya Pradesh", "TIER_2", 22.7196, 75.8577, 0.8],
    ["Thiruvananthapuram", "Kerala", "TIER_2", 8.5241, 76.9366, 0.85],
    ["Guwahati", "Assam", "TIER_2", 26.1445, 91.7362, 0.8],
    ["Varanasi", "Uttar Pradesh", "TIER_2", 25.3176, 82.9739, 0.75],
    ["Surat", "Gujarat", "TIER_2", 21.1702, 72.8311, 0.85],
    ["Mangalore", "Karnataka", "TIER_2", 12.9141, 74.856, 0.8],
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

  // ── Procedures (with descriptions) ──────────────────────────────────
  const proceduresData = [
    { name: "Angioplasty", icd10: "I25.1", cat: "Cardiac", spec: "Cardiology", desc: "Minimally invasive procedure to open blocked coronary arteries using a balloon catheter and stent placement.", minC: 150000, maxC: 350000, sfp: 0.18, days: 4, sMin: 4000, sMax: 12000 },
    { name: "Coronary Artery Bypass Graft", icd10: "I25.10", cat: "Cardiac", spec: "Cardiology", desc: "Open-heart surgery to create new pathways for blood flow around blocked coronary arteries using grafted vessels.", minC: 250000, maxC: 600000, sfp: 0.20, days: 7, sMin: 5000, sMax: 15000 },
    { name: "Knee Replacement", icd10: "M17.1", cat: "Orthopaedic", spec: "Orthopaedics", desc: "Surgical replacement of damaged knee joint surfaces with prosthetic implants to restore mobility and reduce pain.", minC: 180000, maxC: 400000, sfp: 0.15, days: 5, sMin: 3000, sMax: 10000 },
    { name: "Hip Replacement", icd10: "M16.1", cat: "Orthopaedic", spec: "Orthopaedics", desc: "Total or partial replacement of the hip joint with artificial components to alleviate arthritis or fracture damage.", minC: 200000, maxC: 450000, sfp: 0.16, days: 6, sMin: 3500, sMax: 11000 },
    { name: "Cataract Surgery", icd10: "H25.1", cat: "Ophthalmic", spec: "Ophthalmology", desc: "Removal of the clouded natural lens and implantation of an intraocular lens (IOL) to restore vision clarity.", minC: 25000, maxC: 90000, sfp: 0.20, days: 1, sMin: 2000, sMax: 5000 },
    { name: "Appendectomy", icd10: "K35.8", cat: "General", spec: "General Surgery", desc: "Surgical removal of the appendix, typically performed as an emergency procedure for acute appendicitis.", minC: 40000, maxC: 120000, sfp: 0.15, days: 2, sMin: 2500, sMax: 7000 },
    { name: "Cholecystectomy", icd10: "K80.2", cat: "General", spec: "General Surgery", desc: "Laparoscopic or open removal of the gallbladder, usually due to gallstones causing pain or inflammation.", minC: 60000, maxC: 180000, sfp: 0.14, days: 2, sMin: 3000, sMax: 8000 },
    { name: "Chemotherapy Cycle", icd10: "C80.1", cat: "Oncology", spec: "Oncology", desc: "One cycle of anti-cancer drug administration, including pre-medications, infusion, and monitoring for adverse reactions.", minC: 15000, maxC: 80000, sfp: 0.05, days: 1, sMin: 3000, sMax: 10000 },
    { name: "Kidney Stone Removal", icd10: "N20.0", cat: "Urology", spec: "Urology", desc: "Lithotripsy or ureteroscopic removal of renal calculi causing obstruction or pain in the urinary tract.", minC: 50000, maxC: 150000, sfp: 0.15, days: 2, sMin: 3000, sMax: 8000 },
    { name: "Herniated Disc Surgery", icd10: "M51.1", cat: "Neurology", spec: "Neurology", desc: "Microdiscectomy or laminectomy to relieve nerve compression caused by a prolapsed intervertebral disc.", minC: 150000, maxC: 400000, sfp: 0.20, days: 4, sMin: 4000, sMax: 12000 },
    { name: "Hernia Repair Surgery", icd10: "K40.9", cat: "General", spec: "General Surgery", desc: "Laparoscopic or open mesh repair of inguinal, umbilical, or incisional hernia.", minC: 45000, maxC: 150000, sfp: 0.14, days: 2, sMin: 2500, sMax: 7000 },
    { name: "TURP Surgery", icd10: "N40.0", cat: "Urology", spec: "Urology", desc: "Transurethral resection of the prostate for benign prostatic hyperplasia (BPH) causing urinary obstruction.", minC: 60000, maxC: 180000, sfp: 0.15, days: 3, sMin: 3000, sMax: 8000 },
    { name: "Valve Replacement Surgery", icd10: "I35.0", cat: "Cardiac", spec: "Cardiology", desc: "Open-heart surgical replacement of damaged aortic or mitral valve with mechanical or biological prosthesis.", minC: 350000, maxC: 800000, sfp: 0.22, days: 8, sMin: 6000, sMax: 18000 },
    { name: "Glaucoma Surgery", icd10: "H40.1", cat: "Ophthalmic", spec: "Ophthalmology", desc: "Trabeculectomy or tube shunt implantation to reduce intraocular pressure and prevent optic nerve damage.", minC: 30000, maxC: 100000, sfp: 0.18, days: 1, sMin: 2000, sMax: 5000 },
    { name: "Fracture Fixation Surgery", icd10: "S72.0", cat: "Orthopaedic", spec: "Orthopaedics", desc: "Internal fixation of bone fractures using plates, screws, nails, or rods to stabilize and promote healing.", minC: 50000, maxC: 200000, sfp: 0.15, days: 4, sMin: 3000, sMax: 9000 },
  ];

  interface ProcRecord { id: string; name: string; specId: string; baseCostMin: number; baseCostMax: number; }
  const procedures: ProcRecord[] = [];
  for (const p of proceduresData) {
    const rows = await query(
      `INSERT INTO "Procedure" (id, name, "icd10Code", category, description, "specialtyId", "baseCostMin", "baseCostMax", "surgeonFeePercent", "expectedStayDays", "stayPerDayMin", "stayPerDayMax")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [p.name, p.icd10, p.cat, p.desc, specMap[p.spec], p.minC, p.maxC, p.sfp, p.days, p.sMin, p.sMax]
    );
    procedures.push({ id: rows[0].id, name: p.name, specId: specMap[p.spec], baseCostMin: p.minC, baseCostMax: p.maxC });
  }
  console.log(`  ✓ ${procedures.length} procedures`);

  // ── Providers ────────────────────────────────────────────────────────
  const providerData = [
    // Pune (6 providers)
    { name: "Apollo Hospitals", city: "Pune", tier: "PREMIUM", nabh: true, jci: true, beds: 350, rating: 4.5, reviews: 2800, lat: 18.5308, lng: 73.8475, addr: "154/11, Bannerghatta Rd, Pune", strengths: ["JCI Accredited", "Premium Care", "Multi-Specialty"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "General Surgery"] },
    { name: "Ruby Hall Clinic", city: "Pune", tier: "PREMIUM", nabh: true, jci: false, beds: 550, rating: 4.3, reviews: 3200, lat: 18.5362, lng: 73.8926, addr: "40, Sassoon Rd, Pune", strengths: ["High Cardiac Volume", "NABH Accredited", "24x7 Emergency"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Neurology"] },
    { name: "Sahyadri Hospitals", city: "Pune", tier: "MID", nabh: true, jci: false, beds: 280, rating: 4.1, reviews: 1500, lat: 18.5074, lng: 73.8077, addr: "Plot 30, Karve Rd, Pune", strengths: ["NABH Accredited", "Affordable", "Good Nursing"], specs: ["Cardiology", "Orthopaedics", "Ophthalmology", "Urology"] },
    { name: "Deenanath Mangeshkar Hospital", city: "Pune", tier: "MID", nabh: true, jci: false, beds: 200, rating: 4.2, reviews: 1800, lat: 18.4973, lng: 73.8164, addr: "Erandwane, Pune", strengths: ["NABH Accredited", "Research Hospital"], specs: ["Cardiology", "Oncology", "Gastroenterology", "Neurology"] },
    { name: "Aditya Birla Hospital", city: "Pune", tier: "PREMIUM", nabh: true, jci: false, beds: 500, rating: 4.4, reviews: 2100, lat: 18.6298, lng: 73.7997, addr: "Chinchwad, Pune", strengths: ["Premium Care", "NABH Accredited", "Large Capacity"], specs: ["Cardiology", "Orthopaedics", "Urology", "General Surgery"] },
    { name: "City Care Hospital", city: "Pune", tier: "BUDGET", nabh: false, jci: false, beds: 80, rating: 3.8, reviews: 600, lat: 18.5113, lng: 73.8413, addr: "MG Rd, Camp, Pune", strengths: ["Budget-Friendly", "Available Next Day"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology"] },

    // Mumbai (3 providers)
    { name: "Lilavati Hospital", city: "Mumbai", tier: "PREMIUM", nabh: true, jci: true, beds: 300, rating: 4.6, reviews: 4100, lat: 19.0509, lng: 72.8294, addr: "A-791, Bandra Reclamation, Mumbai", strengths: ["JCI Accredited", "Top Specialists", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Oncology"] },
    { name: "Hinduja Hospital", city: "Mumbai", tier: "PREMIUM", nabh: true, jci: false, beds: 400, rating: 4.4, reviews: 3500, lat: 19.0389, lng: 72.8442, addr: "Veer Savarkar Marg, Mumbai", strengths: ["NABH Accredited", "Research Hub", "High Volume"], specs: ["Cardiology", "Gastroenterology", "Urology", "General Surgery"] },
    { name: "KEM Hospital", city: "Mumbai", tier: "BUDGET", nabh: false, jci: false, beds: 1800, rating: 3.9, reviews: 5200, lat: 19.0003, lng: 72.8419, addr: "Acharya Donde Marg, Parel, Mumbai", strengths: ["Government Excellence", "Large Capacity", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "General Surgery", "Neurology"] },

    // Delhi (3 providers)
    { name: "AIIMS Delhi", city: "Delhi", tier: "MID", nabh: true, jci: false, beds: 2500, rating: 4.2, reviews: 8000, lat: 28.5672, lng: 77.21, addr: "Ansari Nagar, New Delhi", strengths: ["Government Excellence", "Research Leader", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Ophthalmology", "Urology", "General Surgery", "Gastroenterology"] },
    { name: "Fortis Escorts", city: "Delhi", tier: "PREMIUM", nabh: true, jci: true, beds: 310, rating: 4.5, reviews: 3800, lat: 28.5545, lng: 77.227, addr: "Okhla Rd, New Delhi", strengths: ["JCI Accredited", "Heart Institute", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology"] },
    { name: "Safdarjung Hospital", city: "Delhi", tier: "BUDGET", nabh: false, jci: false, beds: 1500, rating: 3.7, reviews: 4500, lat: 28.5689, lng: 77.2065, addr: "Ansari Nagar West, New Delhi", strengths: ["Government Hospital", "Free OPD", "Large Capacity"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology", "Cardiology"] },

    // Bangalore (2 providers)
    { name: "Narayana Health", city: "Bangalore", tier: "MID", nabh: true, jci: false, beds: 600, rating: 4.3, reviews: 2600, lat: 12.8889, lng: 77.5977, addr: "258/A, Bommasandra, Bangalore", strengths: ["High Volume", "Affordable Premium", "NABH Accredited"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Urology"] },
    { name: "Manipal Hospital", city: "Bangalore", tier: "PREMIUM", nabh: true, jci: true, beds: 650, rating: 4.5, reviews: 3200, lat: 12.9592, lng: 77.5967, addr: "98, HAL Airport Rd, Bangalore", strengths: ["JCI Accredited", "Organ Transplant Centre", "Premium Care"], specs: ["Cardiology", "Neurology", "Oncology", "Gastroenterology", "General Surgery"] },

    // Chennai (3 providers — NEW)
    { name: "Apollo Hospitals Chennai", city: "Chennai", tier: "PREMIUM", nabh: true, jci: true, beds: 700, rating: 4.6, reviews: 5500, lat: 13.0067, lng: 80.2206, addr: "21, Greams Lane, Chennai", strengths: ["JCI Accredited", "Flagship Hospital", "Medical Tourism Hub"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "General Surgery", "Gastroenterology"] },
    { name: "MIOT International", city: "Chennai", tier: "PREMIUM", nabh: true, jci: true, beds: 600, rating: 4.4, reviews: 3100, lat: 13.0137, lng: 80.1647, addr: "4/112, Mount Poonamallee Rd, Chennai", strengths: ["JCI Accredited", "Joint Replacement Hub", "Premium Care"], specs: ["Orthopaedics", "Cardiology", "Neurology", "Urology"] },
    { name: "Government General Hospital", city: "Chennai", tier: "BUDGET", nabh: false, jci: false, beds: 2600, rating: 3.5, reviews: 3800, lat: 13.0779, lng: 80.2809, addr: "Park Town, Chennai", strengths: ["Government Hospital", "Large Capacity", "Affordable"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology", "Cardiology"] },

    // Hyderabad (3 providers — NEW)
    { name: "Yashoda Hospitals", city: "Hyderabad", tier: "MID", nabh: true, jci: false, beds: 450, rating: 4.2, reviews: 2400, lat: 17.4504, lng: 78.3877, addr: "Behind Hari Hara Kala Bhavan, Somajiguda, Hyderabad", strengths: ["NABH Accredited", "Multi-Specialty", "Affordable"], specs: ["Cardiology", "Gastroenterology", "Orthopaedics", "Oncology", "Neurology"] },
    { name: "AIG Hospitals", city: "Hyderabad", tier: "PREMIUM", nabh: true, jci: true, beds: 380, rating: 4.5, reviews: 2800, lat: 17.3929, lng: 78.4851, addr: "Mindspace Rd, Gachibowli, Hyderabad", strengths: ["JCI Accredited", "GI Specialty", "Premium Care"], specs: ["Gastroenterology", "Oncology", "General Surgery", "Cardiology"] },
    { name: "Care Hospitals", city: "Hyderabad", tier: "MID", nabh: true, jci: false, beds: 350, rating: 4.1, reviews: 1900, lat: 17.4122, lng: 78.4407, addr: "Road No.1, Banjara Hills, Hyderabad", strengths: ["NABH Accredited", "Cardiac Centre of Excellence"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Urology"] },

    // Lucknow (2 providers — NEW)
    { name: "KGMU Hospital", city: "Lucknow", tier: "BUDGET", nabh: false, jci: false, beds: 3500, rating: 3.6, reviews: 5000, lat: 26.8576, lng: 80.9401, addr: "Shah Mina Rd, Lucknow", strengths: ["Government Teaching Hospital", "Largest in UP", "Affordable"], specs: ["General Surgery", "Orthopaedics", "Cardiology", "Ophthalmology", "Neurology"] },
    { name: "Medanta Lucknow", city: "Lucknow", tier: "PREMIUM", nabh: true, jci: false, beds: 300, rating: 4.3, reviews: 1400, lat: 26.8012, lng: 80.9474, addr: "Shaheed Path, Lucknow", strengths: ["NABH Accredited", "Modern Infrastructure", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Urology"] },

    // Nagpur (2 providers)
    { name: "Wockhardt Hospital", city: "Nagpur", tier: "MID", nabh: true, jci: false, beds: 180, rating: 4.0, reviews: 900, lat: 21.1458, lng: 79.0782, addr: "Shankar Nagar, Nagpur", strengths: ["NABH Accredited", "Cardiac Specialty"], specs: ["Cardiology", "Orthopaedics", "General Surgery"] },
    { name: "KIMS Hospital", city: "Nagpur", tier: "BUDGET", nabh: false, jci: false, beds: 100, rating: 3.7, reviews: 450, lat: 21.155, lng: 79.095, addr: "Central Bazaar Rd, Nagpur", strengths: ["Budget-Friendly", "Accessible Location"], specs: ["General Surgery", "Ophthalmology", "Orthopaedics"] },

    // Jaipur (2 providers)
    { name: "SMS Hospital", city: "Jaipur", tier: "BUDGET", nabh: false, jci: false, beds: 1400, rating: 3.5, reviews: 2200, lat: 26.8941, lng: 75.8063, addr: "JLN Marg, Jaipur", strengths: ["Government Hospital", "Large Capacity", "Budget-Friendly"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology", "Cardiology"] },
    { name: "Fortis Escorts Jaipur", city: "Jaipur", tier: "PREMIUM", nabh: true, jci: false, beds: 250, rating: 4.3, reviews: 1600, lat: 26.8879, lng: 75.7617, addr: "Malviya Nagar, Jaipur", strengths: ["NABH Accredited", "Cardiac Centre", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Urology"] },

    // Coimbatore (1 provider)
    { name: "GKNM Hospital", city: "Coimbatore", tier: "MID", nabh: true, jci: false, beds: 400, rating: 4.1, reviews: 1800, lat: 11.0168, lng: 76.965, addr: "Pappanaickenpalayam, Coimbatore", strengths: ["NABH Accredited", "Cancer Centre", "Affordable"], specs: ["Cardiology", "Oncology", "Orthopaedics", "General Surgery"] },

    // Bhopal (2 providers — NEW)
    { name: "AIIMS Bhopal", city: "Bhopal", tier: "MID", nabh: true, jci: false, beds: 1000, rating: 4.0, reviews: 2100, lat: 23.2047, lng: 77.4891, addr: "Saket Nagar, Bhopal", strengths: ["Government Excellence", "Research Centre", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "General Surgery", "Neurology"] },
    { name: "Bansal Hospital", city: "Bhopal", tier: "MID", nabh: true, jci: false, beds: 250, rating: 4.0, reviews: 1100, lat: 23.2327, lng: 77.4274, addr: "Shahpura, Bhopal", strengths: ["NABH Accredited", "Multi-Specialty", "Central Location"], specs: ["Cardiology", "Orthopaedics", "Urology", "Gastroenterology"] },

    // Raipur (2 providers — NEW)
    { name: "AIIMS Raipur", city: "Raipur", tier: "MID", nabh: true, jci: false, beds: 700, rating: 4.0, reviews: 1800, lat: 21.1836, lng: 81.739, addr: "GE Road, Tatibandh, Raipur", strengths: ["Government Excellence", "Affordable", "Research Centre"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Oncology", "Neurology"] },
    { name: "Ramkrishna Care Hospital", city: "Raipur", tier: "MID", nabh: true, jci: false, beds: 300, rating: 3.9, reviews: 900, lat: 21.2416, lng: 81.6286, addr: "Aurobindo Enclave, Raipur", strengths: ["NABH Accredited", "24x7 Emergency", "Best in CG"], specs: ["Cardiology", "Orthopaedics", "Urology", "General Surgery"] },

    // Dehradun (2 providers — NEW)
    { name: "Max Super Specialty Hospital", city: "Dehradun", tier: "PREMIUM", nabh: true, jci: false, beds: 200, rating: 4.2, reviews: 1200, lat: 30.3337, lng: 78.0423, addr: "Malsi, Mussoorie Rd, Dehradun", strengths: ["NABH Accredited", "Modern Infrastructure", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Urology", "General Surgery"] },
    { name: "Doon Hospital", city: "Dehradun", tier: "BUDGET", nabh: false, jci: false, beds: 600, rating: 3.4, reviews: 1500, lat: 30.3224, lng: 78.0313, addr: "Rajpur Rd, Dehradun", strengths: ["Government Hospital", "Affordable", "Emergency Care"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology"] },

    // Kolkata (2)
    { name: "AMRI Hospital", city: "Kolkata", tier: "PREMIUM", nabh: true, jci: false, beds: 400, rating: 4.3, reviews: 2800, lat: 22.5108, lng: 88.3635, addr: "JC Block, Salt Lake, Kolkata", strengths: ["NABH Accredited", "Cardiac Centre", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Gastroenterology", "Urology"] },
    { name: "SSKM Hospital", city: "Kolkata", tier: "BUDGET", nabh: false, jci: false, beds: 1800, rating: 3.6, reviews: 4500, lat: 22.5354, lng: 88.345, addr: "AJC Bose Rd, Kolkata", strengths: ["Government Hospital", "Largest in WB", "Affordable"], specs: ["General Surgery", "Orthopaedics", "Cardiology", "Oncology"] },

    // Ahmedabad (2)
    { name: "Sterling Hospital", city: "Ahmedabad", tier: "PREMIUM", nabh: true, jci: false, beds: 350, rating: 4.4, reviews: 2200, lat: 23.0339, lng: 72.5263, addr: "Gurukul Rd, Ahmedabad", strengths: ["NABH Accredited", "Multi-Specialty", "Modern OT"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Urology", "General Surgery"] },
    { name: "VS Hospital", city: "Ahmedabad", tier: "BUDGET", nabh: false, jci: false, beds: 900, rating: 3.5, reviews: 3200, lat: 23.0258, lng: 72.5873, addr: "Paldi, Ahmedabad", strengths: ["Government Hospital", "Affordable", "Emergency"], specs: ["General Surgery", "Orthopaedics", "Ophthalmology", "Cardiology"] },

    // Chandigarh (2)
    { name: "PGIMER", city: "Chandigarh", tier: "MID", nabh: true, jci: false, beds: 2000, rating: 4.4, reviews: 6200, lat: 30.7649, lng: 76.7756, addr: "Sector 12, Chandigarh", strengths: ["Government Excellence", "Research Leader", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Ophthalmology", "Urology", "General Surgery", "Gastroenterology"] },
    { name: "Fortis Mohali", city: "Chandigarh", tier: "PREMIUM", nabh: true, jci: true, beds: 350, rating: 4.5, reviews: 2800, lat: 30.7114, lng: 76.6913, addr: "Phase 8, Mohali", strengths: ["JCI Accredited", "Cardiac Centre", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Oncology"] },

    // Kochi (2)
    { name: "Amrita Hospital", city: "Kochi", tier: "PREMIUM", nabh: true, jci: true, beds: 450, rating: 4.5, reviews: 3100, lat: 10.0278, lng: 76.3113, addr: "AIMS Ponekkara, Kochi", strengths: ["JCI Accredited", "Teaching Hospital", "Multi-Specialty"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "Gastroenterology", "Urology"] },
    { name: "Lakeshore Hospital", city: "Kochi", tier: "MID", nabh: true, jci: false, beds: 250, rating: 4.2, reviews: 1600, lat: 9.9816, lng: 76.3012, addr: "NH 47 Bypass, Maradu, Kochi", strengths: ["NABH Accredited", "GI Specialty", "Good Nursing"], specs: ["Gastroenterology", "General Surgery", "Orthopaedics", "Urology"] },

    // Visakhapatnam (2)
    { name: "CARE Hospital Vizag", city: "Visakhapatnam", tier: "MID", nabh: true, jci: false, beds: 300, rating: 4.1, reviews: 1400, lat: 17.7267, lng: 83.312, addr: "Ramnagar, Visakhapatnam", strengths: ["NABH Accredited", "Cardiac Centre", "Affordable"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Neurology"] },
    { name: "Seven Hills Hospital", city: "Visakhapatnam", tier: "PREMIUM", nabh: true, jci: false, beds: 350, rating: 4.3, reviews: 1800, lat: 17.74, lng: 83.25, addr: "Rockdale Layout, Visakhapatnam", strengths: ["NABH Accredited", "Premium Care", "Emergency"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Urology", "Neurology"] },

    // Patna (2)
    { name: "AIIMS Patna", city: "Patna", tier: "MID", nabh: true, jci: false, beds: 800, rating: 4.0, reviews: 2800, lat: 25.6219, lng: 84.9002, addr: "Phulwari Sharif, Patna", strengths: ["Government Excellence", "Research", "Affordable"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology", "General Surgery"] },
    { name: "Paras HMRI Hospital", city: "Patna", tier: "PREMIUM", nabh: true, jci: false, beds: 300, rating: 4.2, reviews: 1600, lat: 25.6121, lng: 85.1565, addr: "Raja Bazar, Patna", strengths: ["NABH Accredited", "Multi-Specialty", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Urology", "General Surgery"] },

    // Indore (2)
    { name: "Choithram Hospital", city: "Indore", tier: "MID", nabh: true, jci: false, beds: 500, rating: 4.0, reviews: 1900, lat: 22.7015, lng: 75.8634, addr: "Manik Bagh Rd, Indore", strengths: ["NABH Accredited", "Affordable", "Good Infrastructure"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Ophthalmology", "Urology"] },
    { name: "Medanta Indore", city: "Indore", tier: "PREMIUM", nabh: true, jci: false, beds: 250, rating: 4.3, reviews: 1100, lat: 22.7533, lng: 75.8937, addr: "Super Corridor, Indore", strengths: ["NABH Accredited", "Modern", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Oncology", "Neurology"] },

    // Thiruvananthapuram (2)
    { name: "KIMS Trivandrum", city: "Thiruvananthapuram", tier: "PREMIUM", nabh: true, jci: false, beds: 400, rating: 4.4, reviews: 2400, lat: 8.5477, lng: 76.9115, addr: "Anayara, Thiruvananthapuram", strengths: ["NABH Accredited", "Cardiac Centre", "Premium Care"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Oncology", "Gastroenterology"] },
    { name: "Govt Medical College Hospital", city: "Thiruvananthapuram", tier: "BUDGET", nabh: false, jci: false, beds: 1200, rating: 3.7, reviews: 3200, lat: 8.5074, lng: 76.9477, addr: "Chalai, Thiruvananthapuram", strengths: ["Government Hospital", "Teaching Hospital", "Affordable"], specs: ["General Surgery", "Orthopaedics", "Cardiology", "Ophthalmology"] },

    // Guwahati (2)
    { name: "GNRC Hospital", city: "Guwahati", tier: "MID", nabh: true, jci: false, beds: 300, rating: 4.1, reviews: 1200, lat: 26.1598, lng: 91.7659, addr: "Dispur, Guwahati", strengths: ["NABH Accredited", "Best in NE India", "Multi-Specialty"], specs: ["Cardiology", "Orthopaedics", "Neurology", "General Surgery", "Urology"] },
    { name: "Nemcare Hospital", city: "Guwahati", tier: "MID", nabh: true, jci: false, beds: 200, rating: 3.9, reviews: 800, lat: 26.183, lng: 91.7458, addr: "Bhangagarh, Guwahati", strengths: ["NABH Accredited", "Cardiac Centre", "Affordable"], specs: ["Cardiology", "Orthopaedics", "General Surgery"] },

    // Varanasi (2)
    { name: "BHU Hospital", city: "Varanasi", tier: "MID", nabh: true, jci: false, beds: 2500, rating: 4.0, reviews: 4000, lat: 25.2677, lng: 82.9913, addr: "Lanka, Varanasi", strengths: ["Government Excellence", "Teaching Hospital", "Affordable"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Oncology", "Neurology", "Ophthalmology"] },
    { name: "Heritage Hospital", city: "Varanasi", tier: "PREMIUM", nabh: true, jci: false, beds: 200, rating: 4.1, reviews: 900, lat: 25.3176, lng: 83.01, addr: "Lanka Rd, Varanasi", strengths: ["NABH Accredited", "Premium Care", "Modern"], specs: ["Cardiology", "Orthopaedics", "Urology", "General Surgery"] },

    // Surat (2)
    { name: "BAPS Pramukh Swami Hospital", city: "Surat", tier: "MID", nabh: true, jci: false, beds: 350, rating: 4.2, reviews: 2100, lat: 21.2052, lng: 72.8311, addr: "Adajan, Surat", strengths: ["NABH Accredited", "Trust Hospital", "Affordable"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Ophthalmology", "Urology"] },
    { name: "Kiran Hospital", city: "Surat", tier: "PREMIUM", nabh: true, jci: false, beds: 300, rating: 4.3, reviews: 1500, lat: 21.1869, lng: 72.7971, addr: "Katargam, Surat", strengths: ["NABH Accredited", "Premium Care", "Cardiac Centre"], specs: ["Cardiology", "Orthopaedics", "Neurology", "Oncology"] },

    // Mangalore (2)
    { name: "KMC Hospital", city: "Mangalore", tier: "MID", nabh: true, jci: false, beds: 500, rating: 4.2, reviews: 2000, lat: 12.8715, lng: 74.8428, addr: "Ambedkar Circle, Mangalore", strengths: ["NABH Accredited", "Teaching Hospital", "Multi-Specialty"], specs: ["Cardiology", "Orthopaedics", "General Surgery", "Neurology", "Ophthalmology"] },
    { name: "AJ Hospital", city: "Mangalore", tier: "MID", nabh: true, jci: false, beds: 300, rating: 4.0, reviews: 1200, lat: 12.8983, lng: 74.8367, addr: "Kuntikana, Mangalore", strengths: ["NABH Accredited", "Affordable", "Good Nursing"], specs: ["Cardiology", "Orthopaedics", "Urology", "General Surgery"] },
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
