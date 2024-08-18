/*
  Warnings:

  - A unique constraint covering the columns `[nid,orderId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Card_nid_key";

-- CreateIndex
CREATE INDEX "Card_nid_idx" ON "Card"("nid");

-- CreateIndex
CREATE INDEX "Card_orderId_idx" ON "Card"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Card_nid_orderId_key" ON "Card"("nid", "orderId");
