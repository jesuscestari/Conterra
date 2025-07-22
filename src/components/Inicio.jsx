import { useEffect, useRef } from 'react'
import especialistasIcon from '../assets/especialistas.png'
import masdeIcon from '../assets/masde.png'
import compromisoIcon from '../assets/compromiso.png'
import desarrollosIcon from '../assets/desarrollos.png'
import saintImage1 from '../assets/SAINT/dji_fly_20250701_172212_0146_1751418034982_photo.webp'
import saintImage2 from '../assets/SAINT/dji_fly_20250701_172332_0154_1751468122332_photo.webp'

const Inicio = () => {
  const newSectionRef = useRef(null)
  const featuresSectionRef = useRef(null)
  
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

    // Pequeño delay para asegurar que los elementos estén renderizados
    const setupObserver = () => {
      // Observar elementos de la nueva sección
      const newElements = newSectionRef.current?.querySelectorAll('.animate-fade-in')
      newElements?.forEach((el) => observer.observe(el))

      // Observar elementos de la sección de features
      const featureElements = featuresSectionRef.current?.querySelectorAll('.animate-fade-in')
      featureElements?.forEach((el) => observer.observe(el))

      return { newElements, featureElements }
    }

    const { newElements, featureElements } = setupObserver()

    return () => {
      newElements?.forEach((el) => observer.unobserve(el))
      featureElements?.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <>
      {/* Nueva sección con el diseño de la imagen de referencia */}
      <section ref={newSectionRef} className="inicio-section-new" style={{display: 'block', visibility: 'visible'}}>
        <div className="inicio-container-new">
          <div className="inicio-images-section">
            <div className="image-large" style={{opacity: 1, transform: 'translateY(0)'}}>
              <img src={saintImage1} alt="Saint Francis - Vista aérea" />
            </div>
            <div className="image-small" style={{opacity: 1, transform: 'translateY(0)'}}>
              <img src={saintImage2} alt="Saint Francis - Áreas verdes" />
            </div>
          </div>
          
          <div className="inicio-text-section">
            <div className="text-content" style={{opacity: 1, transform: 'translateY(0)'}}>
              <span className="small-header">CONTERRA</span>
              <h1 className="main-title">15 años creando espacios para la vida.</h1>
              
              <div className="description-text">
                <p>
                  En Conterra, la experiencia y el compromiso nos definen. Con 15 años dedicados al
                  desarrollo de lotes, hemos acompañado a cientos de familias en el emocionante
                  proceso de construir sus sueños desde cero.
                </p>
              </div>
              
              <p className="welcome-text">Bienvenidos a Conterra.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de features original */}
      <section ref={featuresSectionRef} className="inicio-features-section" style={{display: 'block', visibility: 'visible'}}>
        <div className="inicio-container">
          <div className="inicio-content">
            <div className="inicio-features">
              <div className="feature-card first-card" style={{opacity: 1, transform: 'translateY(0)'}}>
                <div className="feature-icon">
                  <img src={especialistasIcon} alt="Especialistas" />
                </div>
                <h4>Especialistas en desarrollo de lotes</h4>
                <p>
                  Desde nuestros inicios, nos enfocamos en crear soluciones inmobiliarias que respondan 
                  a las verdaderas necesidades de quienes buscan un lugar para crecer y desarrollarse.
                </p>
              </div>

              <div className="feature-card" style={{opacity: 1, transform: 'translateY(0)'}}>
                <div className="feature-icon">
                  <img src={masdeIcon} alt="Más de 1000" />
                </div>
                <h4>Más de 1000 terrenos entregados</h4>
                <p>
                  A lo largo de nuestra historia, más de 1000 terrenos han sido entregados a familias
                  que confiaron en Conterra para dar el primer paso hacia un nuevo comienzo.
                </p>
              </div>

              <div className="feature-card" style={{opacity: 1, transform: 'translateY(0)'}}>
                <div className="feature-icon">
                  <img src={compromisoIcon} alt="Compromiso" />
                </div>
                <h4>Compromiso, confianza y transparencia</h4>
                <p>
                  Mantenemos una relación cercana y transparente, trabajando con profesionales que
                  garantizan procesos ágiles y personalizados en cada etapa del proyecto.
                </p>
              </div>

              <div className="feature-card" style={{opacity: 1, transform: 'translateY(0)'}}>
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

           
          </div>
        </div>
      </section>
    </>
  )
}

export default Inicio 