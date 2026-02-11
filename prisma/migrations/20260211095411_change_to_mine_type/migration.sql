/*
  Warnings:

  - You are about to drop the column `current` on the `Conversion` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `Conversion` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Conversion` table. All the data in the column will be lost.
  - Added the required column `currentMime` to the `Conversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromMime` to the `Conversion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toMime` to the `Conversion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversion" DROP COLUMN "current",
DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "currentMime" TEXT NOT NULL,
ADD COLUMN     "fromMime" TEXT NOT NULL,
ADD COLUMN     "toMime" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT concat('cnv_', replace(cast(gen_random_uuid() as text), '-', ''));

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "id" SET DEFAULT concat('tnt_', replace(cast(gen_random_uuid() as text), '-', '')),
ALTER COLUMN "inviteKey" SET DEFAULT replace(cast(gen_random_uuid() as text), '-', '');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', ''));
