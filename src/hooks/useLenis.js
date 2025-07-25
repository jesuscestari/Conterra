import { useEffect } from 'react'
import Lenis from 'lenis'

export function useLenis() {
  useEffect(() => {
    // Añadir clase CSS al html
    document.documentElement.classList.add('lenis')

    // Inicializar Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    // Exponer Lenis globalmente para las funciones utilitarias
    window.lenis = lenis

    // Función para actualizar el scroll
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup al desmontar
    return () => {
      document.documentElement.classList.remove('lenis')
      lenis.destroy()
    }
  }, [])
} 