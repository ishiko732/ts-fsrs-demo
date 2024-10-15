-- AlterTable
ALTER TABLE "Revlog" ADD COLUMN     "did" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Revlog_did_idx" ON "Revlog"("did");
