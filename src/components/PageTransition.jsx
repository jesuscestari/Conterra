import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.05
      }
    },
    out: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 10 },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <motion.div variants={contentVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition; 