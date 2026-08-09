-- Esquema inicial en Postgres.
--
-- Reemplaza al historial anterior, que era SQL de SQLite y no corre contra
-- Postgres. Se rehizo desde cero en vez de traducirlo porque todavia no habia
-- datos productivos: los lotes se recrean con `npm run db:seed` a partir de la
-- geometria del plano y la numeracion oficial de la mensura.

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "superficieM2" DOUBLE PRECISION NOT NULL,
    "precioUsd" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "observacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editadoEn" TIMESTAMP(3) NOT NULL,
    "editadoPorId" TEXT,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntentoAcceso" (
    "clave" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "reiniciaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntentoAcceso_pkey" PRIMARY KEY ("clave")
);

-- CreateIndex
CREATE INDEX "Lote_estado_idx" ON "Lote"("estado");

-- CreateIndex
CREATE INDEX "Lote_numero_idx" ON "Lote"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "IntentoAcceso_reiniciaEn_idx" ON "IntentoAcceso"("reiniciaEn");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_editadoPorId_fkey" FOREIGN KEY ("editadoPorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
