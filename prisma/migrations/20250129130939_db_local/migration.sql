-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "dueDate" SET DEFAULT now() + interval '14 days';
