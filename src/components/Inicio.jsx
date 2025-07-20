import { useEffect, useRef, useState } from 'react'
import especialistasIcon from '../assets/especialistas.png'
import masdeIcon from '../assets/masde.png'
import compromisoIcon from '../assets/compromiso.png'
import desarrollosIcon from '../assets/desarrollos.png'

const Inicio = () => {
  const sectionRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            
            // Si es móvil y es una feature card, añadir hover automático
            if (isMobile && entry.target.classList.contains('feature-card')) {
              setTimeout(() => {
                entry.target.classList.add('mobile-hover')
              }, 200) // Pequeño delay para el efecto
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll('.animate-fade-in')
    elements?.forEach((el) => observer.observe(el))

    return () => {
      elements?.forEach((el) => observer.unobserve(el))
      window.removeEventListener('resize', checkMobile)
    }
  }, [isMobile])

  return (
    <section ref={sectionRef} className="inicio-section">
      <div className="inicio-container">
        <div className="inicio-content">
          <h2 className="inicio-title animate-fade-in title-underline">
            Bienvenidos a Conterra
          </h2>
          <h3 className="inicio-subtitle animate-fade-in">
            15 años creando espacios para la vida
          </h3>
          
          <div className="inicio-text animate-fade-in">
            <p>
              En Conterra, la experiencia y el compromiso nos definen. Con 15 años dedicados al
              desarrollo de lotes, hemos acompañado a cientos de familias en el emocionante
              proceso de construir sus sueños desde cero.
            </p>
          </div>

          <div className="inicio-features">
            <div className="feature-card first-card animate-fade-in">
              <div className="feature-icon">
                <img src={especialistasIcon} alt="Especialistas" />
              </div>
              <h4>Especialistas en desarrollo de lotes</h4>
              <p>
                Desde nuestros inicios, nos enfocamos en crear soluciones inmobiliarias que respondan 
                a las verdaderas necesidades de quienes buscan un lugar para crecer y desarrollarse.
              </p>
            </div>

            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <img src={masdeIcon} alt="Más de 1000" />
              </div>
              <h4>Más de 1000 terrenos entregados</h4>
              <p>
                A lo largo de nuestra historia, más de 1000 terrenos han sido entregados a familias
                que confiaron en Conterra para dar el primer paso hacia un nuevo comienzo.
              </p>
            </div>

            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <img src={compromisoIcon} alt="Compromiso" />
              </div>
              <h4>Compromiso, confianza y transparencia</h4>
              <p>
                Mantenemos una relación cercana y transparente, trabajando con profesionales que
                garantizan procesos ágiles y personalizados en cada etapa del proyecto.
              </p>
            </div>

            <div className="feature-card animate-fade-in">
              <div className="feature-icon">
                <img src={desarrollosIcon} alt="Desarrollos" />
              </div>
              <h4>Desarrollos que se adaptan a tu vida</h4>
              <p>
                Ubicaciones estratégicas, servicios esenciales y entornos pensados para el bienestar.
                Priorizamos la calidad urbana y el acceso a espacios verdes.
              </p>
            </div>
          </div>

          <div className="inicio-cta animate-fade-in">
            <h4>Construye tu futuro con Conterra</h4>
            <p>
              Si estás buscando el lugar ideal para tu próxima casa o tu inversión, te invitamos a
              conocer nuestras opciones y sumarte a las más de mil familias que ya han confiado en
              Conterra.
            </p>
            <p className="cta-highlight">
              ¡Contáctanos y da el primer paso hacia el futuro que imaginás!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Inicio 