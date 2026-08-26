-- "Disponible" se subdivide en ocho categorias comerciales, para poder
-- distinguirlas por color en el mapa.
--
-- Los lotes que ya estaban disponibles pasan a la categoria 1 como punto de
-- partida: es un valor provisorio, no una clasificacion real. Hay que
-- repartirlos a mano desde el panel.
--
-- Reservado, vendido y no disponible no se tocan: solo les cambio el color.
--
-- No hay cambio de esquema. El estado se guarda como texto justamente para que
-- agregar valores no cueste una migracion de estructura; esta migracion existe
-- solo para mover los datos que ya estaban cargados.
UPDATE "Lote" SET "estado" = 'DISPONIBLE_CAT1' WHERE "estado" = 'DISPONIBLE';

-- El valor por defecto de la columna tambien apuntaba al estado viejo: una fila
-- insertada sin estado habria quedado con un valor que ya no existe.
ALTER TABLE "Lote" ALTER COLUMN "estado" SET DEFAULT 'DISPONIBLE_CAT1';
