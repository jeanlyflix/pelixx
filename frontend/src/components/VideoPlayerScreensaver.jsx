import React, { useEffect, useState } from 'react';
import './VideoPlayerScreensaver.css';

/**
 * VideoPlayerScreensaver - Screensaver tipo Netflix para el reproductor
 * Muestra cuando el video está pausado, desaparece después de 5 segundos
 */
export default function VideoPlayerScreensaver({ 
  isVisible, 
  posterPath, 
  backdropPath, 
  title,
  onScreensaverEnd 
}) {
  const [displayScreensaver, setDisplayScreensaver] = useState(isVisible);
  
  useEffect(() => {
    if (!isVisible) {
      setDisplayScreensaver(false);
      return;
    }
    
    setDisplayScreensaver(true);
    const timer = setTimeout(() => {
      setDisplayScreensaver(false);
      onScreensaverEnd?.();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isVisible, onScreensaverEnd]);

  if (!displayScreensaver) return null;

  const posterUrl = posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null;
  const backdropUrl = backdropPath ? `https://image.tmdb.org/t/p/w500${backdropPath}` : null;

  return (
    <div className="video-screensaver-overlay">
      {/* Poster difuminado a la izquierda */}
      {backdropUrl && (
        <div 
          className="video-screensaver-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="video-screensaver-backdrop-blur" />
        </div>
      )}

      {/* Contenido principal */}
      <div className="video-screensaver-content">
        {/* Poster de la película */}
        <div className="video-screensaver-poster-container">
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt={title}
              className="video-screensaver-poster"
            />
          )}
        </div>

        {/* Información y logo */}
        <div className="video-screensaver-info">
          <div className="video-screensaver-logo">JANLYFLIX</div>
          <h3 className="video-screensaver-title font-display">{title}</h3>
          <div className="video-screensaver-hint">Reproduciendo...</div>
        </div>
      </div>

      {/* Gradiente decorativo */}
      <div className="video-screensaver-gradient" />
    </div>
  );
}
