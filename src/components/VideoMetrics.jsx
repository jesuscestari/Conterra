import { useEffect, useState } from 'react';
import { useVideoOptimization } from '../hooks/useVideoOptimization';

const VideoMetrics = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    startTime: 0,
    connectionType: 'unknown',
    deviceType: 'desktop'
  });
  
  const { connectionType } = useVideoOptimization();

  useEffect(() => {
    const startTime = performance.now();
    
    // Detectar tipo de dispositivo
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setMetrics(prev => ({
      ...prev,
      startTime,
      connectionType,
      deviceType: isMobile ? 'mobile' : 'desktop'
    }));

    // Escuchar eventos de carga del video
    const handleVideoLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime)
      }));
      
      // Enviar métricas a analytics (opcional)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'video_load', {
          load_time: loadTime,
          connection_type: connectionType,
          device_type: isMobile ? 'mobile' : 'desktop'
        });
      }
    };

    // Escuchar eventos de error del video
    const handleVideoError = (error) => {
      console.error('Video error:', error);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'video_error', {
          connection_type: connectionType,
          device_type: isMobile ? 'mobile' : 'desktop',
          error_type: error.type || 'unknown'
        });
      }
    };

    // Agregar event listeners
    document.addEventListener('videoLoaded', handleVideoLoad);
    document.addEventListener('videoError', handleVideoError);

    return () => {
      document.removeEventListener('videoLoaded', handleVideoLoad);
      document.removeEventListener('videoError', handleVideoError);
    };
  }, [connectionType]);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        📊 Video Metrics
      </div>
      <div>Tiempo de carga: {metrics.loadTime}ms</div>
      <div>Conexión: {metrics.connectionType}</div>
      <div>Dispositivo: {metrics.deviceType}</div>
      <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
        Solo visible en desarrollo
      </div>
    </div>
  );
};

export default VideoMetrics; 