import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import praderas3Image1 from '../assets/Praderas 3/5.webp'
import praderas3Image2 from '../assets/Praderas 3/DJI_20250718151834_0416_D.webp'
import praderas3Image3 from '../assets/Praderas 3/1.webp'
import { NaturalezaIcon, CalidadIcon, SeguridadIcon } from './icons'

const ProyectoDestacado = () => {
  const sectionRef = useRef(null)

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
        descripcion: 'Barrios abiertos con accesos controlados, vigilancia perimetral y diseño urbano que prioriza la tranquilidad y protección de las familias.' 
      }
    ],
    destacados: [
    
    ]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section 
      ref={sectionRef} 
      className="proyecto-destacado-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="proyecto-destacado-container">
        <motion.div 
          className="proyecto-destacado-header"
          variants={itemVariants}
        >
          <h2 className="title-underline">Nuestros Desarrollos</h2>
          <p>Especialistas en lotes para barrios abiertos</p>
        </motion.div>

        <div className="proyecto-destacado-content">
          {/* Información principal de desarrollos */}
          <div className="proyecto-principal">
            <motion.div 
              className="proyecto-info"
              variants={itemVariants}
            >
              <div className="proyecto-texto">
                <h3 className="title-underline-left">Desarrollos que se adaptan a tu vida</h3>
                <p>
                Nuestros desarrollos priorizan la calidad urbana y el acceso a espacios verdes, con ubicaciones estratégicas 
                y servicios esenciales pensados para el bienestar. 
                </p>
                <p>
                  Cada proyecto es planificado con compromiso, confianza y 
                  transparencia, manteniendo una relación cercana con nuestros clientes.
                </p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/proyectos`} className="ver-proyecto-btn">
                  Ver todos los desarrollos
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="proyecto-imagenes"
              variants={itemVariants}
            >
              <motion.div 
                className="imagen-principal"
                variants={imageVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Link to="/proyectos" className="imagen-link">
                  <img src={praderas3Image1} alt="Praderas de Cardales III - Vista principal" />
                  <div className="imagen-overlay">
                    <span className="ver-mas-text">Ver más</span>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              </motion.div>
              <div className="imagenes-secundarias">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/proyectos" className="imagen-link">
                    <img src={praderas3Image2} alt="Praderas de Cardales III - Vista aérea" />
                    <div className="imagen-overlay">
                      <span className="ver-mas-text">Ver más</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to="/proyectos" className="imagen-link">
                    <img src={praderas3Image3} alt="Praderas de Cardales III - Lotes del barrio" />
                    <div className="imagen-overlay">
                      <span className="ver-mas-text">Ver más</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Características principales */}
          <motion.div 
            className="caracteristicas-grid"
            variants={containerVariants}
          >
            {desarrollosInfo.caracteristicas.map((caracteristica, index) => (
              <motion.div 
                key={index} 
                className="caracteristica-item"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="caracteristica-icon"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <caracteristica.IconComponent size={32} />
                </motion.div>
                <div className="caracteristica-content">
                  <h4>{caracteristica.titulo}</h4>
                  <p>{caracteristica.descripcion}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default ProyectoDestacado 