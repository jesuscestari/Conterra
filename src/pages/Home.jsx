import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Inicio from '../components/Inicio'
import Proyectos from '../components/Proyectos'
import QuienesSomos from '../components/QuienesSomos'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <Hero />
      <Inicio />
      <Proyectos />
      <QuienesSomos />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Home 