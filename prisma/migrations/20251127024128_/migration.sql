-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "degreeId" INTEGER,
    CONSTRAINT "User_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Degree" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "degreeId" INTEGER NOT NULL,
    CONSTRAINT "Subject_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubjectState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserSubjectProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSubjectProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSubjectProgress_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSubjectProgress_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "SubjectState" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Correlativity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subjectId" INTEGER NOT NULL,
    "prerequisiteSubjectId" INTEGER NOT NULL,
    "requiredStateId" INTEGER NOT NULL,
    CONSTRAINT "Correlativity_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Correlativity_prerequisiteSubjectId_fkey" FOREIGN KEY ("prerequisiteSubjectId") REFERENCES "Subject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Correlativity_requiredStateId_fkey" FOREIGN KEY ("requiredStateId") REFERENCES "SubjectState" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectState_name_key" ON "SubjectState"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSubjectProgress_userId_subjectId_key" ON "UserSubjectProgress"("userId", "subjectId");
