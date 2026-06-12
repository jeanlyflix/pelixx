import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import VideoModal from '../components/VideoModal';
import SkeletonCard from '../components/SkeletonCard';
import { TMDB } from '../services/tmdb';
import { Search, X } from 'lucide-react';

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [results, setResults] = useState([]);
  const [modal, setModal] = useState({ item: null, mode: 'info' });
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const id = ++reqId.current;
    setLoading(true);
    TMDB.search(q).then(d => {
      if (id !== reqId.current) return; // ignore stale
      setResults((d.results || []).filter(x => x.media_type === 'movie' || x.media_type === 'tv'));
      setLoading(false);
    }).catch(()=>{ if (id === reqId.current) setLoading(false); });
  }, [q]);

  return (
    <div className="layer min-h-screen">
      <Navbar />
      <div className="pt-32 px-6 md:px-16 page-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Search className="text-[#e0a370]" size={20}/>
          <span className="text-[11px] tracking-[.35em] uppercase text-[#e0a370]">Resultados</span>
        </div>
        <h1 className="font-display text-white text-3xl md:text-4xl font-bold mb-8">
          {q ? <>Búsqueda: <span className="text-[#e0a370]">“{q}”</span></> : 'Empieza a escribir para buscar'}
        </h1>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({length: 10}).map((_,i)=>(<div key={i} style={{aspectRatio:'16/9'}}><SkeletonCard/></div>))}
          </div>
        )}

        {!loading && q && results.length === 0 && (
          <div className="glass p-10 max-w-xl">
            <p className="text-zinc-300">Sin resultados para “{q}”.</p>
            <p className="text-zinc-500 text-sm mt-2">Prueba con otra palabra clave.</p>
          </div>
        )}

        {!loading && (
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
