-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "doorIssue" TEXT,
    "location" TEXT,
    "comments" TEXT,
    "imageUrls" TEXT[],
    "secondStepAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "leadType" TEXT,
    "formId" TEXT,
    "source" TEXT,
    "campaignName" TEXT,
    "adName" TEXT,
    "formName" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
