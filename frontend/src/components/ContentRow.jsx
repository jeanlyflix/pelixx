import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function ContentRow({ title, items = [], onOpen, onPlay }) {
  const ref = useRef(null);

  const scroll = (dir) => {
    const el = ref.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!items || !items.length) return null;

  return (
    <section className="row-track">
      <div className="row-rail">
        <h2 className="row-title"><span>{title}</span></h2>
        <button onClick={()=>scroll(-1)} className="row-arrow left"><ChevronLeft size={28}/></button>
        <div className="row-list no-scrollbar" ref={ref}>
          {items.map((it, i) => (
            <MovieCard key={`${it.id}-${i}`} item={it} onOpen={onOpen} onPlay={onPlay} />
          ))}
        </div>
        <button onClick={()=>scroll(1)} className="row-arrow right"><ChevronRight size={28}/></button>
      </div>
    </section>
  );
}
