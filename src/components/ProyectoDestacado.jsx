import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import example from '../assets/example.jpg'
import { NaturalezaIcon, CalidadIcon, SeguridadIcon } from './icons'

const ProyectoDestacado = () => {
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

  // Información sobre los desarrollos de Conterra
  const desarrollosInfo = {
    caracteristicas: [
      { 
        IconComponent: NaturalezaIcon, 
        titulo: 'Naturaleza', 
        descripcion: 'Lotes diseñados para integrar espacios verdes y preservar el entorno natural, creando barrios que conviven en armonía con la naturaleza.' 
      },
      { 
        IconComponent: CalidadIcon, 
        titulo: 'Calidad', 
        descripcion: 'Desarrollos planificados con altos estándares, infraestructura completa y servicios esenciales para garantizar la mejor calidad de vida.' 
      },
      { 
        IconComponent: SeguridadIcon, 
        titulo: 'Seguridad', 
        descripcion: 'Barrios cerrados con accesos controlados, vigilancia perimetral y diseño urbano que prioriza la tranquilidad y protección de las familias.' 
      }
    ],
    destacados: [
    
    ]
  }

  return (
    <section ref={sectionRef} className="proyecto-destacado-section">
      <div className="proyecto-destacado-container">
        <div className="proyecto-destacado-header animate-fade-in">
          <h2 className="title-underline">Nuestros Desarrollos</h2>
          <p>Especialistas en lotes para barrios cerrados</p>
        </div>

        <div className="proyecto-destacado-content">
          {/* Información principal de desarrollos */}
          <div className="proyecto-principal">
            <div className="proyecto-info animate-fade-in">
              <div className="proyecto-texto">
                <h3 className="title-underline-left">Desarrollos que se adaptan a tu vida</h3>
                <p>
                  Con 15 años de experiencia en el sector, en Conterra nos especializamos en el desarrollo de lotes para barrios cerrados. 
                  Hemos entregado más de 1000 terrenos a familias que confiaron en nosotros para dar el primer paso hacia un nuevo comienzo.
                </p>
                <p>
                  Nuestros desarrollos priorizan la calidad urbana y el acceso a espacios verdes, con ubicaciones estratégicas 
                  y servicios esenciales pensados para el bienestar. Cada proyecto es planificado con compromiso, confianza y 
                  transparencia, manteniendo una relación cercana con nuestros clientes.
                </p>
              </div>
              
              
              <Link to={`/proyectos`} className="ver-proyecto-btn">
                Ver todos los desarrollos
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="proyecto-imagenes animate-fade-in">
              <div className="imagen-principal">
                <Link to="/proyectos" className="imagen-link">
                  <img src={example} alt="Desarrollos Conterra" />
                  <div className="imagen-overlay">
                    <span className="ver-mas-text">Ver más</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              </div>
              <div className="imagenes-secundarias">
                <Link to="/proyectos" className="imagen-link">
                  <img src={example} alt="Lotes para barrios cerrados" />
                  <div className="imagen-overlay">
                    <span className="ver-mas-text">Ver más</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
                <Link to="/proyectos" className="imagen-link">
                  <img src={example} alt="Terrenos con espacios verdes" />
                  <div className="imagen-overlay">
                    <span className="ver-mas-text">Ver más</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Características principales */}
          <div 
            className="caracteristicas-grid animate-fade-in"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
          >
            {desarrollosInfo.caracteristicas.map((caracteristica, index) => (
              <div key={index} className="caracteristica-item">
                <div className="caracteristica-icon">
                  <caracteristica.IconComponent size={32} />
                </div>
                <div className="caracteristica-content">
                  <h4>{caracteristica.titulo}</h4>
                  <p>{caracteristica.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProyectoDestacado 