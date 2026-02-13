-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Consultant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "commissionRate" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "taxNumber" TEXT,
    "taxOffice" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "monthlySalary" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "totalRevenue" REAL NOT NULL,
    "consultantId" TEXT NOT NULL,
    "consultantShare" REAL NOT NULL,
    "officeRevenue" REAL NOT NULL,
    "partnerShareAltan" REAL NOT NULL,
    "partnerShareSuat" REAL NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "Consultant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "vendorId" TEXT,
    "paidBy" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "personnelId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "period" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryPayment_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
