-- The NextAuth Prisma adapter was never wired up (auth uses JWT sessions), so these
-- tables should be empty. Refuse to drop them if they aren't, rather than lose data.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "accounts")
     OR EXISTS (SELECT 1 FROM "sessions")
     OR EXISTS (SELECT 1 FROM "verificationtokens") THEN
    RAISE EXCEPTION 'accounts/sessions/verificationtokens are not empty; refusing to drop them';
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- AlterTable: lastEdited duplicated updatedAt (both @updatedAt) and was never read.
ALTER TABLE "recipes" DROP COLUMN "lastEdited";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "verificationtokens";
