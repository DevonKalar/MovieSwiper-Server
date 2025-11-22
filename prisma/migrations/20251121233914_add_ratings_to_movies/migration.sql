/*
  Warnings:

  - Added the required column `ratings` to the `Movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movies" ADD COLUMN     "ratings" DOUBLE PRECISION NOT NULL;
