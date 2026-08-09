import { VistaPlano } from '@/components/plano/VistaPlano'

import '@/styles/plano.css'

/**
 * Imagen de fondo del plano. Tiene que ser la misma que se le pasó al
 * vectorizador, si no los polígonos no calzan con el dibujo.
 *
 * Es el WebP y no el PNG original: misma resolución (1657x1081), así que las
 * coordenadas de la geometría siguen siendo válidas, pero pesa 396 KB en vez
 * de 3,2 MB.
 */
const RUTA_IMAGEN = '/plano.webp'

const PlanoElMadrigal = () => <VistaPlano rutaImagen={RUTA_IMAGEN} />

export default PlanoElMadrigal
