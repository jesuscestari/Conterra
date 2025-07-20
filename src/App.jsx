import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Projects from './pages/Projects'
import ProyectoDetalle from './pages/ProyectoDetalle'
import PoliticasPrivacidad from './pages/PoliticasPrivacidad'
import Loader from './components/Loader'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500) // Loader se muestra por 1.5 segundos

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/politicas-privacidad" element={<PoliticasPrivacidad />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
