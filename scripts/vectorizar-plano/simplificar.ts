import type { PuntoPlano } from '@/lib/plano/tipos'

const distanciaAlSegmento = (
  [px, py]: PuntoPlano,
  [ax, ay]: PuntoPlano,
  [bx, by]: PuntoPlano,
): number => {
  const dx = bx - ax
  const dy = by - ay
  const largoCuadrado = dx * dx + dy * dy

  if (largoCuadrado === 0) return Math.hypot(px - ax, py - ay)

  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / largoCuadrado))

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

const simplificarTramo = (
  puntos: readonly PuntoPlano[],
  tolerancia: number,
): readonly PuntoPlano[] => {
  if (puntos.length < 3) return puntos

  const primero = puntos[0]
  const ultimo = puntos[puntos.length - 1]

  let indiceMasLejano = 0
  let distanciaMaxima = 0

  for (let i = 1; i < puntos.length - 1; i += 1) {
    const distancia = distanciaAlSegmento(puntos[i], primero, ultimo)

    if (distancia > distanciaMaxima) {
      distanciaMaxima = distancia
      indiceMasLejano = i
    }
  }

  if (distanciaMaxima <= tolerancia) return [primero, ultimo]

  return [
    ...simplificarTramo(puntos.slice(0, indiceMasLejano + 1), tolerancia).slice(0, -1),
    ...simplificarTramo(puntos.slice(indiceMasLejano), tolerancia),
  ]
}

/**
 * Ramer-Douglas-Peucker sobre un contorno cerrado. Endereza las escaleras de
 * pixeles que deja el trazado y deja poligonos de pocos vertices.
 */
export const simplificarContorno = (
  contorno: readonly PuntoPlano[],
  tolerancia: number,
): readonly PuntoPlano[] => {
  if (contorno.length < 4) return contorno

  // Se parte el anillo en dos tramos por los puntos mas alejados entre si para
  // que RDP (que trabaja sobre polilineas abiertas) no colapse el cierre.
  const [indiceA, indiceB] = extremosOpuestos(contorno)

  const tramoUno = contorno.slice(indiceA, indiceB + 1)
  const tramoDos = [...contorno.slice(indiceB), ...contorno.slice(0, indiceA + 1)]

  const simplificado = [
    ...simplificarTramo(tramoUno, tolerancia).slice(0, -1),
    ...simplificarTramo(tramoDos, tolerancia).slice(0, -1),
  ]

  return simplificado.length >= 3 ? simplificado : contorno
}

const extremosOpuestos = (contorno: readonly PuntoPlano[]): readonly [number, number] => {
  const origen = contorno[0]

  let indiceLejano = 0
  let distanciaMaxima = -1

  for (let i = 1; i < contorno.length; i += 1) {
    const distancia = Math.hypot(contorno[i][0] - origen[0], contorno[i][1] - origen[1])

    if (distancia > distanciaMaxima) {
      distanciaMaxima = distancia
      indiceLejano = i
    }
  }

  return [0, indiceLejano]
}
