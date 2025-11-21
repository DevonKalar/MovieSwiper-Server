/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId]` on the table `Movies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdbId` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "tmdbId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Movies_tmdbId_key" ON "Movies"("tmdbId");
