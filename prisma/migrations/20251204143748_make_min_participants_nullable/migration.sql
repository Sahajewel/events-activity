-- AlterTable
ALTER TABLE "events" ALTER COLUMN "minParticipants" DROP NOT NULL,
ALTER COLUMN "minParticipants" DROP DEFAULT;
