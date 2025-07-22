import { FaWhatsapp } from "react-icons/fa";

const ProyectoWhatsAppButton = ({ proyectoNombre }) => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5491161415555"
    const message = `Hola, me interesa obtener más información sobre el proyecto ${proyectoNombre}.`
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button 
      className="proyecto-whatsapp-button"
      onClick={handleWhatsAppClick}
      aria-label={`Contactar por WhatsApp sobre ${proyectoNombre}`}
    >
      <FaWhatsapp size={20} />
      <span>Consultar por este proyecto</span>
    </button>
  )
}

export default ProyectoWhatsAppButton 