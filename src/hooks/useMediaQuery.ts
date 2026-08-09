import { useCallback, useSyncExternalStore } from 'react'

/** Ancho por debajo del cual se usa la disposición compacta (breakpoint `sm`). */
export const CONSULTA_PANTALLA_CHICA = '(max-width: 639px)'

/**
 * Sigue una media query del navegador.
 *
 * Va por `useSyncExternalStore` y no por estado mas efecto porque es
 * exactamente eso: una suscripcion a algo externo a React. Ademas evita el
 * parpadeo de un primer render con el valor equivocado.
 */
export const useMediaQuery = (consulta: string): boolean => {
  const suscribir = useCallback(
    (alCambiar: () => void) => {
      const lista = window.matchMedia(consulta)

      lista.addEventListener('change', alCambiar)

      return () => lista.removeEventListener('change', alCambiar)
    },
    [consulta],
  )

  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    // En el servidor no hay viewport: se asume pantalla grande y se corrige al
    // hidratar. La vista del plano se arma en el cliente igual.
    () => false,
  )
}

export const useEsPantallaChica = (): boolean => useMediaQuery(CONSULTA_PANTALLA_CHICA)
