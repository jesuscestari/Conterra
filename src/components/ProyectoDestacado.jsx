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

  // Proyecto destacado (puedes cambiar cuál se muestra)
  const proyectoDestacado = {
    id: 'saint-francis',
    nombre: 'Saint Francis',
    subtitulo: 'Un barrio distinguido con historia y naturaleza',
    descripcion: 'Barrio abierto único en Capilla del Señor, con 290 lotes de amplias dimensiones entre 1500 m² y 8700 m². Elegancia y ambiente sereno con más de 23.000 m² de áreas verdes.',
    destacados: ['290 lotes premium', '23.000 m² áreas verdes', 'Instalaciones históricas'],
    ubicacion: 'Capilla del Señor',
    caracteristicas: [
      { IconComponent: NaturalezaIcon, titulo: 'Naturaleza', descripcion: 'Convivir con la belleza natural del Delta, vistas privilegiadas que mejoran tu calidad de vida.' },
      { IconComponent: CalidadIcon, titulo: 'Calidad', descripcion: 'Descubrir en cada rincón esos detalles que hacen de tu día a día una experiencia única.' },
      { IconComponent: SeguridadIcon, titulo: 'Seguridad', descripcion: 'Convivir con la belleza natural del Delta, vistas privilegiadas que mejoran tu calidad de vida.' }
    ]
  }

  return (
    <section ref={sectionRef} className="proyecto-destacado-section">
      <div className="proyecto-destacado-container">
        <div className="proyecto-destacado-header animate-fade-in">
          <h2 className="title-underline">Nuestros Desarrollos</h2>
        </div>

        <div className="proyecto-destacado-content">
          {/* Características principales */}
          <div 
            className="caracteristicas-grid animate-fade-in"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
          >
            {proyectoDestacado.caracteristicas.map((caracteristica, index) => (
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

          {/* Proyecto principal */}
          <div className="proyecto-principal">
            <div className="proyecto-info animate-fade-in">
              <div className="proyecto-texto">
                <h3 className="title-underline-left">El lugar que estabas esperando</h3>
                <p>
                  Sabemos que tu hogar es el lugar más importante, por eso ALBOR fue diseñado para brindar una experiencia única de calidad 
                  de vida. Dos edificios independientes con loft amenities de primera categoría pensados para hacer de tu día a día una 
                  experiencia superlativa.
                </p>
                <p>
                  Tu tranquilidad y la de tu familia son prioridad para nosotros, por lo que contamos con seguridad 24 hs, cerco perimetral y control 
                  de acceso. De esta manera podrás disfrutar de tu hogar con la paz y protección que buscas.
                </p>
              </div>
              
              <Link to={`/proyectos`} className="ver-proyecto-btn">
                Ver más 
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="proyecto-imagenes animate-fade-in">
              <div className="imagen-principal">
                <img src={example} alt={proyectoDestacado.nombre} />
              </div>
              <div className="imagenes-secundarias">
                <img src={example} alt={`${proyectoDestacado.nombre} - Vista 2`} />
                <img src={example} alt={`${proyectoDestacado.nombre} - Vista 3`} />
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="proyecto-cta animate-fade-in">
            <Link to="/proyectos" className="ver-todos-proyectos-btn">
              Ver todos los desarrollos
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProyectoDestacado 