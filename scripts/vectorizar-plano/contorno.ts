import type { PuntoPlano } from '@/lib/plano/tipos'

import type { Componente, Etiquetado } from './etiquetado'

/** Vecinos en sentido horario arrancando por el noroeste. */
const VECINOS_8 = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
] as const

/**
 * Trazado de contorno de Moore. Devuelve los centros de los pixeles del borde
 * exterior de la componente, en orden y sin cerrar (el ultimo punto no repite
 * al primero).
 *
 * Devuelve `null` si la componente es demasiado chica o degenerada.
 */
export const trazarContorno = (
  etiquetado: Etiquetado,
  componente: Componente,
): readonly PuntoPlano[] | null => {
  const { ancho, etiquetas } = etiquetado
  const { etiqueta } = componente

  const perteneceA = (x: number, y: number): boolean =>
    x >= 0 &&
    y >= 0 &&
    x < ancho &&
    y < etiquetado.alto &&
    etiquetas[y * ancho + x] === etiqueta

  const inicio = buscarPixelInicial(componente, perteneceA)
  if (!inicio) return null

  const contorno: PuntoPlano[] = [inicio]
  const limiteIteraciones = componente.areaPx * 8 + 64

  let actual = inicio
  // Direccion de entrada: se arranca mirando al oeste, que es fondo por como
  // se eligio el pixel inicial.
  let direccionEntrada = 7
  let iteraciones = 0

  while (iteraciones < limiteIteraciones) {
    iteraciones += 1

    const paso = siguientePixelDelBorde(actual, direccionEntrada, perteneceA)
    if (!paso) break

    if (paso.pixel[0] === inicio[0] && paso.pixel[1] === inicio[1]) break

    contorno.push(paso.pixel)
    actual = paso.pixel
    direccionEntrada = paso.direccionEntrada
  }

  return contorno.length >= 3 ? contorno : null
}

const buscarPixelInicial = (
  componente: Componente,
  perteneceA: (x: number, y: number) => boolean,
): PuntoPlano | null => {
  for (let y = componente.minY; y <= componente.maxY; y += 1) {
    for (let x = componente.minX; x <= componente.maxX; x += 1) {
      if (perteneceA(x, y)) return [x, y]
    }
  }

  return null
}

interface PasoContorno {
  readonly pixel: PuntoPlano
  readonly direccionEntrada: number
}

const siguientePixelDelBorde = (
  [x, y]: PuntoPlano,
  direccionEntrada: number,
  perteneceA: (x: number, y: number) => boolean,
): PasoContorno | null => {
  // Se gira en sentido horario arrancando justo despues del vecino por el que
  // se entro, que por construccion es fondo.
  for (let salto = 1; salto <= VECINOS_8.length; salto += 1) {
    const direccion = (direccionEntrada + salto) % VECINOS_8.length
    const [dx, dy] = VECINOS_8[direccion]
    const vx = x + dx
    const vy = y + dy

    if (!perteneceA(vx, vy)) continue

    return {
      pixel: [vx, vy],
      // El vecino anterior (fondo) visto desde el pixel nuevo pasa a ser la
      // nueva direccion de entrada.
      direccionEntrada: (direccion + 5) % VECINOS_8.length,
    }
  }

  return null
}
