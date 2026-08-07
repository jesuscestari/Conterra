import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '../assets/logo.webp'

const Navbar = ({ hideOnInitialLoad = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (!hideOnInitialLoad) {
      setHasScrolled(true) // Siempre visible en páginas que no son Home
      return
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY
      if (scrollTop > 100 && !hasScrolled) {
        setHasScrolled(true) // Una vez que aparece, se queda visible
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hideOnInitialLoad, hasScrolled])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={`navbar ${hasScrolled ? 'visible' : 'hidden'}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">
          <img src={logo} alt="Conterra Desarrollos" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <Link to="/" className="nav-link">INICIO</Link>
          <Link to="/proyectos" className="nav-link">PROYECTOS</Link>
          <Link to="/contacto" className="nav-link">CONTACTO</Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-nav-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-links mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>INICIO</Link>
          <Link to="/proyectos" className="nav-link" onClick={closeMenu}>PROYECTOS</Link>
          <Link to="/contacto" className="nav-link" onClick={closeMenu}>CONTACTO</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 