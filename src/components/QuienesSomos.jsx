import { useEffect, useRef } from 'react'

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
      imagen: 'https://via.placeholder.com/300x300'
    },
    {
      nombre: 'Alejandro Aragón',
      rol: 'Ingeniero Civil',
      descripcion: 'Graduado de la UB Universidad de Belgrano. Especialización en Desarrollos Inmobiliarios por la Cámara Inmobiliaria Argentina, enfocado en la planificación y ejecución de proyectos sustentables.',
      imagen: 'https://via.placeholder.com/300x300'
    },
    {
      nombre: 'Florencia Aragón',
      rol: 'Arquitecta',
      descripcion: 'Graduada de la UB Universidad de Belgrano. Especialista en diseño urbano y arquitectura residencial, con enfoque en la integración de espacios naturales en desarrollos inmobiliarios.',
      imagen: 'https://via.placeholder.com/300x300'
    }
  ]

  return (
    <section ref={sectionRef} className="quienes-somos-section">
      <div className="quienes-somos-container">
        <div className="quienes-somos-header animate-fade-in">
          <h2>Quiénes Somos</h2>
          <p>El equipo que hace posible tu nuevo hogar</p>
        </div>

        <div className="equipo-grid">
          {equipo.map((miembro, index) => (
            <div 
              key={index} 
              className="miembro-card animate-fade-in"
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className="miembro-image">
                <img src={miembro.imagen} alt={miembro.nombre} />
                <div className="image-overlay"></div>
              </div>
              
              <div className="miembro-content">
                <h3>{miembro.nombre}</h3>
                <h4>{miembro.rol}</h4>
                <p>{miembro.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="valores-section animate-fade-in">
          <h3>Nuestros Valores</h3>
          <div className="valores-grid">
            <div className="valor-item">
              <div className="valor-icon">
                <i className="fas fa-handshake"></i>
              </div>
              <h4>Confianza</h4>
              <p>Construimos relaciones duraderas basadas en la transparencia y el compromiso.</p>
            </div>
            
            <div className="valor-item">
              <div className="valor-icon">
                <i className="fas fa-award"></i>
              </div>
              <h4>Excelencia</h4>
              <p>Cada proyecto refleja nuestros altos estándares de calidad y atención al detalle.</p>
            </div>
            
            <div className="valor-item">
              <div className="valor-icon">
                <i className="fas fa-users"></i>
              </div>
              <h4>Familia</h4>
              <p>Entendemos que cada lote es el inicio de un hogar y lo tratamos con ese respeto.</p>
            </div>
            
            <div className="valor-item">
              <div className="valor-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h4>Sustentabilidad</h4>
              <p>Desarrollamos proyectos que respetan y potencian el entorno natural.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuienesSomos 