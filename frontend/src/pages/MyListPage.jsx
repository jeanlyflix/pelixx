import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import VideoModal from '../components/VideoModal';
import { useAuth } from '../context/AuthContext';
import { Bookmark } from 'lucide-react';

export default function MyListPage() {
  const { user } = useAuth();
  const [modal, setModal] = useState({ item: null, mode: 'info' });
  const list = user?.myList || [];

  return (
    <div className="layer min-h-screen">
      <Navbar />
      <div className="pt-32 px-6 md:px-16">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="text-[#c9a87c]" size={22}/>
          <span className="text-[11px] tracking-[.35em] uppercase text-[#c9a87c]">Tu colección</span>
        </div>
        <h1 className="font-display text-white text-4xl md:text-5xl font-bold mb-10">Mi lista</h1>
        {list.length === 0 ? (
          <div className="glass p-12 text-center max-w-xl">
            <p className="text-zinc-300 text-lg mb-2">Tu lista esta vacía</p>
            <p className="text-zinc-500 text-sm">Añade películas y series desde el catalogo para verlas aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {list.map(it => (
              <div key={`${it.media_type}-${it.id}`} style={{aspectRatio:'16/9'}}>
                <MovieCard item={it} onOpen={(i)=>setModal({item:i,mode:'info'})} onPlay={(i)=>setModal({item:i,mode:'play'})}/>
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
