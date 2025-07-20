const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img src="/src/assets/logo.png" alt="Conterra" />
            </div>
            <p className="footer-tagline">
              15 años creando espacios para la vida. Construimos más que lotes, 
              construimos el futuro de las familias argentinas.
            </p>
          </div>

          <div className="footer-section">
            <h3>Desarrollos</h3>
            <ul className="footer-links">
              <li><a href="/proyectos/saint-francis">Saint Francis</a></li>
              <li><a href="/proyectos/fincas-florida">Fincas de la Florida</a></li>
              <li><a href="/proyectos/praderas-cardales-i">Praderas de Cardales I</a></li>
              <li><a href="/proyectos/praderas-cardales-ii">Praderas de Cardales II</a></li>
              <li><a href="/proyectos/praderas-cardales-iii">Praderas de Cardales III</a></li>
              <li><a href="/proyectos/el-lazo">El Lazo</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Empresa</h3>
            <ul className="footer-links">
              <li><a href="/">Inicio</a></li>
              <li><a href="/#quienes-somos">Quiénes Somos</a></li>
              <li><a href="/proyectos">Proyectos</a></li>
              <li><a href="/contacto">Contacto</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contacto</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <p>Buenos Aires, Argentina</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <p>+54 11 6141-5555</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <p>info@conterradesarrollos.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2025 Conterra Desarrollos. Todos los derechos reservados.
            </p>
            <div className="footer-legal">
              <a href="/politicas-privacidad">Política de Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 