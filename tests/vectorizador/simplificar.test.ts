import { describe, expect, it } from 'vitest'

import { simplificarContorno } from '../../scripts/vectorizar-plano/simplificar'

import type { PuntoPlano } from '@/lib/plano/tipos'

/** Borde de un rectángulo, píxel a píxel: muchos puntos sobre pocas rectas. */
const bordeDeRectangulo = (ancho: number, alto: number): PuntoPlano[] => {
  const puntos: PuntoPlano[] = []
  for (let x = 0; x < ancho; x += 1) puntos.push([x, 0])
  for (let y = 1; y < alto; y += 1) puntos.push([ancho - 1, y])
  for (let x = ancho - 2; x >= 0; x -= 1) puntos.push([x, alto - 1])
  for (let y = alto - 2; y >= 1; y -= 1) puntos.push([0, y])
  return puntos
}

describe('simplificarContorno', () => {
  it('reduce el borde de un rectángulo a sus esquinas', () => {
    const simplificado = simplificarContorno(bordeDeRectangulo(20, 12), 0.9)

    expect(simplificado.length).toBeLessThanOrEqual(6)
    expect(simplificado.length).toBeGreaterThanOrEqual(4)
  })

  it('conserva los puntos extremos de la forma', () => {
    const simplificado = simplificarContorno(bordeDeRectangulo(20, 12), 0.9)
    const xs = simplificado.map((p) => p[0])
    const ys = simplificado.map((p) => p[1])

    expect(Math.min(...xs)).toBe(0)
    expect(Math.max(...xs)).toBe(19)
    expect(Math.min(...ys)).toBe(0)
    expect(Math.max(...ys)).toBe(11)
  })

  it('endereza la escalera de píxeles de una diagonal', () => {
    const escalera: PuntoPlano[] = []
    for (let i = 0; i < 20; i += 1) {
      escalera.push([i, i])
      escalera.push([i + 1, i])
    }
    escalera.push([20, 20], [0, 20])

    expect(simplificarContorno(escalera, 1.5).length).toBeLessThan(escalera.length / 2)
  })

  it('cuanto mayor la tolerancia, menos vértices', () => {
    const borde = bordeDeRectangulo(40, 25)
    const fina = simplificarContorno(borde, 0.2)
    const gruesa = simplificarContorno(borde, 5)

    expect(gruesa.length).toBeLessThanOrEqual(fina.length)
  })

  it('deja pasar los contornos que ya son mínimos', () => {
    const triangulo: PuntoPlano[] = [
      [0, 0],
      [10, 0],
      [5, 8],
    ]

    expect(simplificarContorno(triangulo, 0.9)).toEqual(triangulo)
  })

  /**
   * El contorno es un anillo cerrado y el algoritmo trabaja sobre polilineas
   * abiertas. Si se lo aplicara de una sola pasada, el cierre colapsaria y la
   * forma se perderia.
   */
  it('no colapsa el anillo: nunca devuelve menos de tres vértices', () => {
    for (const [ancho, alto] of [
      [6, 6],
      [30, 4],
      [4, 30],
    ]) {
      expect(simplificarContorno(bordeDeRectangulo(ancho, alto), 50).length).toBeGreaterThanOrEqual(3)
    }
  })
})
