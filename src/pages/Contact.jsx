import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import Hero from '../components/Hero'
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaClock, FaPhone } from 'react-icons/fa'
import { useEffect } from 'react'

const Contact = () => {
  useEffect(() => {
    // Handle form submission with JavaScript
    const form = document.querySelector('form[name="contact"]')
    if (form) {
      form.addEventListener('submit', (e) => {
        // Let Netlify handle the form submission
        // The redirect will be handled by data-netlify-redirect
        console.log('Form submitted, redirecting to success page...')
      })
    }
  }, [])

  return (
    <div className="contact">
      <Navbar />
      <Hero 
        title="Contacto"
        subtitle="Estamos aquí para ayudarte"
        showButton={false}
        height="40vh"
        useImage={true}
      />
      
      <div className="contact-container">
        <div className="contact-intro">
          <h2>Contactanos</h2>
          <p>
            Estamos aquí para ayudarte a encontrar el lote perfecto para tu futuro hogar. 
            Contactanos a través de cualquiera de nuestros canales y te brindaremos toda la información que necesitás.
          </p>
        </div>

        <div className="contact-content-grid">
          <div className="contact-form-section">
            <div className="contact-form-card">
              <div className="form-header">
                <div className="form-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>Envianos tu consulta</h3>
                <p>Completá el formulario y te responderemos a la brevedad</p>
              </div>

              <form 
                className="contact-form" 
                name="contact" 
                method="POST" 
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                data-netlify-redirect="/form-success.html"
                netlify
              >
                {/* Netlify hidden input for form handling */}
                <input type="hidden" name="form-name" value="contact" />
                
                {/* Honeypot field to prevent spam */}
                <div className="hidden">
                  <input name="bot-field" />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Nombre completo</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="Tu nombre y apellido"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Teléfono</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="+54 11 6141-5555"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Mensaje</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5"
                    placeholder="Contanos en qué podemos ayudarte..."
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  <i className="fas fa-paper-plane"></i>
                  Enviar consulta
                </button>
              </form>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="info-header">
                <h3>Información de contacto</h3>
                <p>Encontranos a través de estos canales</p>
              </div>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="method-content">
                    <h4>Ubicación</h4>
                    <p>Buenos Aires, Argentina<br />Zona Norte</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="method-content">
                    <h4>Teléfono</h4>
                    <p>+54 11 6141-5555 <br />+54 11 5635-5890</p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="method-content">
                    <h4>Email</h4>
                    <p>info@conterradesarrollos.com<br /></p>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <i className="fab fa-whatsapp"></i>
                  </div>
                  <div className="method-content">
                    <h4>WhatsApp</h4>
                    <div className="whatsapp-contacts">
                      <a 
                        href="https://wa.me/5491161415555?text=Hola,%20me%20interesa%20obtener%20información%20sobre%20Conterra" 
                        className="whatsapp-contact"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-whatsapp"></i>
                        Consultas Generales
                      </a>
                      <a 
                        href="https://wa.me/5491156355890?text=Hola,%20me%20interesa%20obtener%20información%20comercial" 
                        className="whatsapp-contact"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-whatsapp"></i>
                        Consultas Generales
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Contact 