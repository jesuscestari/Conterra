import path from 'node:path'

/**
 * Parametros del vectorizador. Estan todos juntos y con nombre para poder
 * recalibrar sin tocar los algoritmos: si el plano cambia de resolucion o de
 * paleta, se ajusta aca.
 */

const raiz = process.cwd()

export const RUTAS = {
  imagen: path.join(raiz, 'public', 'plano.png'),
  salida: path.join(raiz, 'public', 'data', 'plano-geometria.json'),
  previsualizacion: path.join(raiz, 'public', 'data', 'plano-preview.svg'),
} as const

/**
 * Rango en HSV que identifica el verde oliva del relleno de las parcelas.
 *
 * Valores medidos sobre el plano con `npm run vectorizar -- --diagnostico`:
 *   relleno de parcela   #8e913a   tono 62°  sat 0.60  valor 0.57
 *   lineas divisorias    #384301   tono 70°  sat 0.99  valor 0.26
 *   fondo de papel       #e6ded4   tono 33°  sat 0.08  valor 0.90
 *
 * El relleno y las lineas comparten el tono, asi que el corte que las separa es
 * `valorMin`: tiene que quedar entre 0.31 y 0.57.
 */
export const VERDE_LOTE = {
  tonoMin: 45,
  tonoMax: 110,
  saturacionMin: 0.25,
  valorMin: 0.42,
  valorMax: 0.82,
} as const

export const MORFOLOGIA = {
  /**
   * Radio de erosion para despegar parcelas vecinas que quedaron unidas por el
   * antialiasing de las calles internas. Subilo si dos lotes salen fusionados;
   * bajalo si desaparecen lotes chicos.
   */
  radioErosion: 1,
} as const

export const FILTRO_COMPONENTE = {
  /** Area minima en pixeles para considerar que una mancha es una parcela. */
  areaMinimaPx: 120,
  /** Area maxima; por encima de esto es una manzana entera sin separar. */
  areaMaximaPx: 20000,
  /**
   * Cuan convexa tiene que ser una mancha para contar como parcela (0 a 1).
   * Es el filtro que descarta la vegetacion, que comparte el color de los lotes.
   * Medido sobre este plano: las parcelas van de 0.95 a 1.00 (incluidas las
   * triangulares del borde del arroyo) y los arboles de 0.40 a 0.73, asi que el
   * corte queda holgado en el medio.
   */
  convexidadMinima: 0.88,
} as const

export const CONTORNO = {
  /**
   * Tolerancia de Ramer-Douglas-Peucker en pixeles. Mas alto = poligonos con
   * menos vertices y bordes mas rectos.
   */
  toleranciaSimplificacion: 0.9,
  /** Vertices minimos para aceptar el contorno como poligono valido. */
  verticesMinimos: 4,
} as const

export const MANZANAS = {
  /**
   * Distancia maxima entre centroides (en pixeles) para que dos lotes se
   * consideren de la misma manzana. Se agrupa por cercania encadenada.
   */
  distanciaMaximaPx: 6,
} as const

/**
 * Calibracion de escala. El folleto indica parcelas de 600 a 1000 m2, asi que
 * se ajusta `metrosPorPixel` para que la mediana de las areas caiga en este
 * valor. Si tenes una medida real del plano, fijala aca y listo.
 */
export const ESCALA = {
  superficieMedianaObjetivoM2: 800,
  /** Si es distinto de null se usa tal cual y se ignora la calibracion automatica. */
  metrosPorPixelFijo: null as number | null,
} as const
