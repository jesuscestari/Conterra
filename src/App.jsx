import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Contact from './pages/Contact'
import Projects from './pages/Projects'
import ProyectoDetalle from './pages/ProyectoDetalle'
import PoliticasPrivacidad from './pages/PoliticasPrivacidad'

// El plano y el panel arrastran Tailwind, zod y los componentes del mapa. Son
// dos rutas que la mayoría de las visitas no abre, así que se cargan aparte y
// no le suman peso a la home.
const PlanoElMadrigal = lazy(() => import('./pages/PlanoElMadrigal'))
const AdminAcceso = lazy(() => import('./pages/AdminAcceso'))

import Loader from './components/Loader'
import ScrollToTop from './components/ScrollToTop'
import PageTransition from './components/PageTransition'
import ScrollProgress from './components/ScrollProgress'

import { useLenis } from './hooks/useLenis'

import './App.css'

/**
 * Espera de las rutas diferidas. Va en el color de fondo del plano y sin texto:
 * la descarga dura milisegundos y un cartel que aparece y desaparece se lee
 * como un parpadeo.
 */
function PantallaCargando() {
  return <div style={{ minHeight: '100dvh', backgroundColor: '#f4f2ee' }} />
}

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
        {/* Va antes de /proyectos/:id para que no lo tome como un proyecto
            llamado "el-madrigal/plano". */}
        <Route path="/proyectos/el-madrigal/plano" element={
          <PageTransition>
            <Suspense fallback={<PantallaCargando />}>
              <PlanoElMadrigal />
            </Suspense>
          </PageTransition>
        } />
        <Route path="/proyectos/:id" element={
          <PageTransition>
            <ProyectoDetalle />
          </PageTransition>
        } />
        <Route path="/admin" element={
          <PageTransition>
            <Suspense fallback={<PantallaCargando />}>
              <AdminAcceso />
            </Suspense>
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
      <div className="App">
        <AnimatedRoutes />
      </div>
    </Router>
  )
}

export default App
