import { useState, useEffect } from 'react'
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsVisible(scrollTop > 200) // Aparece después de 200px de scroll
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWhatsAppClick = () => {
   
    const phoneNumber = "5491161415555" 
    const message = "Hola, me interesa obtener más información sobre el proyecto"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button 
      className={`whatsapp-button ${isVisible ? 'visible' : 'hidden'}`}
      onClick={handleWhatsAppClick}
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={24} />
    </button>
  )
}

export default WhatsAppButton 