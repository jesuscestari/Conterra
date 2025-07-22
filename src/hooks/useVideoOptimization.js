import { useState, useEffect } from 'react';

export const useVideoOptimization = () => {
  const [connectionType, setConnectionType] = useState('unknown');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true);

  useEffect(() => {
    // Detectar tipo de conexión
    const detectConnection = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setConnectionType(connection.effectiveType || 'unknown');
        
        // No cargar video en conexiones lentas
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setShouldLoadVideo(false);
        }
      }
    };

    // Detectar preferencias de movimiento reducido
    const detectMotionPreference = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      if (mediaQuery.matches) {
        setShouldLoadVideo(false);
      }

      mediaQuery.addEventListener('change', (e) => {
        setPrefersReducedMotion(e.matches);
        setShouldLoadVideo(!e.matches);
      });
    };

    // Detectar si el dispositivo es móvil
    const detectMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // En móviles, considerar la conexión antes de cargar video
        if (connectionType === 'slow-2g' || connectionType === '2g') {
          setShouldLoadVideo(false);
        }
      }
    };

    detectConnection();
    detectMotionPreference();
    detectMobile();

    // Escuchar cambios en la conexión
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', detectConnection);
    }

    return () => {
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', detectConnection);
      }
    };
  }, [connectionType]);

  const getOptimalPreload = () => {
    if (connectionType === '4g' || connectionType === '5g') {
      return 'metadata';
    }
    return 'none';
  };

  const getVideoQuality = () => {
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return 'low';
    }
    if (connectionType === '3g') {
      return 'medium';
    }
    return 'high';
  };

  return {
    connectionType,
    prefersReducedMotion,
    shouldLoadVideo,
    getOptimalPreload,
    getVideoQuality
  };
}; 