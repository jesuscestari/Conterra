import logo from '../assets/logo.png'

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-logo">
          <img src={logo} alt="Conterra" />
        </div>
        <div className="loader-text">
          <p>Cargando...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loader 