import type { LoteGeometria, PlanoGeometria, PuntoPlano } from '@/lib/plano/tipos'

/** Parcela triangular con la esquina superior izquierda en (x, y). */
export const unaParcela = (
  id: string,
  numero: number,
  [x, y]: PuntoPlano,
  lado = 10,
): LoteGeometria => ({
  id,
  numero,
  puntos: [
    [x, y],
    [x + lado, y],
    [x + lado, y + lado],
  ],
  centroide: [x + lado / 2, y + lado / 2],
  areaPx: (lado * lado) / 2,
  superficieM2: 800,
})

export const unPlano = (lotes: readonly LoteGeometria[]): PlanoGeometria => ({
  ancho: 100,
  alto: 60,
  generadoEn: '2026-02-01T12:00:00.000Z',
  metrosPorPixel: 1.4,
  limites: { x: 0, y: 0, ancho: 100, alto: 60 },
  lotes,
})
