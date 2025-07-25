import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Projects from './pages/Projects'
import ProyectoDetalle from './pages/ProyectoDetalle'
import PoliticasPrivacidad from './pages/PoliticasPrivacidad'
import Loader from './components/Loader'
import ScrollToTop from './components/ScrollToTop'
import PageTransition from './components/PageTransition'
import ScrollProgress from './components/ScrollProgress'
import VideoPreloader from './components/VideoPreloader'
import { useLenis } from './hooks/useLenis'

import './App.css'

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        <Route path="/proyectos" element={
          <PageTransition>
            <Projects />
          </PageTransition>
        } />
        <Route path="/proyectos/:id" element={
          <PageTransition>
            <ProyectoDetalle />
          </PageTransition>
        } />
        <Route path="/contacto" element={
          <PageTransition>
            <Contact />
          </PageTransition>
        } />
        <Route path="/politicas-privacidad" element={
          <PageTransition>
            <PoliticasPrivacidad />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [loading, setLoading] = useState(true)

  // Inicializar Lenis smooth scroll
  useLenis()

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
      <ScrollProgress />
      <VideoPreloader />
      <div className="App">
        <AnimatedRoutes />
      </div>
    </Router>
  )
}

export default App
