import React, { useState } from 'react';
import { Plus, Check, Play, Info, ThumbsUp } from 'lucide-react';
import { IMG_W500 } from '../services/tmdb';
import { useAuth } from '../context/AuthContext';

export default function MovieCard({ item, onOpen, onPlay }) {
  const { toggleMyList, inMyList, toggleLike, isLiked } = useAuth();
  const [burst, setBurst] = useState(false);
  const media_type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const enriched = { ...item, media_type };
  const title = item.title || item.name;
  const img = item.backdrop_path ? `${IMG_W500}${item.backdrop_path}` : (item.poster_path ? `${IMG_W500}${item.poster_path}` : null);
  const year = (item.release_date || item.first_air_date || '').slice(0,4);
  const score = item.vote_average > 0 ? Math.round(item.vote_average*10) : null;
  const isInList = inMyList(enriched);
  const liked = isLiked(enriched);

  const onLike = (e) => {
    e.stopPropagation();
    if (!liked) { setBurst(true); setTimeout(()=>setBurst(false), 700); }
    toggleLike(enriched);
  };

  return (
    <div className="row-card group" onClick={() => onOpen?.(enriched)}>
      <div className="card-inner">
        {img ? (
          <img src={img} alt={title} className="card-img" loading="lazy" />
        ) : (
          <div className="card-img flex items-center justify-center text-zinc-500 text-sm p-2 text-center">{title}</div>
        )}

        <div className="card-actions">
          <button onClick={(e)=>{e.stopPropagation(); onPlay?.(enriched);}} className="card-act-btn card-act-primary" data-tip="Reproducir" aria-label="Reproducir">
            <Play size={14} fill="currentColor"/>
          </button>
          <button onClick={(e)=>{e.stopPropagation(); toggleMyList(enriched);}} data-tip={isInList?'Quitar de mi lista':'Añadir a mi lista'} aria-pressed={isInList}
                  className={`card-act-btn ${isInList?'is-active':''}`}>
            {isInList ? <Check size={14}/> : <Plus size={14}/>}
          </button>
          <button onClick={onLike} data-tip={liked?'Te gusta':'Me gusta'} aria-pressed={liked} className={`card-act-btn like-btn ${liked?'is-liked':''}`}>
            <ThumbsUp size={13} fill={liked?'currentColor':'none'}/>
            {burst && (
              <span className="like-burst" aria-hidden="true">
                {[...Array(6)].map((_,i)=>(<span key={i} className={`like-spark s${i}`}/>))}
              </span>
            )}
          </button>
          <button onClick={(e)=>{e.stopPropagation(); onOpen?.(enriched);}} className="card-act-btn ml-auto" data-tip="Más información" aria-label="Más información">
            <Info size={14}/>
          </button>
        </div>

        <div className="card-title-overlay">
          <p className="ttl">{title}</p>
          <div className="ttl-meta flex items-center gap-2 flex-wrap">
            {score !== null && <span>{score}%</span>}
            {year && <span style={{color:'rgba(196,181,160,.85)'}}>· {year}</span>}
            {media_type === 'tv' && <span style={{color:'rgba(196,181,160,.85)'}}>· Serie</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
