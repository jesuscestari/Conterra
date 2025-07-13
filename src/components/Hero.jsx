import { Parallax } from 'react-parallax'
import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const Hero = () => {
  return (
    <Parallax 
      bgImage={heroImage} 
      strength={500}
      className="hero-parallax"
    >
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            CREA TU HOGAR<br />
            DESDE LA RAÍZ
          </h1>
          <p className="hero-subtitle">CONTERRA DESARROLLOS</p>
          <Link to="/proyectos" className="hero-button">
            Solicitar info
          </Link>
        </div>
      </section>
    </Parallax>
  )
}

export default Hero 