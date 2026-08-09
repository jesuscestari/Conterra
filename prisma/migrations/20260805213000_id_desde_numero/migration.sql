-- El id del lote pasa a derivar de su numero y no de su posicion en el plano.
--
-- Antes el id salia del recorrido del vectorizador (L001 era la primera parcela
-- que encontraba, no el lote 1), asi que id y numero no tenian nada que ver:
-- el lote 315 vivia en la fila L135. Eso hacia confuso mirar la base a mano.
--
-- No es un cambio de esquema sino de datos: se renombran las claves. Como el
-- numero ya esta guardado en cada fila, el id nuevo se calcula desde ahi y NO
-- hace falta volver a sembrar, con lo cual los estados, precios y observaciones
-- que ya se hayan cargado se conservan.
--
-- El id nuevo tiene que quedar igual al que genera el vectorizador en
-- public/data/plano-geometria.json, o los poligonos quedan sin datos.

-- Se pasa por un valor intermedio porque la clave primaria se verifica fila por
-- fila: la transformacion es una permutacion del mismo espacio de ids (L001 a
-- L462), asi que en una sola pasada chocaria contra ids todavia sin migrar.
UPDATE "Lote" SET "id" = 'migrando-' || "id";

UPDATE "Lote" SET "id" = 'L' || LPAD("numero"::text, 3, '0');
