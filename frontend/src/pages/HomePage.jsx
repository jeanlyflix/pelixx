import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import ContentRow from '../components/ContentRow';
import VideoModal from '../components/VideoModal';
import Footer from '../components/Footer';
import { SkeletonRow } from '../components/SkeletonCard';
import { TMDB } from '../services/tmdb';
import { GENRES, KIDS_GENRE_IDS } from '../mock';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ mode = 'all' }) {
  const [hero, setHero] = useState(null);
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState({ item: null, mode: 'info' });
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const kidsMode = !!profile?.isKid;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setHero(null);
    setRows([]);
    (async () => {
      try {
        let r = [];
        if (kidsMode) {
          const genreStr = KIDS_GENRE_IDS.join(',');
          const [fam, anim, advn] = await Promise.all([
            TMDB.byGenre(10751, 'movie'),
            TMDB.byGenre(16, 'movie'),
            TMDB.byGenre(12, 'movie')
          ]);
          r = [
            { title: 'Para la familia', items: fam.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Animación divertida', items: anim.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Aventuras', items: advn.results.map(i=>({...i, media_type:'movie'})) }
          ];
          if (isMounted) setHero(anim.results[Math.floor(Math.random()*5)]);
        } else if (mode === 'movies') {
          const [trend, pop, top, up, now] = await Promise.all([
            TMDB.trendingMovies(), TMDB.popularMovies(), TMDB.topRatedMovies(), TMDB.upcoming(), TMDB.nowPlaying()
          ]);
          r = [
            { title: 'Tendencias en películas', items: trend.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Populares', items: pop.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'En cartelera', items: now.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Próximos estrenos', items: up.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Mejor valoradas', items: top.results.map(i=>({...i, media_type:'movie'})) }
          ];
          if (isMounted) setHero(trend.results[Math.floor(Math.random()*5)]);
        } else if (mode === 'series') {
          const [trend, pop, top, air] = await Promise.all([
            TMDB.trendingTV(), TMDB.popularTV(), TMDB.topRatedTV(), TMDB.airingToday()
          ]);
          r = [
            { title: 'Tendencias en series', items: trend.results.map(i=>({...i, media_type:'tv'})) },
            { title: 'Populares', items: pop.results.map(i=>({...i, media_type:'tv'})) },
            { title: 'Hoy en emisión', items: air.results.map(i=>({...i, media_type:'tv'})) },
            { title: 'Las mejor valoradas', items: top.results.map(i=>({...i, media_type:'tv'})) }
          ];
          if (isMounted) setHero(trend.results[Math.floor(Math.random()*5)]);
        } else if (mode === 'new') {
          const [up, now, air] = await Promise.all([TMDB.upcoming(), TMDB.nowPlaying(), TMDB.airingToday()]);
          r = [
            { title: 'Próximos estrenos', items: up.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'En cines ahora', items: now.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Series en emisión hoy', items: air.results.map(i=>({...i, media_type:'tv'})) }
          ];
          if (isMounted) setHero(up.results[0]);
        } else {
          const [trendM, trendT, popM, popT, top] = await Promise.all([
            TMDB.trendingMovies(), TMDB.trendingTV(), TMDB.popularMovies(), TMDB.popularTV(), TMDB.topRatedMovies()
          ]);
          r = [
            { title: 'Tendencias ahora', items: [...trendM.results.slice(0,10).map(i=>({...i, media_type:'movie'})), ...trendT.results.slice(0,10).map(i=>({...i, media_type:'tv'}))] },
            { title: 'Películas populares', items: popM.results.map(i=>({...i, media_type:'movie'})) },
            { title: 'Series populares', items: popT.results.map(i=>({...i, media_type:'tv'})) },
            { title: 'Joyas mejor valoradas', items: top.results.map(i=>({...i, media_type:'movie'})) }
          ];
          const pickGenres = [28, 35, 27, 10749];
          const genreData = await Promise.all(pickGenres.map(id => TMDB.byGenre(id)));
          genreData.forEach((g, i) => {
            const name = GENRES.find(x=>x.id===pickGenres[i])?.name;
            r.push({ title: name, items: g.results.map(it=>({...it, media_type:'movie'})) });
          });
          if (isMounted) setHero(trendM.results[Math.floor(Math.random()*5)]);
        }
        if (isMounted) setRows(r);
      } catch (e) { console.error(e); }
      finally { if (isMounted) setLoading(false); }
    })();
    return () => { isMounted = false; };
  }, [mode, kidsMode]);

  return (
    <div className="layer min-h-screen" key={mode + (kidsMode?'-k':'')}>
      <Navbar />
      {hero ? <HeroBanner item={hero} onPlay={(i)=>setModal({item:i, mode:'play'})} onInfo={(i)=>setModal({item:i, mode:'info'})} /> : <div className="hero hero-skeleton"/> }
      <div className="rows-wrap relative">
        {loading && rows.length === 0 && (
          <>
            <SkeletonRow count={7}/>
            <SkeletonRow count={7}/>
            <SkeletonRow count={7}/>
          </>
        )}
        {rows.map((row, i) => (
          <div key={i} className="row-fade-in" style={{animationDelay: `${i*70}ms`}}>
            <ContentRow title={row.title} items={row.items}
              onOpen={(it)=>setModal({item:it, mode:'info'})}
              onPlay={(it)=>setModal({item:it, mode:'play'})}
            />
          </div>
        ))}
      </div>
      <Footer />
      {modal.item && <VideoModal item={modal.item} mode={modal.mode}
        onClose={()=>setModal({item:null, mode:'info'})}
        onPlay={(i)=>setModal({item:i, mode:'play'})}/>}
    </div>
  );
}
