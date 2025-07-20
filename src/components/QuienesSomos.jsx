import { useEffect, useRef } from 'react'
import exampleImg from '../assets/example.jpg'

const QuienesSomos = () => {
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

  const equipo = [
    {
      nombre: 'Joaquín Tonneller',
      rol: 'Martillero y Corredor Inmobiliario',
      descripcion: 'Graduado de la Cámara Inmobiliaria Argentina (GDI 2013). Especialista en gestión y desarrollo de negocios inmobiliarios en Udesa, con amplia experiencia en el sector inmobiliario argentino.',
    },
    {
      nombre: 'Alejandro Aragón',
      rol: 'Ingeniero Civil',
      descripcion: 'Graduado de la UB Universidad de Belgrano. Especialización en Desarrollos Inmobiliarios por la Cámara Inmobiliaria Argentina, enfocado en la planificación y ejecución de proyectos sustentables.',
    },
    {
      nombre: 'Florencia Aragón',
      rol: 'Arquitecta',
      descripcion: 'Graduada de la UB Universidad de Belgrano. Especialista en diseño urbano y arquitectura residencial, con enfoque en la integración de espacios naturales en desarrollos inmobiliarios.',
    }
  ]

  return (
    <section ref={sectionRef} className="quienes-somos-section-new">
      <div className="quienes-somos-container-new">
        {/* Header principal */}
        <div className="quienes-somos-header-new">
          <span className="small-header-new">NUESTRO EQUIPO</span>
          <h2 className="main-title-new">Quiénes Somos</h2>
          <p className="subtitle-new">
            Profesionales comprometidos con la excelencia y la innovación en el desarrollo inmobiliario
          </p>
        </div>

        {/* Sección principal con imagen y contenido */}
        <div className="content-section-new">
          <div className="imagen-principal-new" style={{opacity: 1, transform: 'translateY(0)'}}>
            <img src={exampleImg} alt="Equipo Conterra" />
            <div className="image-overlay-new">
              <div className="overlay-content-new">
                <h3>15 años de experiencia</h3>
                <p>Construyendo sueños, creando futuro</p>
              </div>
            </div>
          </div>

          <div className="texto-principal-new" style={{opacity: 1, transform: 'translateY(0)'}}>
            <h3 className="content-title-new">El equipo que hace posible tu nuevo hogar</h3>
            <p className="content-text-new">
              En Conterra, nuestro equipo está formado por profesionales altamente capacitados 
              y comprometidos con la excelencia. Cada miembro aporta su experiencia y pasión 
              para hacer realidad los proyectos inmobiliarios más ambiciosos.
            </p>
            <div className="stats-new">
              <div className="stat-item-new">
                <span className="stat-number-new">15+</span>
                <span className="stat-label-new">Años de experiencia</span>
              </div>
              <div className="stat-item-new">
                <span className="stat-number-new">1000+</span>
                <span className="stat-label-new">Proyectos completados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards del equipo */}
        <div className="equipo-grid-new">
          {equipo.map((miembro, index) => (
            <div 
              key={index} 
              className="miembro-card-new"
              style={{opacity: 1, transform: 'translateY(0)'}}
            >
              <div className="card-header-new">
                <h4 className="miembro-nombre-new">{miembro.nombre}</h4>
                <span className="miembro-rol-new">{miembro.rol}</span>
              </div>
              <p className="miembro-descripcion-new">{miembro.descripcion}</p>
              <div className="card-accent-new"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuienesSomos 