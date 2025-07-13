import { MessageCircle } from 'lucide-react'
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    // Número de teléfono - reemplaza con el número real
    const phoneNumber = "549" // Ejemplo: Argentina
    const message = "Hola, me interesa obtener más información sobre Pilará y los proyectos de Conterra Desarrollos."
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button 
      className="whatsapp-button"
      onClick={handleWhatsAppClick}
      aria-label="Contactar por WhatsApp"
    >
      <FaWhatsapp size={24} />
    </button>
  )
}

export default WhatsAppButton 