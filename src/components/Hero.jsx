import { Parallax } from 'react-parallax'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const Hero = ({
  title = 'CREA TU HOGAR\nDESDE LA RAÍZ',
  subtitle = 'CONTERRA DESARROLLOS',
  buttonText = 'Solicitar info',
  buttonLink = '/proyectos',
  showButton = true,
  bgImage = heroImage,
  height = '100vh',
  overlayOpacity = 0.4
}) => {
  return (
    <Parallax 
      bgImage={bgImage} 
      strength={500}
      className="hero-parallax"
      style={{ height }}
    >
      <section className="hero" style={{ height }}>
        <div className="hero-overlay" style={{ background: `rgba(0,0,0,${overlayOpacity})` }}></div>
        <div className="hero-content">
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
    </Parallax>
  )
}

export default Hero 