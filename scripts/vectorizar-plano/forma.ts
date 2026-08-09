import type { PuntoPlano } from '@/lib/plano/tipos'

const areaDelPoligono = (puntos: readonly PuntoPlano[]): number => {
  const suma = puntos.reduce((acumulado, [x1, y1], indice) => {
    const [x2, y2] = puntos[(indice + 1) % puntos.length]

    return acumulado + (x1 * y2 - x2 * y1)
  }, 0)

  return Math.abs(suma) / 2
}

const producto = (origen: PuntoPlano, a: PuntoPlano, b: PuntoPlano): number =>
  (a[0] - origen[0]) * (b[1] - origen[1]) - (a[1] - origen[1]) * (b[0] - origen[0])

const construirCadena = (puntos: readonly PuntoPlano[]): PuntoPlano[] =>
  puntos.reduce<PuntoPlano[]>((pila, punto) => {
    while (pila.length >= 2 && producto(pila[pila.length - 2], pila[pila.length - 1], punto) <= 0) {
      pila.pop()
    }

    return [...pila, punto]
  }, [])

/** Casco convexo por barrido monotono de Andrew. */
const cascoConvexo = (puntos: readonly PuntoPlano[]): readonly PuntoPlano[] => {
  const ordenados = [...puntos].sort((a, b) => a[0] - b[0] || a[1] - b[1])

  if (ordenados.length < 3) return ordenados

  return [
    ...construirCadena(ordenados).slice(0, -1),
    ...construirCadena([...ordenados].reverse()).slice(0, -1),
  ]
}

/**
 * Cuan convexo es el poligono, entre 0 y 1: su area dividida por la de su casco
 * convexo. Un poligono sin entrantes da 1.
 *
 * Es lo que distingue una parcela de la vegetacion del plano. Los arboles
 * comparten el color de los lotes, asi que por tono no se pueden separar, pero
 * una parcela siempre es convexa (rectangulo, trapecio o triangulo) y una copa
 * de arbol no. Medido sobre este plano: las parcelas dan de 0.95 para arriba y
 * los arboles 0.73 para abajo.
 *
 * Se usa convexidad y no "cuan rectangular es" justamente por los lotes
 * triangulares del borde del arroyo: son parcelas legitimas que llenan solo la
 * mitad de su rectangulo envolvente, y un criterio de rectangularidad las
 * descartaria junto con los arboles.
 */
export const convexidad = (puntos: readonly PuntoPlano[]): number => {
  const casco = cascoConvexo(puntos)

  if (casco.length < 3) return 0

  const areaCasco = areaDelPoligono(casco)

  return areaCasco === 0 ? 0 : areaDelPoligono(puntos) / areaCasco
}
