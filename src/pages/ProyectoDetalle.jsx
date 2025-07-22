import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import ProyectoWhatsAppButton from '../components/ProyectoWhatsAppButton'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

// Importar imágenes de Saint Francis
import saintImage1 from '../assets/SAINT/dji_fly_20250701_172212_0146_1751418034982_photo.webp'
import saintImage2 from '../assets/SAINT/dji_fly_20250701_172326_0152_1751468124029_photo.webp'
import saintImage3 from '../assets/SAINT/dji_fly_20250701_172332_0154_1751468122332_photo.webp'

// Importar imágenes de Fincas de la Florida
import fincasImage1 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_464.webp'
import fincasImage2 from '../assets/FINCAS DE LA FLORIDA/aerea1.webp'
import fincasImage3 from '../assets/FINCAS DE LA FLORIDA/Fincas 1.webp'
import fincasImage4 from '../assets/FINCAS DE LA FLORIDA/Fincas 2.webp'
import fincasImage5 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_480.webp'
import fincasImage6 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_465.webp'
import fincasImage7 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_440.webp'
import fincasImage8 from '../assets/FINCAS DE LA FLORIDA/IMG_20201012_171607_479.webp'
import fincasImage9 from '../assets/FINCAS DE LA FLORIDA/FB_IMG_1602533536376.webp'
import fincasImage10 from '../assets/FINCAS DE LA FLORIDA/FB_IMG_1602533385956.webp'
import fincasImage11 from '../assets/FINCAS DE LA FLORIDA/FB_IMG_1602533515064.webp'
import fincasImage12 from '../assets/FINCAS DE LA FLORIDA/FB_IMG_1602533539927.webp'

// Importar imágenes de Praderas de Cardales I
import praderas1Image1 from '../assets/PRADERAS DE CARDALES 1/20220318_134641.webp'
import praderas1Image2 from '../assets/PRADERAS DE CARDALES 1/20220318_133926.webp'
import praderas1Image3 from '../assets/PRADERAS DE CARDALES 1/20220318_132853.webp'
import praderas1Image4 from '../assets/PRADERAS DE CARDALES 1/20220313_213941.webp'
import praderas1Image5 from '../assets/PRADERAS DE CARDALES 1/20220308_222434.webp'
import praderas1Image6 from '../assets/PRADERAS DE CARDALES 1/20220223_171745.webp'
import praderas1Image7 from '../assets/PRADERAS DE CARDALES 1/20220106_154859.webp'
import praderas1Image8 from '../assets/PRADERAS DE CARDALES 1/20211128_230250.webp'
import praderas1Image9 from '../assets/PRADERAS DE CARDALES 1/20211128_225559.webp'
import praderas1Image10 from '../assets/PRADERAS DE CARDALES 1/dji_export_1647217500946.webp'
import praderas1Image11 from '../assets/PRADERAS DE CARDALES 1/DESPUES.webp'
import praderas1Image12 from '../assets/PRADERAS DE CARDALES 1/DESPUES 2.webp'

// Importar imágenes de El Lazo
import elLazoImage1 from '../assets/EL LAZO/20220325_123731.webp'
import elLazoImage2 from '../assets/EL LAZO/20220325_124216.webp'
import elLazoImage3 from '../assets/EL LAZO/20220325_124011.webp'
import elLazoImage4 from '../assets/EL LAZO/20220325_123413.webp'
import elLazoImage5 from '../assets/EL LAZO/20220324_205232.webp'
import elLazoImage6 from '../assets/EL LAZO/20220324_205038.webp'
import elLazoImage7 from '../assets/EL LAZO/20220324_204347.webp'

// Importar imágenes de Praderas 3
import praderas3Image1 from '../assets/Praderas 3/5.webp'
import praderas3Image2 from '../assets/Praderas 3/DJI_20250718151834_0416_D.webp'
import praderas3Image3 from '../assets/Praderas 3/1.webp'
import praderas3Image4 from '../assets/Praderas 3/2.webp'
import praderas3Image5 from '../assets/Praderas 3/3.webp'
import praderas3Image6 from '../assets/Praderas 3/4.webp'
import praderas3Image7 from '../assets/Praderas 3/6.webp'
import praderas3Image8 from '../assets/Praderas 3/7.webp'
import praderas3Image9 from '../assets/Praderas 3/8.webp'
import praderas3Image10 from '../assets/Praderas 3/9.webp'
import praderas3Image11 from '../assets/Praderas 3/10.webp'

