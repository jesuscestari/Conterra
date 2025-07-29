import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// Importar imágenes de Saint Francis
import saintImage1 from '../assets/SAINT/dji_fly_20250701_172212_0146_1751418034982_photo.webp'
import saintImage2 from '../assets/SAINT/dji_fly_20250701_172326_0152_1751468124029_photo.webp'
import saintImage3 from '../assets/SAINT/dji_fly_20250701_172332_0154_1751468122332_photo.webp'

// Importar imágenes de Fincas de la Florida
import fincasImage1 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_464.webp'
import fincasImage2 from '../assets/FINCAS DE LA FLORIDA/aerea1.webp'
import fincasImage3 from '../assets/FINCAS DE LA FLORIDA/Fincas 1.webp'

// Importar imágenes de Praderas de Cardales I
import praderas1Image1 from '../assets/PRADERAS DE CARDALES 1/20220318_134641.webp'
import praderas1Image2 from '../assets/PRADERAS DE CARDALES 1/20220318_133926.webp'
import praderas1Image3 from '../assets/PRADERAS DE CARDALES 1/20220318_132853.webp'
import praderas1Image10 from '../assets/PRADERAS DE CARDALES 1/dji_export_1647217500946.webp'

// Importar imágenes de El Lazo
import elLazoImage1 from '../assets/EL LAZO/20220325_123731.webp'
import elLazoImage2 from '../assets/EL LAZO/20220325_124216.webp'
import elLazoImage3 from '../assets/EL LAZO/20220325_124011.webp'

// Importar imágenes de Praderas de Cardales II
import praderas2Image1 from '../assets/PRADERAS DE CARDALES 2/DJI_0642.webp'
import praderas2Image2 from '../assets/PRADERAS DE CARDALES 2/DJI_0659.webp'
import praderas2Image3 from '../assets/PRADERAS DE CARDALES 2/DJI_0660.webp'

// Importar imágenes de Praderas 3
import praderas3Image1 from '../assets/Praderas 3/5.webp'
import praderas3Image2 from '../assets/Praderas 3/DJI_20250718151834_0416_D.webp'
import praderas3Image3 from '../assets/Praderas 3/1.webp'

// Imagen de ejemplo para proyectos sin imágenes
import example from '../assets/example.jpg'

const Proyectos = () => {
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
      ubicacion: 'Capilla del Señor',
      imagen: saintImage1,
      imagenes: [saintImage1, saintImage2, saintImage3]
    },
    {
      id: 'fincas-florida',
      nombre: 'Fincas de la Florida',
      subtitulo: 'Tu espacio de tranquilidad en Zárate',
      descripcion: 'Barrio abierto con 144 lotes de 600 m² en Zárate. Entorno natural privilegiado con gran arboleda perimetral y atardeceres únicos.',
      destacados: ['144 lotes de 600 m²', 'Arboleda perimetral', 'A 15 min del centro'],
      ubicacion: 'Zárate',
      imagen: fincasImage1,
      imagenes: [fincasImage1, fincasImage2, fincasImage3]
    },
    {
      id: 'praderas-cardales-i',
      nombre: 'Praderas de Cardales I',
      subtitulo: 'Lotes y atardeceres generosos',
      descripcion: 'Barrio abierto de 128 lotes de 2000 m² cada uno. Ubicación estratégica con atmósfera de paz y naturaleza exuberante.',
      destacados: ['128 lotes de 2000 m²', 'Amplios horizontes', 'Naturaleza incomparable'],
      ubicacion: 'Cardales',
      imagen: praderas1Image10,
      imagenes: [praderas1Image10, praderas1Image1, praderas1Image2, praderas1Image3]
    },
    {
      id: 'praderas-cardales-ii',
      nombre: 'Praderas de Cardales II',
      subtitulo: 'Un nuevo horizonte en Cardales',
      descripcion: 'Barrio abierto sin expensas con 200 lotes desde 1000 m² hasta 1600 m². Naturaleza, tranquilidad y equipamiento deportivo completo.',
      destacados: ['200 lotes sin expensas', 'Plaza y deportes', 'SUM con parrillas'],
      ubicacion: 'Cardales',
      imagen: praderas2Image1,
      imagenes: [praderas2Image1, praderas2Image2, praderas2Image3]
    },
    {
      id: 'praderas-cardales-iii',
      nombre: 'Praderas de Cardales III',
      subtitulo: 'Viví el deporte todos los días',
      descripcion: 'Barrio abierto sin expensas con 130 lotes desde 1000 m² hasta 1500 m². Énfasis en amenities deportivos y espacios comunes.',
      destacados: ['130 lotes', 'Cancha pádel y fútbol', 'Gimnasio al aire libre'],
      ubicacion: 'Cardales',
      imagen: praderas3Image1,
      imagenes: [praderas3Image1, praderas3Image2, praderas3Image3]
    },
    {
      id: 'el-lazo',
      nombre: 'El Lazo',
      subtitulo: 'La conexión del campo con el pueblo',
      descripcion: 'Exclusivo barrio abierto con 228 lotes desde 1500 hasta 3000 m². A 5 minutos del centro de Capilla del Señor con más de 30.000 m² de áreas verdes.',
      destacados: ['228 lotes exclusivos', '30.000 m² áreas verdes', '4 canchas fútbol tenis'],
      ubicacion: 'Capilla del Señor',
      imagen: elLazoImage1,
      imagenes: [elLazoImage1, elLazoImage2, elLazoImage3]
    }
  ]

  return (
    <section ref={sectionRef} className="proyectos-section">
      <div className="proyectos-container">
        <div className="proyectos-header animate-fade-in">
          <h2>Nuestros Desarrollos</h2>
          <p>Conocé cada uno de nuestros proyectos pensados para vos y tu familia</p>
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
                <img src={proyecto.imagen} alt={proyecto.nombre} />
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

        <div className="proyectos-cta animate-fade-in">
          <Link to="/proyectos" className="ver-todos-btn">
            Ver todos los proyectos
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Proyectos