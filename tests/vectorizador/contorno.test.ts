import { describe, expect, it } from 'vitest'

import { trazarContorno } from '../../scripts/vectorizar-plano/contorno'
import { etiquetarComponentes } from '../../scripts/vectorizar-plano/etiquetado'
import { mascaraDeTexto } from '../ayuda/mascaras'

const contornoDe = (filas: readonly string[]) => {
  const etiquetado = etiquetarComponentes(mascaraDeTexto(filas))
  const [componente] = etiquetado.componentes
  return { contorno: trazarContorno(etiquetado, componente), componente }
}

describe('trazarContorno', () => {
  it('recorre el borde de un rectángulo', () => {
    const { contorno } = contornoDe([
      '......',
      '.####.',
      '.####.',
      '.####.',
      '......',
    ])

    expect(contorno).not.toBeNull()

    const puntos = contorno as readonly (readonly [number, number])[]
    // Un rectangulo de 4x3 tiene 10 pixeles de borde.
    expect(puntos).toHaveLength(10)

    for (const [x, y] of puntos) {
      expect(x).toBeGreaterThanOrEqual(1)
      expect(x).toBeLessThanOrEqual(4)
      expect(y).toBeGreaterThanOrEqual(1)
      expect(y).toBeLessThanOrEqual(3)
    }
  })

  it('arranca por el píxel de más arriba a la izquierda', () => {
    const { contorno } = contornoDe(['....', '.##.', '.##.', '....'])

    expect((contorno as readonly (readonly [number, number])[])[0]).toEqual([1, 1])
  })

  it('no repite el punto inicial al cerrar', () => {
    const { contorno } = contornoDe(['.....', '.###.', '.###.', '.....'])
    const puntos = contorno as readonly (readonly [number, number])[]

    expect(puntos.at(-1)).not.toEqual(puntos[0])
  })

  it('sigue el borde de una forma con entrantes', () => {
    const { contorno } = contornoDe([
      '.......',
      '.#####.',
      '.#...#.',
      '.#####.',
      '.......',
    ])
    const puntos = contorno as readonly (readonly [number, number])[]

    // Recorre solo el contorno exterior, no el hueco interior.
    expect(puntos.length).toBeGreaterThanOrEqual(12)
    expect(puntos.some(([x, y]) => x === 3 && y === 2)).toBe(false)
  })

  it('devuelve null si la mancha es demasiado chica para tener contorno', () => {
    const { contorno } = contornoDe(['...', '.#.', '...'])

    expect(contorno).toBeNull()
  })

  it('no se cuelga con formas de un píxel de ancho', () => {
    const { contorno } = contornoDe([
      '.....',
      '.###.',
      '.....',
    ])

    expect(contorno).not.toBeNull()
    expect((contorno as readonly unknown[]).length).toBeGreaterThanOrEqual(3)
  })
})
