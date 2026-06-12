import React, { useEffect, useState } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Calendar, Clock, Globe, Tv, ChevronDown } from 'lucide-react';
import { TMDB, IMG, IMG_W500, IMG_W300 } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from './VideoPlayer';

export default function VideoModal({ item, mode = 'info', onClose, onPlay }) {
  const [detail, setDetail] = useState(null);
  const [season, setSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);
  const { toggleMyList, inMyList, toggleLike, isLiked } = useAuth();

  const isTV = (item?.media_type === 'tv') || (!!item?.first_air_date && !item?.title);

  useEffect(() => {
    if (!item) return;
    setDetail(null); setSeasonData(null); setSeason(1);
    const loader = isTV ? TMDB.tvDetail(item.id) : TMDB.movieDetail(item.id);
    loader.then(d => {
      setDetail(d);
      if (isTV) {
        // Pick first season that has episodes (skip "Specials" season 0)
        const firstSeason = (d.seasons || []).find(s => s.season_number > 0) || (d.seasons || [])[0];
        if (firstSeason) setSeason(firstSeason.season_number);
      }
    }).catch(()=>{});
  }, [item, isTV]);

  // Load season episodes for TV (keep old episodes visible until new load completes for smooth transition)
  useEffect(() => {
    if (!isTV || !detail || season == null) return;
    let alive = true;
    setSeasonLoading(true);
    TMDB.tvSeason(item.id, season).then(d => {
      if (!alive) return; setSeasonData(d); setSeasonLoading(false);
    }).catch(() => alive && setSeasonLoading(false));
    return () => { alive = false; };
  }, [isTV, item?.id, season, detail]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!item) return null;
  const title = item.title || item.name;
  const enriched = { ...item, media_type: isTV ? 'tv' : 'movie' };
  const isInList = inMyList(enriched);
  const liked = isLiked(enriched);
  const score = (detail?.vote_average ?? item.vote_average) || 0;
  const scorePct = Math.round(score * 10);
  const year = (detail?.release_date || detail?.first_air_date || item.release_date || item.first_air_date || '').slice(0,4);
  const videos = detail?.videos?.results || [];
  const seasons = (detail?.seasons || []).filter(s => s.season_number > 0);

  // For series, expose currently selected episode (from item._episode if present) + flat episode list
  const playEpisode = isTV ? (item._episode || (seasonData?.episodes?.[0] ? { season, number: seasonData.episodes[0].episode_number, name: seasonData.episodes[0].name } : null)) : null;
  const flatEpisodes = isTV && seasonData ? (seasonData.episodes || []).map(e => ({ season, number: e.episode_number, name: e.name, still_path: e.still_path })) : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e)=>e.stopPropagation()}>
        <button onClick={onClose} className="detail-close" aria-label="Cerrar" data-tip="Cerrar (Esc)"><X size={18}/></button>

        {mode === 'play' ? (
          <VideoPlayer
            videos={videos}
            title={title}
            posterPath={item.poster_path}
            backdropPath={item.backdrop_path}
            episode={playEpisode}
            episodesList={flatEpisodes}
            onEpisodeChange={(ep)=>{ /* in-modal episode switch — for now just visual; reseed via item update */ }}
            onClose={onClose}/>
        ) : (
          <div className="detail-top">
            {item.backdrop_path && <img src={`${IMG}${item.backdrop_path}`} alt={title} className="detail-top-img"/>}
            <div className="detail-top-fade"/>
            <div className="detail-top-content">
              <div className="hero-eyebrow">{isTV ? 'Serie' : 'Película'}</div>
              <h2 className="detail-title font-display">{title}</h2>
              <div className="detail-meta">
                {scorePct > 0 && (
                  <span className="score-circle" data-tip="Puntuación media">
                    <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3"/><circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0bb89" strokeWidth="3" strokeDasharray={`${scorePct}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)"/></svg>
                    <span>{scorePct}%</span>
                  </span>
                )}
                {year && <span className="meta-pill"><Calendar size={13}/> {year}</span>}
                {detail?.runtime && <span className="meta-pill"><Clock size={13}/> {Math.floor(detail.runtime/60)}h {detail.runtime%60}m</span>}
                {detail?.number_of_seasons && <span className="meta-pill"><Tv size={13}/> {detail.number_of_seasons} temporada(s)</span>}
                {detail?.original_language && <span className="meta-pill"><Globe size={13}/> {detail.original_language.toUpperCase()}</span>}
                <span className="chip">HD</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-5">
                <button onClick={()=>onPlay?.(enriched)} className="btn btn-primary" data-tip="Reproducir"><Play size={18} fill="currentColor"/> Reproducir</button>
                <button onClick={()=>toggleMyList(enriched)} className="btn-icon" data-tip={isInList?'Quitar de mi lista':'Añadir a mi lista'}>
                  {isInList ? <Check size={18}/> : <Plus size={18}/>}
                </button>
                <button onClick={()=>toggleLike(enriched)} className={`btn-icon ${liked?'is-active':''}`} data-tip={liked?'Te gusta':'Me gusta'} aria-pressed={liked}>
                  <ThumbsUp size={16} fill={liked?'currentColor':'none'}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode !== 'play' && (
          <div className="detail-body">
            {/* Sinopsis + metadata - always visible at top */}
            <section className="detail-section">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h3 className="detail-section-title">Sinopsis</h3>
                  <p className="text-zinc-200 text-[15px] leading-relaxed">{detail?.overview || item.overview || 'Sin descripción disponible.'}</p>
                </div>
                <div className="text-sm space-y-3 pt-1">
                  {detail?.credits?.cast?.length > 0 && (
                    <div><span className="text-zinc-500">Reparto: </span><span className="text-zinc-200">{detail.credits.cast.slice(0,4).map(c=>c.name).join(', ')}</span></div>
                  )}
                  {detail?.genres?.length > 0 && (
                    <div><span className="text-zinc-500">Géneros: </span><span className="text-zinc-200">{detail.genres.map(g=>g.name).join(', ')}</span></div>
                  )}
                  {detail?.production_companies?.length > 0 && (
                    <div><span className="text-zinc-500">Producción: </span><span className="text-zinc-200">{detail.production_companies.slice(0,3).map(p=>p.name).join(', ')}</span></div>
                  )}
                </div>
              </div>
            </section>

            {/* EPISODES — always visible for TV/series/anime */}
            {isTV && (
              <section className="detail-section">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                  <h3 className="detail-section-title m-0">Episodios</h3>
                  {seasons.length > 1 && (
                    <div className="season-picker">
                      <button onClick={()=>setSeasonMenuOpen(o=>!o)} className="season-picker-btn">
                        Temporada {season} <ChevronDown size={16}/>
                      </button>
                      {seasonMenuOpen && (
                        <div className="season-menu" onMouseLeave={()=>setSeasonMenuOpen(false)}>
                          {seasons.map(s => (
                            <button key={s.id} onClick={()=>{ setSeason(s.season_number); setSeasonMenuOpen(false); }} className={`season-menu-item ${s.season_number===season?'is-active':''}`}>
                              <span>Temporada {s.season_number}</span>
                              <span className="text-zinc-500 text-xs">{s.episode_count} eps</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {seasonLoading && (
                  <div className="season-loading-bar" aria-hidden="true"><span/></div>
                )}

                <div className={`episode-list ${seasonLoading ? 'is-loading' : ''}`}>
                  {(seasonData?.episodes || []).map((ep) => (
                    <div key={`s${season}-${ep.id}`} className="episode-item" onClick={()=>onPlay?.({ ...enriched, _episode: { season, number: ep.episode_number, name: ep.name } })}>
                      <div className="episode-num">{ep.episode_number}</div>
                      <div className="episode-thumb">
                        {ep.still_path ? <img src={`${IMG_W300}${ep.still_path}`} alt=""/> : <div className="ep-no-img"><Tv size={20}/></div>}
                        <button className="episode-play" aria-label="Reproducir episodio"><Play size={20} fill="currentColor"/></button>
                      </div>
                      <div className="episode-info">
                        <div className="flex items-baseline justify-between gap-3 flex-wrap">
                          <h4 className="episode-title font-display">{ep.name}</h4>
                          {ep.runtime && <span className="text-zinc-500 text-xs shrink-0">{ep.runtime} min</span>}
                        </div>
                        <p className="episode-overview line-clamp-2">{ep.overview || 'Sin descripción.'}</p>
                        {ep.air_date && <p className="text-zinc-600 text-[11px] mt-1">Emitido: {new Date(ep.air_date).toLocaleDateString('es-ES', {day:'2-digit', month:'short', year:'numeric'})}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reparto */}
            {detail?.credits?.cast?.length > 0 && (
              <section className="detail-section">
                <h3 className="detail-section-title">Reparto principal</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {detail.credits.cast.slice(0,12).map(c => (
                    <div key={c.id} className="text-center">
                      <div className="rounded-xl overflow-hidden bg-white/5 aspect-square mb-2">
                        {c.profile_path ? <img src={`${IMG_W500}${c.profile_path}`} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-500 text-2xl font-bold">{c.name?.[0]}</div>}
                      </div>
                      <p className="text-white text-xs font-semibold line-clamp-1">{c.name}</p>
                      <p className="text-zinc-500 text-[11px] line-clamp-1">{c.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similares */}
            {detail?.similar?.results?.length > 0 && (
              <section className="detail-section">
                <h3 className="detail-section-title">Más como esto</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {detail.similar.results.slice(0,9).map(s => (
                    <div key={s.id} className="similar-card" onClick={()=>onPlay?.({...s, media_type: isTV ? 'tv' : 'movie'})}>
                      {s.backdrop_path && <img src={`${IMG_W500}${s.backdrop_path}`} alt="" className="w-full aspect-video object-cover"/>}
                      <div className="p-3">
                        <p className="text-white font-semibold mb-1 line-clamp-1 text-sm">{s.title || s.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
