import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import example from '../assets/example.jpg'

const Projects = () => {
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

  const proyectos = [
    {
      id: 'saint-francis',
      nombre: 'Saint Francis',
      subtitulo: 'Un barrio distinguido con historia y naturaleza',
      descripcion: 'Barrio abierto único en Capilla del Señor, con 290 lotes de amplias dimensiones entre 1500 m² y 8700 m². Elegancia y ambiente sereno con más de 23.000 m² de áreas verdes.',
      destacados: ['290 lotes premium', '23.000 m² áreas verdes', 'Instalaciones históricas'],
      ubicacion: 'Capilla del Señor'
    },
    {
      id: 'fincas-florida',
      nombre: 'Fincas de la Florida',
      subtitulo: 'Tu espacio de tranquilidad en Zárate',
      descripcion: 'Barrio abierto con 144 lotes de 600 m² en Zárate. Entorno natural privilegiado con gran arboleda perimetral y atardeceres únicos.',
      destacados: ['144 lotes de 600 m²', 'Arboleda perimetral', 'A 15 min del centro'],
      ubicacion: 'Zárate'
    },
    {
      id: 'praderas-cardales-i',
      nombre: 'Praderas de Cardales I',
      subtitulo: 'Lotes y atardeceres generosos',
      descripcion: 'Barrio abierto de 128 lotes de 2000 m² cada uno. Ubicación estratégica con atmósfera de paz y naturaleza exuberante.',
      destacados: ['128 lotes de 2000 m²', 'Amplios horizontes', 'Naturaleza incomparable'],
      ubicacion: 'Cardales'
    },
    {
      id: 'praderas-cardales-ii',
      nombre: 'Praderas de Cardales II',
      subtitulo: 'Un nuevo horizonte en Cardales',
      descripcion: 'Barrio abierto sin expensas con 200 lotes desde 1000 m² hasta 1600 m². Naturaleza, tranquilidad y equipamiento deportivo completo.',
      destacados: ['200 lotes sin expensas', 'Plaza y deportes', 'SUM con parrillas'],
      ubicacion: 'Cardales'
    },
    {
      id: 'praderas-cardales-iii',
      nombre: 'Praderas de Cardales III',
      subtitulo: 'Viví el deporte todos los días',
      descripcion: 'Barrio abierto sin expensas con 130 lotes desde 1000 m² hasta 1500 m². Énfasis en amenities deportivos y espacios comunes.',
      destacados: ['130 lotes', 'Cancha pádel y fútbol', 'Gimnasio al aire libre'],
      ubicacion: 'Cardales'
    },
    {
      id: 'el-lazo',
      nombre: 'El Lazo',
      subtitulo: 'La conexión del campo con el pueblo',
      descripcion: 'Exclusivo barrio abierto con 228 lotes desde 1500 hasta 3000 m². A 5 minutos del centro de Capilla del Señor con más de 30.000 m² de áreas verdes.',
      destacados: ['228 lotes exclusivos', '30.000 m² áreas verdes', '4 canchas fútbol tenis'],
      ubicacion: 'Capilla del Señor'
    }
  ]

  return (
    <div className="projects">
      <Navbar />
      <Hero 
        title="NUESTROS PROYECTOS"
        subtitle="Desarrollos pensados para tu futuro"
        showButton={false}
        height="40vh"
      />
      
      <section ref={sectionRef} className="all-proyectos-section">
        <div className="proyectos-container">
          <div className="proyectos-header animate-fade-in">
            <h2>Todos nuestros desarrollos</h2>
            <p>Encontrá el lugar perfecto para construir tu hogar entre nuestros exclusivos proyectos</p>
          </div>

          <div className="proyectos-grid">
            {proyectos.map((proyecto, index) => (
              <Link 
                to={`/proyectos/${proyecto.id}`} 
                key={proyecto.id}
                className="proyecto-card animate-fade-in"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="proyecto-image">
                  <img src={example} alt={proyecto.nombre} />
                  <div className="proyecto-overlay">
                    <span className="ver-mas">Ver más</span>
                  </div>
                </div>
                
                <div className="proyecto-content">
                  <h3>{proyecto.nombre}</h3>
                  <h4>{proyecto.subtitulo}</h4>
                  <p>{proyecto.descripcion}</p>
                  
                  <div className="proyecto-destacados">
                    {proyecto.destacados.map((item, idx) => (
                      <span key={idx} className="destacado">{item}</span>
                    ))}
                  </div>
                  
                  <div className="proyecto-footer">
                    <span className="ubicacion">
                      <i className="fas fa-map-marker-alt"></i> {proyecto.ubicacion}
                    </span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Projects 