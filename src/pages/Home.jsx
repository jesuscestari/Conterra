import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Inicio from '../components/Inicio'
import ProyectoDestacado from '../components/ProyectoDestacado'
import QuienesSomos from '../components/QuienesSomos'
import CallToAction from '../components/CallToAction'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'

const Home = () => {
  return (
    <div className="home">
      <Navbar hideOnInitialLoad={true} />
      <Hero showScrollIndicator={true} />
      <Inicio />
      <ProyectoDestacado />
      <QuienesSomos />
      <CallToAction />
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

export default Home 