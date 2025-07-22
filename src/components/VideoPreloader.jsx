import { useEffect, useRef } from 'react';
import { useVideoOptimization } from '../hooks/useVideoOptimization';
import videoSrc from '../assets/video.mp4';

const VideoPreloader = () => {
  const videoRef = useRef(null);
  const { shouldLoadVideo, getOptimalPreload } = useVideoOptimization();

  useEffect(() => {
    if (!shouldLoadVideo) return;

    // Crear un video oculto para precargar
    const preloadVideo = document.createElement('video');
    preloadVideo.style.display = 'none';
    preloadVideo.preload = getOptimalPreload();
    preloadVideo.muted = true;
    preloadVideo.playsInline = true;
    
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    
    preloadVideo.appendChild(source);
    document.body.appendChild(preloadVideo);

    // Limpiar cuando el componente se desmonte
    return () => {
      if (document.body.contains(preloadVideo)) {
        document.body.removeChild(preloadVideo);
      }
    };
  }, [shouldLoadVideo, getOptimalPreload]);

  return null; // Este componente no renderiza nada visible
};

export default VideoPreloader; 