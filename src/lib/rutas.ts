/**
 * Rutas del plano de lotes, en un solo lugar.
 *
 * El plano vive colgado de la ficha del proyecto y no en la raíz: la ficha
 * (`/proyectos/el-madrigal`) sigue siendo la página comercial, y el mapa es una
 * pantalla propia porque necesita alto completo y gestos de arrastre, que
 * conviven mal con el scroll suavizado del sitio.
 */
export const RUTA_PLANO = '/proyectos/el-madrigal/plano'

/** Acceso de administradores. Va fuera del árbol de proyectos: no es contenido público. */
export const RUTA_ADMIN = '/admin'
