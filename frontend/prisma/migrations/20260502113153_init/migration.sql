-- CreateEnum
CREATE TYPE "CityTier" AS ENUM ('METRO', 'TIER_2', 'TIER_3');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER');

-- CreateEnum
CREATE TYPE "HospitalTier" AS ENUM ('BUDGET', 'MID', 'PREMIUM');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "tier" "CityTier" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "pricingFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProviderType" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "tier" "HospitalTier" NOT NULL,
    "nabh" BOOLEAN NOT NULL DEFAULT false,
    "jci" BOOLEAN NOT NULL DEFAULT false,
    "bedCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "cityId" TEXT NOT NULL,
    "strengths" TEXT[],

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSpecialization" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "volumeProxy" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProviderSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icd10Code" TEXT NOT NULL,
    "snomedCode" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "specialtyId" TEXT NOT NULL,
    "baseCostMin" INTEGER NOT NULL,
    "baseCostMax" INTEGER NOT NULL,
    "surgeonFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "anaesthesiaPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.08,
    "diagnosticsPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.06,
    "medicationPercent" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "stayPerDayMin" INTEGER NOT NULL DEFAULT 3000,
    "stayPerDayMax" INTEGER NOT NULL DEFAULT 8000,
    "expectedStayDays" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureCost" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "costMin" INTEGER NOT NULL,
    "costMax" INTEGER NOT NULL,
    "waitDays" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "ProcedureCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "query" TEXT NOT NULL,
    "mappedIcd10" TEXT,
    "confidence" DOUBLE PRECISION,
    "city" TEXT,
    "disclaimerAck" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_state_key" ON "City"("name", "state");

-- CreateIndex
CREATE INDEX "Provider_cityId_idx" ON "Provider"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "Specialty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSpecialization_providerId_specialtyId_key" ON "ProviderSpecialization"("providerId", "specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_icd10Code_key" ON "Procedure"("icd10Code");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureCost_providerId_procedureId_key" ON "ProcedureCost"("providerId", "procedureId");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialization" ADD CONSTRAINT "ProviderSpecialization_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSpecialization" ADD CONSTRAINT "ProviderSpecialization_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureCost" ADD CONSTRAINT "ProcedureCost_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureCost" ADD CONSTRAINT "ProcedureCost_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
