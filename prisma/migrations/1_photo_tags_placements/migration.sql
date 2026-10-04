-- Gallery rework: fixed categories become editable tags, the "featured" flag
-- becomes a placement, and every list (gallery, each tag, each homepage
-- section) gets its own independent ordering.
--
-- Existing data is carried over: each reference keeps its category as a tag,
-- stays in the gallery in its current order, and featured items stay on the
-- homepage.

-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('GALLERY', 'HOME_FEATURED', 'HOME_ABOUT');

-- Rename references -> photos (keeps ids and data)
ALTER TABLE "references" RENAME TO "photos";
ALTER TABLE "photos" RENAME CONSTRAINT "references_pkey" TO "photos_pkey";
DROP INDEX "references_category_idx";
DROP INDEX "references_featured_idx";
ALTER TABLE "photos" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_tags" (
    "photoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("photoId","tagId")
);

-- CreateTable
CREATE TABLE "photo_placements" (
    "photoId" TEXT NOT NULL,
    "placement" "Placement" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "photo_placements_pkey" PRIMARY KEY ("photoId","placement")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "photo_tags_tagId_sortOrder_idx" ON "photo_tags"("tagId", "sortOrder");

-- CreateIndex
CREATE INDEX "photo_placements_placement_sortOrder_idx" ON "photo_placements"("placement", "sortOrder");

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_placements" ADD CONSTRAINT "photo_placements_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data: one tag per category that is in use (Slovak names = site content)
INSERT INTO "tags" ("id", "name", "slug", "sortOrder")
SELECT
    'tag-' || lower(replace(c.category::text, '_', '-')),
    c.name,
    c.slug,
    c.position
FROM (
    VALUES
        ('CABLE_RAILING', 'Lankové zábradlia', 'lankove-zabradlia', 1),
        ('ROD_RAILING', 'Prútové zábradlia', 'prutove-zabradlia', 2),
        ('VERTICAL_RAILING', 'Zvislé zábradlia', 'zvisle-zabradlia', 3),
        ('FRENCH_BALCONY', 'Francúzske balkóny', 'francuzske-balkony', 4),
        ('DESIGN_TABLE', 'Dizajnové stolíky', 'dizajnove-stoliky', 5),
        ('CONVEYOR', 'Nerezové dopravníky', 'nerezove-dopravniky', 6),
        ('PIPING', 'Potrubia', 'potrubia', 7),
        ('ENGINEERING_COMPONENT', 'Strojárske komponenty', 'strojarske-komponenty', 8),
        ('WATER_INDUSTRY_COMPONENT', 'Vodárenské komponenty', 'vodarenske-komponenty', 9),
        ('LADDER', 'Nerezové rebríky', 'nerezove-rebriky', 10)
) AS c (category, name, slug, position)
WHERE EXISTS (SELECT 1 FROM "photos" p WHERE p."category"::text = c.category);

INSERT INTO "photo_tags" ("photoId", "tagId", "sortOrder")
SELECT
    p."id",
    'tag-' || lower(replace(p."category"::text, '_', '-')),
    row_number() OVER (PARTITION BY p."category" ORDER BY p."sortOrder", p."createdAt" DESC)
FROM "photos" p;

INSERT INTO "photo_placements" ("photoId", "placement", "sortOrder")
SELECT p."id", 'GALLERY', row_number() OVER (ORDER BY p."sortOrder", p."createdAt" DESC)
FROM "photos" p;

INSERT INTO "photo_placements" ("photoId", "placement", "sortOrder")
SELECT p."id", 'HOME_FEATURED', row_number() OVER (ORDER BY p."sortOrder", p."createdAt" DESC)
FROM "photos" p
WHERE p."featured";

-- Drop the replaced columns
ALTER TABLE "photos" DROP COLUMN "category",
DROP COLUMN "featured",
DROP COLUMN "sortOrder";

-- DropEnum
DROP TYPE "ReferenceCategory";
