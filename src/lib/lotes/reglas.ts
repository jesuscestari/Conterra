import { esDisponible, type EstadoLote } from '../plano/estado'

/**
 * El precio solo se publica cuando el lote está a la venta. Un lote reservado,
 * vendido o no disponible no se ofrece, así que mostrarle un precio a la visita
 * es confuso y puede generar reclamos.
 *
 * La regla vive acá y no dentro del popup para que haya un solo lugar donde
 * cambiarla si mañana se decide, por ejemplo, seguir mostrando el precio de los
 * reservados.
 */
export const precioEsPublico = (estado: EstadoLote): boolean => esDisponible(estado)
