-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OPERATOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'IN_WAREHOUSE', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "trackingCode" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "deliveredAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "capacity" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingCode_key" ON "shipments"("trackingCode");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_createdById_idx" ON "shipments"("createdById");

-- CreateIndex
CREATE INDEX "shipment_events_shipmentId_timestamp_idx" ON "shipment_events"("shipmentId", "timestamp");

-- CreateIndex
CREATE INDEX "shipment_events_userId_idx" ON "shipment_events"("userId");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
