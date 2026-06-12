import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Volume2, VolumeX, Maximize2, ChevronDown, Languages, Subtitles, Play, Pause, RotateCcw, RotateCw, SkipForward, List } from 'lucide-react';
import { loadYouTubeAPI, formatTime } from '../services/yt';
import VideoPlayerScreensaver from './VideoPlayerScreensaver';

/**
 * JANLYFLIX full native player.
 * Uses the YouTube IFrame Player API for real progress, seek, volume, etc.
 *
 * Props:
 *  - videos: TMDB videos array (trailers, teasers)
 *  - title: title to show in topbar
 *  - posterPath: path to movie/show poster for screensaver
 *  - backdropPath: path to movie/show backdrop for screensaver
 *  - episode: optional {season, number, name} → renders "T1:E3 · Name" + series UI
 *  - episodesList: optional [{season, number, name, still_path}] for the "Episodes" overlay
 *  - onEpisodeChange: optional callback(episode) when user picks one from the list
 *  - autoplay, onClose
 */
export default function VideoPlayer({ videos = [], title, posterPath, backdropPath, episode, episodesList, onEpisodeChange, autoplay = true, onClose }) {
  const sorted = useMemo(() => {
    const trailers = (videos || []).filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip'));
    return [...trailers].sort((a, b) => (b.official ? 1 : 0) - (a.official ? 1 : 0));
  }, [videos]);
  const isSeries = !!episode;
  const [current, setCurrent] = useState(sorted[0] || null);
  const [openLangs, setOpenLangs] = useState(false);
  const [openEpisodes, setOpenEpisodes] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(autoplay);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [hoverPct, setHoverPct] = useState(null);
  const [showScreensaver, setShowScreensaver] = useState(false);

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const ytDivRef = useRef(null);
  const hideTimer = useRef(0);

  useEffect(() => { setCurrent(sorted[0] || null); }, [sorted]);

  // Create/destroy YT player when current trailer changes
  useEffect(() => {
    if (!current) return;
    let player = null; let mounted = true;
    setReady(false); setCurrentTime(0); setDuration(0); setLoaded(0);
    loadYouTubeAPI().then(YT => {
      if (!mounted || !YT || !ytDivRef.current) return;
      player = new YT.Player(ytDivRef.current, {
        videoId: current.key,
        playerVars: {
          autoplay: autoplay ? 1 : 0, controls: 0, modestbranding: 1, rel: 0,
          playsinline: 1, fs: 0, iv_load_policy: 3, disablekb: 1, showinfo: 0,
          cc_load_policy: showCC ? 1 : 0, cc_lang_pref: 'es'
        },
        events: {
          onReady: (e) => {
            if (!mounted) return;
            playerRef.current = e.target;
            setReady(true);
            try { e.target.setVolume(volume); } catch (_) {}
            try { setDuration(e.target.getDuration() || 0); } catch (_) {}
          },
          onStateChange: (e) => {
            if (!mounted) return;
            const YS = window.YT.PlayerState;
            if (e.data === YS.PLAYING) setPlaying(true);
            else if (e.data === YS.PAUSED || e.data === YS.ENDED) setPlaying(false);
          }
        }
      });
      playerRef.current = player;
    });
    return () => {
      mounted = false;
      try { player?.destroy(); } catch (_) {}
      playerRef.current = null;
    };
    // eslint-disable-next-line
  }, [current?.key]);

  // Progress polling
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      const p = playerRef.current; if (!p) return;
      try {
        if (!seeking) setCurrentTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
        setLoaded((p.getVideoLoadedFraction() || 0) * 100);
      } catch (_) {}
    }, 350);
    return () => clearInterval(id);
  }, [ready, seeking]);

  // Auto-hide controls
  const bump = () => {
    setShowControls(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => { if (playing) setShowControls(false); }, 3000);
  };
  useEffect(() => { bump(); return () => clearTimeout(hideTimer.current); }, [playing]); // eslint-disable-line

  // Screensaver control - show when paused, hide when playing
  useEffect(() => {
    if (!playing && ready) {
      setShowScreensaver(true);
    } else {
      setShowScreensaver(false);
    }
  }, [playing, ready]);

  const togglePlay = () => {
    const p = playerRef.current; if (!p) return;
    if (playing) p.pauseVideo(); else p.playVideo();
  };
  const toggleMute = () => {
    const p = playerRef.current; if (!p) return;
    if (muted) { p.unMute(); setMuted(false); } else { p.mute(); setMuted(true); }
  };
  const onVolume = (v) => {
    setVolume(v); const p = playerRef.current; if (!p) return;
    p.setVolume(v); if (v === 0 && !muted) { p.mute(); setMuted(true); }
    else if (v > 0 && muted) { p.unMute(); setMuted(false); }
  };
  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const p = playerRef.current;
    if (p && duration) { p.seekTo(duration * pct, true); setCurrentTime(duration * pct); }
  };
  const onSeekHover = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverPct(Math.max(0, Math.min(1, x / rect.width)));
  };
  const skip = (delta) => {
    const p = playerRef.current; if (!p) return;
    p.seekTo(Math.max(0, Math.min(duration, p.getCurrentTime() + delta)), true);
  };
  const requestFs = () => {
    const el = containerRef.current; if (!el) return;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
    if (fn) fn.call(el);
  };
  const toggleCC = () => {
    const next = !showCC; setShowCC(next);
    const p = playerRef.current;
    try { if (p) next ? p.loadModule('captions') : p.unloadModule('captions'); } catch (_) {}
  };

  const langs = Array.from(new Set(sorted.map(v => v.iso_639_1 || 'xx')));
  const langName = (code) => ({ es:'Español', en:'Inglés', fr:'Francés', de:'Alemán', it:'Italiano', pt:'Portugués', ja:'Japonés', ko:'Coreano', xx:'Original' }[code] || code.toUpperCase());

  // Series next/prev episode helpers (must run before any conditional return)
  const epIndex = useMemo(() => {
    if (!isSeries || !episodesList || !episode) return -1;
    return episodesList.findIndex(e => e.season === episode.season && e.number === episode.number);
  }, [isSeries, episode, episodesList]);
  const nextEp = (isSeries && episodesList && epIndex >= 0 && epIndex < episodesList.length - 1) ? episodesList[epIndex + 1] : null;

  if (!current) {
    return <div className="player-shell flex items-center justify-center text-zinc-400" style={{aspectRatio:'16/9'}}>No hay tráiler disponible para este título.</div>;
  }

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`player-shell ${showControls ? 'is-active' : 'is-idle'} ${isSeries ? 'is-series' : ''}`}
      onMouseMove={bump}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
      onTouchStart={bump}
      onClick={(e)=>{ if(e.target === e.currentTarget || e.target.classList.contains('player-clickarea')) togglePlay(); }}
    >
      <div className="player-yt"><div ref={ytDivRef}/></div>
      <div className="player-clickarea" onClick={togglePlay}/>

      {/* Video Screensaver */}
      <VideoPlayerScreensaver 
        isVisible={showScreensaver}
        posterPath={posterPath}
        backdropPath={backdropPath}
        title={title}
        onScreensaverEnd={() => setShowScreensaver(false)}
      />

      {/* Loading indicator */}
      {!ready && <div className="player-loading"><div className="spinner"/></div>}

      {/* Top bar */}
      <div className="player-topbar">
        <div className="player-title-block">
          <div className="player-title font-display">{title}</div>
          {isSeries && (
            <div className="player-subtitle">
              <span className="player-ep-pill">T{episode.season} : E{episode.number}</span>
              <span className="player-ep-name">{episode.name}</span>
            </div>
          )}
        </div>
        <button onClick={onClose} className="player-btn" data-tip="Cerrar" aria-label="Cerrar"><X size={18}/></button>
      </div>

      {/* Center pause/play hint */}
      {!playing && ready && (
        <button onClick={togglePlay} className="player-center-play" aria-label="Reproducir"><Play size={36} fill="currentColor"/></button>
      )}

      {/* Bottom controls — Netflix-style */}
      <div className="player-bottom">
        {/* Progress bar */}
        <div className="player-progress-row">
          <div className="player-progress"
               onMouseDown={(e)=>{ setSeeking(true); onSeek(e); }}
               onMouseMove={(e)=>{ onSeekHover(e); if(seeking) onSeek(e); }}
               onMouseEnter={onSeekHover}
               onMouseUp={()=>setSeeking(false)}
               onMouseLeave={()=>{ setSeeking(false); setHoverPct(null); }}
               onTouchStart={(e)=>{ setSeeking(true); onSeek(e); }}
               onTouchMove={(e)=>{ if(seeking) onSeek(e); }}
               onTouchEnd={()=>setSeeking(false)}>
            <div className="player-progress-track">
              <div className="player-progress-buffered" style={{width: `${loaded}%`}}/>
              {hoverPct !== null && <div className="player-progress-hover" style={{width: `${hoverPct*100}%`}}/>}
              <div className="player-progress-played" style={{width: `${pct}%`}}/>
              <div className="player-progress-thumb" style={{left: `${pct}%`}}/>
              {hoverPct !== null && duration > 0 && (
                <div className="player-progress-tooltip" style={{left: `${hoverPct*100}%`}}>
                  {formatTime(hoverPct * duration)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="player-controls">
          <button onClick={togglePlay} className="player-btn" data-tip={playing?'Pausar':'Reproducir'} aria-label={playing?'Pausar':'Reproducir'}>
            {playing ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
          </button>
          <button onClick={()=>skip(-10)} className="player-btn player-skip" data-tip="-10s" aria-label="Retroceder 10 segundos"><RotateCcw size={18}/></button>
          <button onClick={()=>skip(10)} className="player-btn player-skip" data-tip="+10s" aria-label="Avanzar 10 segundos"><RotateCw size={18}/></button>

          {/* Next episode (series only) */}
          {isSeries && nextEp && (
            <button onClick={()=>onEpisodeChange?.(nextEp)} className="player-btn" data-tip="Episodio siguiente" aria-label="Episodio siguiente">
              <SkipForward size={18} fill="currentColor"/>
            </button>
          )}

          <div className="player-vol-group">
            <button onClick={toggleMute} className="player-btn" data-tip={muted?'Activar sonido':'Silenciar'}>
              {muted || volume === 0 ? <VolumeX size={18}/> : <Volume2 size={18}/>}
            </button>
            <input type="range" min="0" max="100" value={muted ? 0 : volume} onChange={e=>onVolume(parseInt(e.target.value,10))} className="player-vol-slider" aria-label="Volumen"/>
          </div>

          {/* Time display */}
          <div className="player-time-display">
            <span className="player-time">{formatTime(currentTime)}</span>
            <span className="player-time-sep">/</span>
            <span className="player-time">{formatTime(duration)}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Episodes list (series only) */}
            {isSeries && episodesList && episodesList.length > 1 && (
              <div className="relative">
                <button onClick={()=>setOpenEpisodes(o=>!o)} className="player-btn player-btn-text" data-tip="Episodios">
                  <List size={16}/> <span className="hidden sm:inline">Episodios</span>
                </button>
                {openEpisodes && (
                  <div className="player-episodes-menu" onMouseLeave={()=>setOpenEpisodes(false)}>
                    {episodesList.map((ep) => (
                      <button key={`${ep.season}-${ep.number}`} onClick={()=>{ onEpisodeChange?.(ep); setOpenEpisodes(false); }}
                              className={`player-episode-item ${(ep.season===episode.season && ep.number===episode.number)?'is-active':''}`}>
                        <span className="player-ep-num">T{ep.season}:E{ep.number}</span>
                        <span className="player-ep-label">{ep.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={toggleCC} className={`player-btn ${showCC?'is-on':''}`} data-tip="Subtítulos"><Subtitles size={18}/></button>

            <div className="relative">
              <button onClick={()=>setOpenLangs(o=>!o)} className="player-btn player-btn-text" data-tip="Idioma">
                <Languages size={16}/> <span className="hidden sm:inline">{langName(current.iso_639_1 || 'xx')}</span> <ChevronDown size={14}/>
              </button>
              {openLangs && (
                <div className="player-lang-menu" onMouseLeave={()=>setOpenLangs(false)}>
                  {langs.map(code => {
                    const opt = sorted.find(v => (v.iso_639_1 || 'xx') === code);
                    return (
                      <button key={code} onClick={()=>{ setCurrent(opt); setOpenLangs(false); }} className={`player-lang-item ${current?.iso_639_1===code?'is-active':''}`}>
                        <span>{langName(code)}</span>
                        <span className="text-zinc-500 text-xs">{opt?.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button onClick={requestFs} className="player-btn" data-tip="Pantalla completa" aria-label="Pantalla completa"><Maximize2 size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