// Imagen de ejemplo para Praderas de Cardales II (que falta)
import example from '../assets/example.jpg'

const ProyectoDetalle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proyecto, setProyecto] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const proyectosData = {
    'saint-francis': {
      nombre: 'Saint Francis',
      heroTitle: 'SAINT FRANCIS',
      heroSubtitle: 'Un barrio distinguido con historia y naturaleza',
      descripcionCorta: 'Exclusividad y tradición en Capilla del Señor',
      descripcionCompleta: `Saint Francis es un barrio abierto único en la localidad de Capilla del Señor, compuesto por 290 lotes de amplias dimensiones que oscilan entre los 1500 m² y los 8700 m², a tan solo cinco minutos del emblemático pueblo histórico. Este desarrollo se distingue por su elegancia y el ambiente sereno que lo rodea, ofreciendo a sus residentes atardeceres incomparables en un entorno de tranquilidad privilegiada.

El corazón de Saint Francis late sobre lo que alguna vez fue un célebre haras, cuyas icónicas instalaciones todavía se conservan y hoy forman parte de los lotes premium del barrio. Estas propiedades permiten a sus dueños disfrutar de edificaciones de gran valor histórico y arquitectónico, como caballerizas de estilo inglés, corral de doma, galpón de carruajes y acogedoras casas de huéspedes con impronta campestre, brindando una oportunidad única de vivir rodeado de historia y distinción.

El barrio cuenta con más de 23.000 m² de áreas verdes forestadas con álamos, liquidámbar, robles, olmos, eucaliptus y otras especies, promoviendo una convivencia armónica con la naturaleza. Además, ofrece espacios pensados para el bienestar y el esparcimiento de toda la familia: plaza con juegos infantiles, gimnasio al aire libre y canchas de fútbol, convirtiendo a Saint Francis en el lugar ideal para quienes buscan calidad de vida, aire puro y exclusividad, a pocos minutos de la historia y el encanto de Capilla del Señor.`,
      caracteristicas: [
        '290 lotes de 1500 m² a 8700 m²',
        'Instalaciones históricas del haras preservadas',
        'Más de 23.000 m² de áreas verdes',
        'Plaza con juegos infantiles',
        'Gimnasio al aire libre',
        'Canchas de fútbol',
        'A 5 minutos del centro histórico'
      ],
      ubicacion: 'Capilla del Señor, Buenos Aires',
      imagen: saintImage1,
      galleryImages: [
        { src: saintImage1, alt: 'Vista aérea de Saint Francis' },
        { src: saintImage2, alt: 'Áreas verdes del barrio' },
        { src: saintImage3, alt: 'Instalaciones históricas' }
      ]
    },
    'fincas-florida': {
      nombre: 'Fincas de la Florida',
      heroTitle: 'FINCAS DE LA FLORIDA',
      heroSubtitle: 'Tu espacio de tranquilidad en Zárate',
      descripcionCorta: 'Tu espacio de tranquilidad en Zárate',
      descripcionCompleta: `Fincas de la Florida es un barrio abierto conformado por 144 lotes de 600 m², ubicado en la localidad de Zárate. Este desarrollo invita a disfrutar de un entorno natural privilegiado, realzado por una gran arboleda perimetral que abraza cada espacio, generando una atmósfera de calma y privacidad. Los atardeceres en Fincas de la Florida se convierten en un espectáculo cotidiano, teñidos de colores cálidos que transforman cada jornada en una experiencia única.

Ideal para familias y para quienes valoran la tranquilidad, Fincas de la Florida ofrece la combinación perfecta entre vida serena y cercanía a la ciudad, ya que se encuentra a solo 15 minutos del centro de Zárate. Aquí, la naturaleza y el bienestar cotidiano se encuentran para brindar un lugar donde cada día es una invitación a disfrutar de la paz y la belleza del entorno.`,
      caracteristicas: [
        '144 lotes de 600 m²',
        'Gran arboleda perimetral',
        'Atardeceres únicos',
        'Ambiente de calma y privacidad',
        'A 15 minutos del centro de Zárate',
        'Ideal para familias',
        'Entorno natural privilegiado'
      ],
      ubicacion: 'Zárate, Buenos Aires',
      imagen: fincasImage1,
      galleryImages: [
        { src: fincasImage1, alt: 'Vista aérea de Fincas de la Florida' },
        { src: fincasImage2, alt: 'Lotes del barrio' },
        { src: fincasImage3, alt: 'Arboleda perimetral' },
        { src: fincasImage4, alt: 'Atardeceres únicos' },
        { src: fincasImage5, alt: 'Entorno natural' },
        { src: fincasImage6, alt: 'Vista del desarrollo' },
        { src: fincasImage7, alt: 'Paisaje del barrio' },
        { src: fincasImage8, alt: 'Vista panorámica' },
        { src: fincasImage9, alt: 'Áreas verdes' },
        { src: fincasImage10, alt: 'Atardeceres espectaculares' },
        { src: fincasImage11, alt: 'Entorno natural privilegiado' },
        { src: fincasImage12, alt: 'Vista del desarrollo' }
      ]
    },
    'praderas-cardales-i': {
      nombre: 'Praderas de Cardales I',
      heroTitle: 'PRADERAS DE CARDALES I',
      heroSubtitle: 'Lotes y atardeceres generosos',
      descripcionCorta: 'Lotes y atardeceres generosos',
      descripcionCompleta: `Praderas de Cardales I es un barrio abierto de 128 lotes de 2000 m² cada uno, concebido para quienes buscan un entorno natural incomparable y la serenidad de la vida lejos del bullicio. Ubicado a tan solo 10 minutos de la Ruta 9 y a la misma distancia del encantador pueblo de Cardales, ofrece una ubicación estratégica que combina tranquilidad y fácil acceso.

La característica esencial que distingue a Praderas de Cardales I es su atmósfera de paz, rodeada por un paisaje de naturaleza exuberante y amplios horizontes donde los atardeceres pintan el cielo con colores únicos. Aquí, cada día se disfruta al ritmo de la naturaleza y la libertad de respirar aire puro, en un espacio pensado para el bienestar y la conexión con el entorno.`,
      caracteristicas: [
        '128 lotes de 2000 m²',
        'A 10 minutos de Ruta 9',
        'A 10 minutos del pueblo de Cardales',
        'Naturaleza exuberante',
        'Amplios horizontes',
        'Atardeceres únicos',
        'Atmósfera de paz y tranquilidad'
      ],
      ubicacion: 'Cardales, Buenos Aires',
      imagen: praderas1Image1,
      galleryImages: [
        { src: praderas1Image1, alt: 'Vista general de Praderas de Cardales I' },
        { src: praderas1Image2, alt: 'Lotes del barrio' },
        { src: praderas1Image3, alt: 'Naturaleza exuberante' },
        { src: praderas1Image4, alt: 'Amplios horizontes' },
        { src: praderas1Image5, alt: 'Atardeceres únicos' },
        { src: praderas1Image6, alt: 'Atmósfera de paz' },
        { src: praderas1Image7, alt: 'Vista aérea del desarrollo' },
        { src: praderas1Image8, alt: 'Paisaje natural' },
        { src: praderas1Image9, alt: 'Horizontes amplios' },
        { src: praderas1Image10, alt: 'Vista panorámica' },
        { src: praderas1Image11, alt: 'Transformación del terreno' },
        { src: praderas1Image12, alt: 'Resultado final' }
      ]
    },
    'praderas-cardales-ii': {
      nombre: 'Praderas de Cardales II',
      heroTitle: 'PRADERAS DE CARDALES II',
      heroSubtitle: 'Un nuevo horizonte en Cardales',
      descripcionCorta: 'Exclusividad natural y vida activa, sin expensas',
      descripcionCompleta: `Praderas de Cardales II es una propuesta única en la localidad de Cardales: un barrio abierto, sin expensas, que invita a vivir rodeado de naturaleza y tranquilidad. Con sus 200 lotes que van desde los 1000 m2 hasta los 1600 m2, el barrio ofrece espacios generosos para quienes buscan construir su hogar en un entorno armonioso y de gran privacidad.

La esencia de Praderas de Cardales II se percibe en su imponente arboleda perimetral y en el paisaje ondulado que, al atardecer, regala vistas cautivadoras y una atmósfera de serenidad difícil de encontrar. Este escenario natural se convierte en el perfecto telón de fondo para disfrutar de la vida al aire libre y compartir con seres queridos.

Pensando en el bienestar de toda la comunidad, el barrio cuenta con una plaza de juegos para los más pequeños, gimnasio al aire libre, cancha de fútbol, playón de básquet y un SUM equipado con parrillas. Cada espacio está diseñado para fomentar el encuentro, el deporte y el disfrute, haciendo de Praderas de Cardales II el lugar ideal para quienes valoran la naturaleza, la libertad y la vida en comunidad.`,
      caracteristicas: [
        '200 lotes de 1000 m² a 1600 m²',
        'Sin expensas',
        'Arboleda perimetral',
        'Plaza de juegos infantiles',
        'Gimnasio al aire libre',
        'Cancha de fútbol y básquet',
        'SUM con parrillas',
        'Paisaje ondulado con vistas únicas'
      ],
      ubicacion: 'Cardales, Buenos Aires',
      imagen: example,
      galleryImages: [
        { src: example, alt: 'Vista del desarrollo' },
        { src: example, alt: 'Áreas comunes' },
        { src: example, alt: 'Amenities del barrio' }
      ]
    },
    'praderas-cardales-iii': {
      nombre: 'Praderas de Cardales III',
      heroTitle: 'PRADERAS DE CARDALES III',
      heroSubtitle: 'Viví el deporte todos los días',
      descripcionCorta: 'Viví el deporte todos los días',
      descripcionCompleta: `Praderas de Cardales III es un barrio abierto sin expensas, compuesto por 130 lotes que van desde los 1000 m² hasta los 1500 m², ubicado en la localidad de Cardales. Nuestra esencia reside en el entorno: el barrio se despliega sobre una pequeña colina, lo que le otorga vistas panorámicas únicas y atardeceres que invitan a detenerse, contemplar y disfrutar de la naturaleza en su máxima expresión.

Pensado para quienes buscan calidad de vida y momentos de encuentro, Praderas de Cardales III pone el énfasis en los amenities deportivos y en los espacios comunes. El barrio cuenta con cancha de pádel, cancha de fútbol, playón de básquet, gimnasio calisténico al aire libre, plaza de juegos para los más chicos y un sector exclusivo con fogoneros, ideal para reuniones y celebraciones bajo el cielo abierto.

Aquí, cada detalle está diseñado para fomentar el bienestar, la convivencia y la conexión entre quienes eligen vivir aquí, rodeados de verde y en un entorno seguro y libre de expensas. Praderas de Cardales III te espera para que hagas realidad el estilo de vida que soñás.`,
      caracteristicas: [
        '130 lotes de 1000 m² a 1500 m²',
        'Sin expensas',
        'Ubicado sobre colina con vistas panorámicas',
        'Cancha de pádel',
        'Cancha de fútbol',
        'Playón de básquet',
        'Gimnasio calisténico al aire libre',
        'Plaza de juegos',
        'Sector con fogoneros'
      ],
      ubicacion: 'Cardales, Buenos Aires',
      imagen: praderas3Image1,
      galleryImages: [
        { src: praderas3Image1, alt: 'Vista aérea de Praderas de Cardales III' },
        { src: praderas3Image2, alt: 'Lotes del barrio' },
        { src: praderas3Image3, alt: 'Amenities deportivos' },
        { src: praderas3Image4, alt: 'Vistas panorámicas' },
        { src: praderas3Image5, alt: 'Espacios comunes' },
        { src: praderas3Image6, alt: 'Entorno natural' },
        { src: praderas3Image7, alt: 'Vista del desarrollo' },
        { src: praderas3Image8, alt: 'Áreas verdes' },
        { src: praderas3Image9, alt: 'Paisaje natural' },
        { src: praderas3Image10, alt: 'Vista panorámica' },
        { src: praderas3Image11, alt: 'Entorno del barrio' }
      ]
    },
    'el-lazo': {
      nombre: 'El Lazo',
      heroTitle: 'EL LAZO',
      heroSubtitle: 'La conexión del campo con el pueblo',
      descripcionCorta: 'La conexión del campo con el pueblo',
      descripcionCompleta: `El Lazo es un exclusivo barrio abierto compuesto por 228 lotes que van desde los 1500 hasta los 3000 m², ubicado en la localidad de Capilla del Señor. A tan solo 5 minutos del histórico pueblo y literalmente a metros de su trazado, El Lazo invita a vivir en un entorno privilegiado, combinando la tranquilidad del campo con la cercanía a todas las comodidades y servicios.

Entre sus principales características destacan las vistas panorámicas, los atardeceres únicos y un amplio boulevard forestado que recorre el barrio, creando un ambiente natural y apacible. Más de 30.000 m² están destinados a áreas verdes, asegurando espacios abiertos y frescura en cada rincón.

El barrio ofrece una excelente plaza con juegos para niñas y niños, cuatro canchas de fútbol tenis, dos canchas de fútbol y un gimnasio al aire libre; todo pensado para el disfrute y bienestar de las familias. El Lazo se presenta así como la mejor opción para quienes buscan instalarse en un entorno seguro, natural y con acceso inmediato a la vida urbana de Capilla del Señor.`,
      caracteristicas: [
        '228 lotes de 1500 m² a 3000 m²',
        'A 5 minutos del centro histórico',
        'Más de 30.000 m² de áreas verdes',
        'Boulevard forestado',
        'Plaza con juegos infantiles',
        '4 canchas de fútbol tenis',
        '2 canchas de fútbol',
        'Gimnasio al aire libre',
        'Vistas panorámicas'
      ],
      ubicacion: 'Capilla del Señor, Buenos Aires',
      imagen: elLazoImage1,
      galleryImages: [
        { src: elLazoImage1, alt: 'Vista general de El Lazo' },
        { src: elLazoImage2, alt: 'Lotes del barrio' },
        { src: elLazoImage3, alt: 'Boulevard forestado' },
        { src: elLazoImage4, alt: 'Áreas verdes' },
        { src: elLazoImage5, alt: 'Amenities deportivos' },
        { src: elLazoImage6, alt: 'Vistas panorámicas' },
        { src: elLazoImage7, alt: 'Vista aérea del desarrollo' }
      ]
    }
  }

  useEffect(() => {
    const proyectoEncontrado = proyectosData[id]
    if (proyectoEncontrado) {
      setProyecto(proyectoEncontrado)
    } else {
      navigate('/proyectos')
    }
  }, [id, navigate])

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!proyecto) {
    return <div>Cargando...</div>
  }

  return (
    <div className="proyecto-detalle">
      <Navbar />
      <Hero 
        title={proyecto.heroTitle}
        subtitle={proyecto.heroSubtitle}
        showButton={false}
        height="40vh"
        overlayOpacity={0.5}
        useImage={true}
      />
      
      <section className="proyecto-info-section">
        <div className="proyecto-info-container">
          <div className="proyecto-breadcrumb">
            <span onClick={() => navigate('/')}>Inicio</span>
            <span> / </span>
            <span onClick={() => navigate('/proyectos')}>Proyectos</span>
            <span> / </span>
            <span className="current">{proyecto.nombre}</span>
          </div>

          <div className="proyecto-main-content">
            <div className="proyecto-descripcion">
              <h1>{proyecto.nombre}</h1>
              <h2>{proyecto.descripcionCorta}</h2>
              
              <div className="descripcion-completa">
                {proyecto.descripcionCompleta.split('\n\n').map((parrafo, index) => (
                  <p key={index}>{parrafo}</p>
                ))}
              </div>
            </div>

            <div className="proyecto-sidebar">
              <div className="proyecto-imagen">
                <img src={proyecto.imagen} alt={proyecto.nombre} />
              </div>

              <div className="proyecto-caracteristicas">
                <h3>Características principales</h3>
                <ul>
                  {proyecto.caracteristicas.map((item, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="proyecto-ubicacion">
                <h3>Ubicación</h3>
                <p><i className="fas fa-map-marker-alt"></i> {proyecto.ubicacion}</p>
              </div>

              <div className="proyecto-contacto">
                <ProyectoWhatsAppButton proyectoNombre={proyecto.nombre} />
              </div>

            
            </div>
          </div>

          <div className="proyecto-gallery">
            <h3>Galería de imágenes</h3>
            <div className="gallery-grid">
              {proyecto.galleryImages.map((image, index) => (
                <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
                  <img src={image.src} alt={image.alt} />
                  <div className="gallery-overlay">
                    <i className="fas fa-search-plus"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={proyecto.galleryImages}
      />

      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default ProyectoDetalle 