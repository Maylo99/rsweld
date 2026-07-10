-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('CONTACT', 'QUOTE');

-- CreateEnum
CREATE TYPE "ReferenceCategory" AS ENUM ('CABLE_RAILING', 'ROD_RAILING', 'VERTICAL_RAILING', 'FRENCH_BALCONY', 'DESIGN_TABLE', 'CONVEYOR', 'PIPING', 'ENGINEERING_COMPONENT', 'WATER_INDUSTRY_COMPONENT', 'LADDER');

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "type" "InquiryType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "references" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ReferenceCategory" NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "company" TEXT,
    "quote" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "references_category_idx" ON "references"("category");

-- CreateIndex
CREATE INDEX "references_featured_idx" ON "references"("featured");
