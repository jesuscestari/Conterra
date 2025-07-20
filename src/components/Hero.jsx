import { Link } from 'react-router-dom'
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
      <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
        <h1 className="hero-title">
          {title.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {showButton && (
          <Link to={buttonLink} className="hero-button">
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  )
}

export default Hero 