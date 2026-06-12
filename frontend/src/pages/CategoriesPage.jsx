import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import VideoModal from '../components/VideoModal';
import SkeletonCard from '../components/SkeletonCard';
import { TMDB } from '../services/tmdb';
import { GENRES } from '../mock';
import { Zap, Compass, Sparkles, Smile, Shield, Film, Theater, Heart, Wand2, BookOpen, Ghost, Music, Search, Flower2, Rocket, Eye, Flag, Sun, ArrowLeft } from 'lucide-react';

const ICON_BY = {
  zap: Zap, compass: Compass, sparkles: Sparkles, smile: Smile, shield: Shield,
  film: Film, theater: Theater, heart: Heart, wand: Wand2, book: BookOpen,
  ghost: Ghost, music: Music, search: Search, flower: Flower2, rocket: Rocket,
  eye: Eye, flag: Flag, sun: Sun
};

export default function CategoriesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ item: null, mode: 'info' });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([TMDB.byGenre(id, 'movie'), TMDB.byGenre(id, 'tv')]).then(([m, t]) => {
      const merged = [
        ...m.results.map(x => ({...x, media_type:'movie'})),
        ...t.results.map(x => ({...x, media_type:'tv'}))
      ];
      setResults(merged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (!id) {
    // Categories grid
    return (
      <div className="layer min-h-screen">
        <Navbar />
        <div className="pt-32 px-6 md:px-16 page-fade-in">
          <span className="text-[11px] tracking-[.35em] uppercase text-[#e0a370]">Explorar</span>
          <h1 className="font-display text-white text-4xl md:text-5xl font-bold mt-1 mb-8">Categorías</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map(g => {
              const Icon = ICON_BY[g.emoji] || Film;
              return (
                <button key={g.id} onClick={()=>navigate(`/categories/${g.id}`)} className="cat-tile">
                  <Icon size={26} className="cat-tile-icon"/>
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const genre = GENRES.find(g => String(g.id) === String(id));
  return (
    <div className="layer min-h-screen">
      <Navbar />
      <div className="pt-32 px-6 md:px-16 page-fade-in">
        <button onClick={()=>navigate('/categories')} className="text-[#e0a370] text-sm inline-flex items-center gap-2 mb-4 hover:text-[#f0bb89]"><ArrowLeft size={14}/> Todas las categorías</button>
        <span className="text-[11px] tracking-[.35em] uppercase text-[#e0a370]">Categoría</span>
        <h1 className="font-display text-white text-4xl md:text-5xl font-bold mb-8">{genre?.name}</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_,i)=>(<div key={i} style={{aspectRatio:'16/9'}}><SkeletonCard/></div>))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {results.map(it => (
              <div key={`${it.media_type}-${it.id}`} style={{aspectRatio:'16/9'}}>
                <MovieCard item={it} onOpen={(i)=>setModal({item:i, mode:'info'})} onPlay={(i)=>setModal({item:i, mode:'play'})}/>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      {modal.item && <VideoModal item={modal.item} mode={modal.mode} onClose={()=>setModal({item:null,mode:'info'})} onPlay={(i)=>setModal({item:i,mode:'play'})}/>}
    </div>
  );
}
