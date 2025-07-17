import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import logo from '../assets/logo.png'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <a href="/">
          <img src={logo} alt="Conterra Desarrollos" />
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <Link to="/" className="nav-link">INICIO</Link>
          <Link to="/Proyectos" className="nav-link">PROYECTOS</Link>
          <Link to="/contacto" className="nav-link">CONTACTO</Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-nav-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-links mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>INICIO</Link>
          <Link to="/Proyectos" className="nav-link" onClick={closeMenu}>PROYECTOS</Link>
          <Link to="/contacto" className="nav-link" onClick={closeMenu}>CONTACTO</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 