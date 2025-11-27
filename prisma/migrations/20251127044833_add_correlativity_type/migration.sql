/*
  Warnings:

  - Added the required column `type` to the `Correlativity` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Correlativity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "prerequisiteSubjectId" INTEGER NOT NULL,
    "requiredStateId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Correlativity_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Correlativity_prerequisiteSubjectId_fkey" FOREIGN KEY ("prerequisiteSubjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Correlativity_requiredStateId_fkey" FOREIGN KEY ("requiredStateId") REFERENCES "SubjectState" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Correlativity" ("id", "prerequisiteSubjectId", "requiredStateId", "subjectId") SELECT "id", "prerequisiteSubjectId", "requiredStateId", "subjectId" FROM "Correlativity";
DROP TABLE "Correlativity";
ALTER TABLE "new_Correlativity" RENAME TO "Correlativity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
