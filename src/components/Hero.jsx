import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import videoSrc from '../assets/video.mp4'
import heroImage from '../assets/hero.png'

const Hero = ({
  title = 'CREA TU HOGAR\nDESDE LA RAÍZ',
  subtitle = 'CONTERRA DESARROLLOS',
  buttonText = 'Solicitar info',
  buttonLink = '/proyectos',
  showButton = true,
  bgVideo = videoSrc,
  bgImage = heroImage,
  height = '100vh',
  overlayOpacity = 0.4,
  useImage = false
}) => {
  const handleVideoLoad = () => {
    console.log('Video cargado correctamente');
  };

  const handleVideoError = (e) => {
    console.error('Error cargando el video:', e);
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.2
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section 
      className="hero" 
      style={{ 
        height, 
        position: 'relative', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(useImage && {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        })
      }}
    >
      {!useImage && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="hero-video"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            backgroundColor: '#000'
          }}
        >
          <source src={bgVideo} type="video/mp4" />
          Tu navegador no soporta videos HTML5.
        </video>
      )}
      <div 
        className="hero-overlay" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `rgba(0,0,0,${overlayOpacity})`,
          zIndex: 1
        }}
      ></div>
      <motion.div 
        className="hero-content" 
        style={{ position: 'relative', zIndex: 2 }}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="hero-title"
          variants={titleVariants}
        >
          {title.split('\n').map((line, i) => (
            <motion.span 
              key={i} 
              style={{ display: 'block' }}
              variants={lineVariants}
            >
              {line}
            </motion.span>
          ))}
        </motion.h1>
        {subtitle && (
          <motion.p 
            className="hero-subtitle"
            variants={subtitleVariants}
          >
            {subtitle}
          </motion.p>
        )}
        {showButton && (
          <motion.div variants={buttonVariants}>
            <Link to={buttonLink} className="hero-button">
              {buttonText}
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  )
}

export default Hero 