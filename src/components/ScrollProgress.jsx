import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="scroll-progress"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(135deg, #AB9368 0%, #84684A 100%)',
        transformOrigin: '0%',
        scaleX,
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(171, 147, 104, 0.3)'
      }}
    />
  );
};

export default ScrollProgress; 