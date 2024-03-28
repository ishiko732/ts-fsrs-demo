-- CreateEnum
CREATE TYPE "State" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('0', '1', '2', '3', '4');

-- CreateTable
CREATE TABLE "Revlog" (
    "lid" TEXT NOT NULL,
    "cid" INTEGER NOT NULL,
    "grade" "Rating" NOT NULL,
    "state" "State" NOT NULL,
    "due" TIMESTAMP(3) NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "last_elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "review" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Revlog_pkey" PRIMARY KEY ("lid")
);

-- CreateTable
CREATE TABLE "Card" (
    "cid" SERIAL NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "scheduled_days" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "lapses" INTEGER NOT NULL,
    "state" "State" NOT NULL DEFAULT '0',
    "last_review" TIMESTAMP(3),
    "nid" INTEGER NOT NULL,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Parameters" (
    "uid" SERIAL NOT NULL,
    "request_retention" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
    "maximum_interval" INTEGER NOT NULL DEFAULT 36500,
    "w" JSONB NOT NULL,
    "enable_fuzz" BOOLEAN NOT NULL DEFAULT false,
    "card_limit" INTEGER NOT NULL DEFAULT 50,
    "lapses" INTEGER NOT NULL DEFAULT 8,
    "lingq_token" TEXT,
    "lingq_counter" TEXT,

    CONSTRAINT "Parameters_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "User" (
    "uid" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "oauthId" TEXT NOT NULL,
    "oauthType" TEXT NOT NULL DEFAULT 'local',
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Note" (
    "nid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "question" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "sourceId" TEXT,
    "extend" JSONB NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("nid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Revlog_lid_key" ON "Revlog"("lid");

-- CreateIndex
CREATE INDEX "Revlog_cid_idx" ON "Revlog"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Card_cid_key" ON "Card"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Card_nid_key" ON "Card"("nid");

-- CreateIndex
CREATE UNIQUE INDEX "Parameters_uid_key" ON "Parameters"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Note_nid_key" ON "Note"("nid");

-- CreateIndex
CREATE INDEX "Note_uid_idx" ON "Note"("uid");

-- CreateIndex
CREATE INDEX "Note_sourceId_source_idx" ON "Note"("sourceId", "source");
