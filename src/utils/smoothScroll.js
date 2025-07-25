// Función para scroll suave a un elemento específico
export const scrollToElement = (selector, offset = 0) => {
  const element = document.querySelector(selector)
  if (element && window.lenis) {
    window.lenis.scrollTo(element, {
      offset: offset,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    })
  }
}

// Función para scroll suave a una posición específica
export const scrollToPosition = (position, duration = 1.2) => {
  if (window.lenis) {
    window.lenis.scrollTo(position, {
      duration: duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    })
  }
}

// Función para scroll al inicio de la página
export const scrollToTop = () => {
  scrollToPosition(0)
} 