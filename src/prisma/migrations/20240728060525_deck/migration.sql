-- CreateTable
CREATE TABLE "Deck" (
    "did" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "uid" INTEGER NOT NULL,
    "fsrs" JSONB NOT NULL,
    "card_limit" INTEGER NOT NULL DEFAULT 50,
    "lapses" INTEGER NOT NULL DEFAULT 8,
    "extends" JSONB NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("did")
);
