-- Las categorias dejan de estar en el codigo y pasan a ser datos que los
-- administradores manejan, y el precio se muda del lote a la categoria.
--
-- Antes, cambiar un precio era tocar todos los lotes de ese tramo. Ahora es
-- editar una fila. Y el estado vuelve a sus cuatro valores: la categoria pasa a
-- ser un campo aparte, de modo que un lote vendido conserve su tramo y no haya
-- que acordarse de cual era si vuelve a estar disponible.

CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "precioUsd" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");
CREATE INDEX "Categoria_orden_idx" ON "Categoria"("orden");

ALTER TABLE "Lote" ADD COLUMN "categoriaId" TEXT;

-- Los seis tramos que ya estaban, con el color con el que se venian dibujando.
INSERT INTO "Categoria" ("id", "nombre", "color", "precioUsd", "orden", "editadoEn")
VALUES
  ('cat-16000', 'CAT1', '#99e5c0', 16000, 1, CURRENT_TIMESTAMP),
  ('cat-18000', 'CAT2', '#fff2bc', 18000, 2, CURRENT_TIMESTAMP),
  ('cat-19000', 'CAT3', '#ffc2e7', 19000, 3, CURRENT_TIMESTAMP),
  ('cat-20000', 'CAT4', '#afe1ff', 20000, 4, CURRENT_TIMESTAMP),
  ('cat-22000', 'CAT5', '#dccbff', 22000, 5, CURRENT_TIMESTAMP),
  ('cat-24000', 'CAT6', '#f6c5c5', 24000, 6, CURRENT_TIMESTAMP);

-- Cualquier precio que no este en esa lista tambien tiene que sobrevivir: se le
-- arma una categoria propia en vez de perderlo al borrar la columna. En esta
-- base no hay ninguno, pero la migracion no puede depender de eso.
INSERT INTO "Categoria" ("id", "nombre", "color", "precioUsd", "orden", "editadoEn")
SELECT
  'cat-' || "precioUsd",
  'Sin clasificar ' || "precioUsd",
  '#d4d4d4',
  "precioUsd",
  99,
  CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "precioUsd" FROM "Lote" WHERE "precioUsd" IS NOT NULL) AS precios
WHERE NOT EXISTS (
  SELECT 1 FROM "Categoria" c WHERE c."precioUsd" = precios."precioUsd"
);

-- Cada lote toma la categoria que corresponde a su precio. Incluye a los
-- reservados y vendidos que tenian precio: conservan su tramo.
UPDATE "Lote" l
SET "categoriaId" = c."id"
FROM "Categoria" c
WHERE l."precioUsd" = c."precioUsd";

-- Las ocho categorias que vivian dentro del estado se colapsan al unico
-- "disponible" que corresponde. El tramo ya quedo guardado en categoriaId.
UPDATE "Lote" SET "estado" = 'DISPONIBLE' WHERE "estado" LIKE 'DISPONIBLE\_CAT%';

ALTER TABLE "Lote" ALTER COLUMN "estado" SET DEFAULT 'DISPONIBLE';

ALTER TABLE "Lote" DROP COLUMN "precioUsd";

CREATE INDEX "Lote_categoriaId_idx" ON "Lote"("categoriaId");

ALTER TABLE "Lote" ADD CONSTRAINT "Lote_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
