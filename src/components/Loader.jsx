import logo from '../assets/logo.png'

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="loader-logo">
          <img src={logo} alt="Conterra" />
        </div>
        
      </div>
    </div>
  )
}

export default Loader 