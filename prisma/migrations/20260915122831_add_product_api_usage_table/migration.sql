-- CreateTable
CREATE TABLE "ProductApiUsage" (
    "id" SERIAL NOT NULL,
    "provider" "ProductSource" NOT NULL,
    "requestsUsed" INTEGER NOT NULL DEFAULT 0,
    "requestLimit" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductApiUsage_provider_key" ON "ProductApiUsage"("provider");
