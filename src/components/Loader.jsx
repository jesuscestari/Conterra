import { motion } from 'framer-motion'
import logo from '../assets/logo.webp'

const Loader = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      rotate: -180
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="loader-overlay"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="loader-container">
        <motion.div 
          className="loader-logo"
          variants={logoVariants}
        >
          <img src={logo} alt="Conterra" />
        </motion.div>
        
        <motion.div
          className="loader-pulse"
          variants={pulseVariants}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            marginTop: '20px'
          }}
        />
      </div>
    </motion.div>
  )
}

export default Loader 