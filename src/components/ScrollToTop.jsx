import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToTop } from '../utils/smoothScroll'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Usar Lenis para scroll suave al cambiar de página
    const timer = setTimeout(() => {
      if (window.lenis) {
        scrollToTop()
      } else {
        // Fallback al scroll nativo si Lenis no está disponible
        window.scrollTo(0, 0)
      }
    }, 100) // Pequeño delay para asegurar que Lenis esté inicializado

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

export default ScrollToTop 