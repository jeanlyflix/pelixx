import React from 'react';
import { Play, Info, Plus, Check } from 'lucide-react';
import { IMG, IMG_W780 } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';

export default function HeroBanner({ item, onPlay, onInfo }) {
  const { toggleMyList, inMyList } = useAuth();
  if (!item) return null;
  const title = item.title || item.name;
  const media_type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const enriched = { ...item, media_type };
  const backdrop = item.backdrop_path ? `${IMG}${item.backdrop_path}` : '';
  const poster   = item.poster_path   ? `${IMG_W780}${item.poster_path}`   : backdrop;
  const isInList = inMyList(enriched);

  return (
    <div className="hero">
      {/* Desktop / wide: backdrop 16:9 */}
      <div className="hero-bg hero-bg-desktop">
        {backdrop ? <img src={backdrop} alt={title}/> : <div className="w-full h-full bg-zinc-900"/>}
      </div>
      {/* Mobile / portrait: poster 2:3 (full, not cropped) */}
      <div className="hero-bg hero-bg-mobile">
        {poster ? <img src={poster} alt={title}/> : <div className="w-full h-full bg-zinc-900"/>}
      </div>
      <div className="hero-fade-left"/>
      <div className="hero-fade-bottom"/>
      <div className="hero-content">
        <div className="hero-eyebrow">{media_type === 'tv' ? 'Serie destacada' : 'Película destacada'}</div>
        <h1 className="hero-title">{title}</h1>
        <div className="flex items-center gap-4 mb-5 text-[13px] text-zinc-300 flex-wrap">
          {item.vote_average > 0 && <span className="text-[#f0bb89] font-semibold">{Math.round(item.vote_average*10)}% match</span>}
          <span>{(item.release_date || item.first_air_date || '').slice(0,4)}</span>
          <span className="chip">HD</span>
        </div>
        <p className="text-zinc-200 text-[15px] leading-relaxed line-clamp-3 mb-7 max-w-xl drop-shadow hero-overview">{item.overview}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={()=>onPlay?.(enriched)} className="btn btn-primary"><Play size={18} fill="currentColor"/> Reproducir</button>
          <button onClick={()=>onInfo?.(enriched)} className="btn btn-ghost"><Info size={18}/> Más información</button>
          <button onClick={()=>toggleMyList(enriched)} className="btn-icon" title={isInList?'Quitar':'Añadir'}>
            {isInList ? <Check size={18}/> : <Plus size={18}/>}
          </button>
        </div>
      </div>
    </div>
  );
}
