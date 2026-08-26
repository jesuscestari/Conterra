// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { LeyendaPrecios } from '@/components/plano/LeyendaPrecios'
import { textoSobre } from '@/lib/plano/colores'

import { unaCategoria } from '../ayuda/lotes'

const CATEGORIAS = [
  unaCategoria({ id: 'c1', nombre: 'CAT1', color: '#99e5c0', precioUsd: 16_000, orden: 1 }),
  unaCategoria({ id: 'c2', nombre: 'CAT2', color: '#fff2bc', precioUsd: 18_000, orden: 2 }),
]

const textoNormalizado = (): string =>
  document.body.textContent!.replace(/[\s ]+/g, ' ').trim()

afterEach(cleanup)

describe('LeyendaPrecios', () => {
  it('muestra un precio por categoría', () => {
    render(<LeyendaPrecios categorias={CATEGORIAS} />)

    expect(textoNormalizado()).toContain('Precios:')
    expect(textoNormalizado()).toContain('16.000')
    expect(textoNormalizado()).toContain('18.000')
  })

  /** El nombre es de uso interno: a la visita lo que la conecta con el mapa es el color. */
  it('no muestra el nombre de la categoría', () => {
    render(<LeyendaPrecios categorias={CATEGORIAS} />)

    expect(textoNormalizado()).not.toContain('CAT1')
    expect(textoNormalizado()).not.toContain('CAT2')
  })

  it('pinta cada precio con el color de su categoría', () => {
    const { container } = render(<LeyendaPrecios categorias={CATEGORIAS} />)
    const fondos = [...container.querySelectorAll('span[style]')].map(
      (nodo) => (nodo as HTMLElement).style.backgroundColor,
    )

    expect(fondos).toEqual(['rgb(153, 229, 192)', 'rgb(255, 242, 188)'])
  })

  /** El administrador elige el color, así que el texto tiene que adaptarse solo. */
  it('elige el color de texto que se lee sobre cada fondo', () => {
    const oscura = unaCategoria({ id: 'c3', color: '#1a1a1a', precioUsd: 30_000 })
    const { container } = render(<LeyendaPrecios categorias={[oscura]} />)
    const chip = container.querySelector('span[style]') as HTMLElement

    expect(chip.style.color).toBe('rgb(255, 255, 255)')
    expect(textoSobre('#1a1a1a')).toBe('#ffffff')
  })

  it('respeta el orden en que vienen las categorías', () => {
    render(<LeyendaPrecios categorias={[...CATEGORIAS].reverse()} />)

    expect(textoNormalizado().indexOf('18.000')).toBeLessThan(
      textoNormalizado().indexOf('16.000'),
    )
  })

  /** Un tramo a medio armar no ayuda a nadie a elegir un lote. */
  it('omite las categorías sin precio', () => {
    const sinPrecio = unaCategoria({ id: 'c9', precioUsd: null })

    render(<LeyendaPrecios categorias={[CATEGORIAS[0], sinPrecio]} />)

    expect(document.querySelectorAll('span[style]')).toHaveLength(1)
  })

  it('no dibuja nada si ninguna categoría tiene precio', () => {
    const { container } = render(
      <LeyendaPrecios categorias={[unaCategoria({ precioUsd: null })]} />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('no dibuja nada si no hay categorías', () => {
    const { container } = render(<LeyendaPrecios categorias={[]} />)

    expect(container.innerHTML).toBe('')
  })
})
