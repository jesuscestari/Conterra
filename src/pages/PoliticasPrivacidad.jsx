import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PoliticasPrivacidad = () => {
  return (
    <div className="politicas-privacidad">
      <Navbar />
      
      <section className="politicas-section">
        <div className="politicas-container">
          <div className="politicas-header">
            <h1 className="title-underline">Política de Privacidad</h1>
           
          </div>

          <div className="politicas-content">
            <div className="politicas-intro">
              <p>
                En Conterra Desarrollos respetamos tu privacidad y nos comprometemos a proteger 
                la información personal que nos proporcionas. Esta política explica cómo recopilamos, 
                usamos y protegemos tu información.
              </p>
            </div>

            <div className="politicas-section-item">
              <h2>Información que Recopilamos</h2>
              <p>
                Recopilamos información que nos proporcionas directamente cuando:
              </p>
              <ul>
                <li>Te pones en contacto con nosotros a través de nuestros formularios</li>
                <li>Solicitas información sobre nuestros desarrollos</li>
                <li>Te suscribes a nuestras comunicaciones</li>
                <li>Visitas nuestras oficinas comerciales</li>
              </ul>
            </div>

            <div className="politicas-section-item">
              <h2>Uso de la Información</h2>
              <p>
                Utilizamos tu información personal para:
              </p>
              <ul>
                <li>Responder a tus consultas y proporcionarte información sobre nuestros proyectos</li>
                <li>Enviarte actualizaciones sobre desarrollos que puedan interesarte</li>
                <li>Mejorar nuestros servicios y experiencia del cliente</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </div>

            <div className="politicas-section-item">
              <h2>Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger 
                tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </div>

            <div className="politicas-section-item">
              <h2>Compartir Información</h2>
              <p>
                No vendemos, alquilamos ni compartimos tu información personal con terceros, 
                excepto cuando sea necesario para prestarte nuestros servicios o cuando la ley lo requiera.
              </p>
            </div>

            <div className="politicas-section-item">
              <h2>Tus Derechos</h2>
              <p>
                Tienes derecho a:
              </p>
              <ul>
                <li>Acceder a la información personal que tenemos sobre ti</li>
                <li>Solicitar la corrección de datos inexactos</li>
                <li>Solicitar la eliminación de tus datos personales</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </div>

            <div className="politicas-section-item">
              <h2>Contacto</h2>
              <p>
                Si tienes preguntas sobre esta política de privacidad o quieres ejercer tus derechos, 
                puedes contactarnos en:
              </p>
              <div className="contacto-info">
                <p><strong>Email:</strong> info@conterradesarrollos.com</p>
                <p><strong>Teléfono:</strong> +54 11 6141-5555</p>
             
              </div>
            </div>

            <div className="politicas-footer">
              <p>
                Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. 
                Te notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PoliticasPrivacidad 