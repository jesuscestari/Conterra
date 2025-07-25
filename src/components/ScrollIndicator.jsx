import './ScrollIndicator.css'

function ScrollIndicator({ text = "Desliza para ver más", onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Scroll suave hacia abajo por defecto
      if (window.lenis) {
        window.lenis.scrollTo(window.innerHeight, {
          duration: 1.2
        })
      } else {
        // Fallback para scroll nativo
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <div className="scroll-indicator" onClick={handleClick}>
      <div className="scroll-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M7 13L12 18L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span>{text}</span>
    </div>
  )
}

export default ScrollIndicator 