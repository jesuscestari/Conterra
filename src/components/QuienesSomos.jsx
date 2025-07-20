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
    <section ref={sectionRef} className="quienes-somos-section">
      <div className="quienes-somos-container">
        <div className="quienes-somos-header animate-fade-in">
          <h2 className="font-bold title-underline">Quiénes Somos</h2>
          <p className="font-regular">El equipo que hace posible tu nuevo hogar</p>
        </div>

        <div className="equipo-layout">
          {/* Imagen del equipo */}
          <div className="equipo-imagen animate-fade-in">
            <img src="https://via.placeholder.com/600x400" alt="Equipo Conterra" />
            <div className="image-overlay"></div>
          </div>

          {/* Información del equipo */}
          <div className="equipo-info">
            {equipo.map((miembro, index) => (
              <div 
                key={index} 
                className="miembro-info animate-fade-in"
                style={{ transitionDelay: `${(index + 1) * 0.2}s` }}
              >
                <h3 className="font-bold">{miembro.nombre}</h3>
                <h4 className="font-regular">{miembro.rol}</h4>
                <p className="font-regular">{miembro.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuienesSomos 