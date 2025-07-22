import { useState, useEffect, useRef } from 'react';
import { useVideoOptimization } from '../hooks/useVideoOptimization';
import videoSrc from '../assets/video.mp4';
import heroImage from '../assets/hero.png';

const OptimizedVideo = ({ 
  className = "hero-video",
  onLoad,
  onError,
  fallbackImage = heroImage,
  preload,
  ...props 
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  // Usar el hook de optimización
  const { 
    connectionType, 
    prefersReducedMotion, 
    shouldLoadVideo: optimizationShouldLoad, 
    getOptimalPreload 
  } = useVideoOptimization();

  // Intersection Observer para lazy loading
  useEffect(() => {
    // Si la optimización sugiere no cargar video, usar solo imagen
    if (!optimizationShouldLoad) {
      setIsVideoError(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Retrasar la carga del video para mejorar el rendimiento inicial
          setTimeout(() => setShouldLoadVideo(true), 100);
        }
      },
      {
        rootMargin: '50px', // Cargar cuando esté a 50px de entrar en viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [optimizationShouldLoad]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    onLoad?.();
    
    // Emitir evento para métricas
    const event = new CustomEvent('videoLoaded', {
      detail: { connectionType, prefersReducedMotion }
    });
    document.dispatchEvent(event);
  };

  const handleVideoError = (e) => {
    setIsVideoError(true);
    onError?.(e);
    
    // Emitir evento para métricas
    const event = new CustomEvent('videoError', {
      detail: { error: e, connectionType, prefersReducedMotion }
    });
    document.dispatchEvent(event);
  };

  const handleVideoCanPlay = () => {
    // El video está listo para reproducirse
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback si autoplay falla
        console.log('Autoplay no permitido, reproducción manual requerida');
      });
    }
  };

  return (
    <div ref={containerRef} className={`video-container ${className}`}>
      {/* Fallback con imagen mientras el video carga */}
      {!isVideoLoaded && !isVideoError && (
        <div 
          className="video-fallback"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        />
      )}

      {/* Video optimizado */}
      {shouldLoadVideo && !isVideoError && (
        <video
          ref={videoRef}
          preload={preload || getOptimalPreload()}
          className={`${className} ${isVideoLoaded ? 'video-loaded' : 'video-loading'}`}
          onLoadedData={handleVideoLoad}
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: isVideoLoaded ? 0 : -1,
            opacity: isVideoLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            backgroundColor: '#000'
          }}
          {...props}
        >
          <source src={videoSrc} type="video/mp4" />
          {/* Fallback para navegadores que no soportan video */}
          <img 
            src={fallbackImage} 
            alt="Hero background" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </video>
      )}

      {/* Indicador de carga */}
      {shouldLoadVideo && !isVideoLoaded && !isVideoError && (
        <div 
          className="video-loading-indicator"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
            color: 'white',
            fontSize: '14px',
            opacity: 0.8
          }}
        >
          Cargando video...
        </div>
      )}

      {/* Fallback final si el video falla */}
      {isVideoError && (
        <div 
          className="video-error-fallback"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${fallbackImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
          }}
        />
      )}
    </div>
  );
};

export default OptimizedVideo; 