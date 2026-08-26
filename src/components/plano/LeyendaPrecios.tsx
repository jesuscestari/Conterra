import type { CategoriaDatos } from '@/lib/categorias/tipos'
import { formatearPrecio } from '@/lib/formato'
import { textoSobre } from '@/lib/plano/colores'

interface Props {
  readonly categorias: readonly CategoriaDatos[]
}

/**
 * Lista de precios, cada uno sobre el color con el que se dibujan sus lotes.
 *
 * No lleva el nombre de la categoria: el nombre es de uso interno y a la visita
 * no le dice nada. Lo que conecta el precio con el mapa es el color, y eso ya
 * esta a la vista.
 *
 * Las categorias sin precio no aparecen: mostrar un tramo vacio no ayuda a
 * nadie a elegir un lote.
 */
export const LeyendaPrecios = ({ categorias }: Props) => {
  const conPrecio = categorias.filter((categoria) => categoria.precioUsd !== null)

  if (conPrecio.length === 0) return null

  return (
    <div className="flex w-max items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-tierra-700">Precios:</span>

      {conPrecio.map((categoria) => (
        <span
          key={categoria.id}
          style={{ backgroundColor: categoria.color, color: textoSobre(categoria.color) }}
          className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ring-black/10"
        >
          {formatearPrecio(categoria.precioUsd)}
        </span>
      ))}
    </div>
  )
}
