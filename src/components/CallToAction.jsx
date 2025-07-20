import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const CallToAction = () => {
  const sectionRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll('.animate-fade-in')
    elements?.forEach((el) => observer.observe(el))

    return () => {
      elements?.forEach((el) => observer.unobserve(el))
    }
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  return (
    <section ref={sectionRef} className="cta-section">
      <div 
        className="cta-background"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed'
        }}
      >
        <div className="cta-overlay"></div>
        <div className="cta-container">
          <div className="cta-content animate-fade-in">
            <h2>¿Listo para encontrar tu nuevo hogar?</h2>
            <p>
              Tu futuro hogar te está esperando. Contáctanos y da el primer paso.
            </p>
            <div className="cta-buttons">
              <Link to="/contacto" className="cta-btn primary">
                Contactanos
              </Link>
              <Link to="/proyectos" className="cta-btn secondary">
                Ver Proyectos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction 