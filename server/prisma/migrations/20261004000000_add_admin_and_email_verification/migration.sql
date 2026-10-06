-- AlterEnum: add admin role
ALTER TYPE "UserType" ADD VALUE 'admin';

-- AlterTable: add email verification and password reset fields
ALTER TABLE "users" ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "passwordResetExpires" TIMESTAMP(3);

-- CreateIndex: unique indexes for tokens
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");

-- Mark all existing users as email verified (they signed up before verification was required)
UPDATE "users" SET "isEmailVerified" = true;
