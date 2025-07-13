import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import UnderConstruction from '../components/UnderConstruction'
import WhatsAppButton from '../components/WhatsAppButton'

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <Hero />
      <UnderConstruction />
      <WhatsAppButton />
    </div>
  )
}

export default Home 