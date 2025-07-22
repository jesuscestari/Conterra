import { useState, useEffect } from 'react';

export const useVideoOptimization = () => {
  const [connectionType, setConnectionType] = useState('unknown');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(true); // Siempre true

  useEffect(() => {
    // Detectar tipo de conexión
    const detectConnection = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        setConnectionType(connection.effectiveType || 'unknown');
        
        // Siempre cargar video, ignorar conexiones lentas
        setShouldLoadVideo(true);
      }
    };

    // Detectar preferencias de movimiento reducido
    const detectMotionPreference = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Siempre cargar video, ignorar preferencias de movimiento
      setShouldLoadVideo(true);

      mediaQuery.addEventListener('change', (e) => {
        setPrefersReducedMotion(e.matches);
        setShouldLoadVideo(true); // Siempre true
      });
    };

    // Detectar si el dispositivo es móvil
    const detectMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        // En móviles, siempre cargar video
        setShouldLoadVideo(true);
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
    shouldLoadVideo: true, // Siempre retornar true
    getOptimalPreload,
    getVideoQuality
  };
}; 