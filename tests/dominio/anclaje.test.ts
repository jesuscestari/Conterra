import { describe, expect, it } from 'vitest'

import { calcularAnclaje } from '@/components/lote/anclaje'

const ANCHO_POPUP = 288
const MARGEN = 12
const MITAD = ANCHO_POPUP / 2

const mapa = { ancho: 1200, alto: 800 }

/** Y suficientemente abajo como para que el popup entre por encima del lote. */
const ABAJO = 600

describe('calcularAnclaje', () => {
  it('deja el popup centrado sobre el lote cuando hay lugar', () => {
    const anclaje = calcularAnclaje([600, ABAJO], mapa)

    expect(anclaje.x).toBe(600)
    expect(anclaje.orientacion).toBe('arriba')
    expect(anclaje.y).toBeLessThan(ABAJO)
  })

  it('lo corre hacia adentro si el lote está pegado al borde izquierdo', () => {
    const anclaje = calcularAnclaje([5, ABAJO], mapa)

    expect(anclaje.x).toBe(MITAD + MARGEN)
  })

  it('lo corre hacia adentro si el lote está pegado al borde derecho', () => {
    const anclaje = calcularAnclaje([mapa.ancho - 5, ABAJO], mapa)

    expect(anclaje.x).toBe(mapa.ancho - MITAD - MARGEN)
  })

  it('nunca deja que el popup se salga del mapa', () => {
    for (const x of [-500, 0, 100, 600, 1199, 5000]) {
      const { x: anclado } = calcularAnclaje([x, ABAJO], mapa)

      expect(anclado - MITAD).toBeGreaterThanOrEqual(MARGEN - 0.001)
      expect(anclado + MITAD).toBeLessThanOrEqual(mapa.ancho - MARGEN + 0.001)
    }
  })

  it('abre hacia abajo cuando el lote está muy arriba', () => {
    const anclaje = calcularAnclaje([600, 20], mapa)

    expect(anclaje.orientacion).toBe('abajo')
    expect(anclaje.y).toBeGreaterThan(20)
  })

  /** En un celular angosto el popup no entra: se centra y se acepta que sobresalga. */
  it('centra el popup si el mapa es más angosto que el popup', () => {
    const angosto = { ancho: 200, alto: 600 }

    expect(calcularAnclaje([10, 400], angosto).x).toBe(100)
    expect(calcularAnclaje([190, 400], angosto).x).toBe(100)
  })

  it('no depende de la altura del contenedor, solo de la del lote', () => {
    const bajo = calcularAnclaje([600, ABAJO], { ancho: 1200, alto: 10_000 })
    const alto = calcularAnclaje([600, ABAJO], mapa)

    expect(bajo).toEqual(alto)
  })
})
