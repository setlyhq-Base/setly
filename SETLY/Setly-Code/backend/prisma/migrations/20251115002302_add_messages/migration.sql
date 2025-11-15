-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "market" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME
);

-- CreateIndex
CREATE INDEX "Message_fromUserId_toUserId_createdAt_idx" ON "Message"("fromUserId", "toUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_toUserId_fromUserId_createdAt_idx" ON "Message"("toUserId", "fromUserId", "createdAt");
