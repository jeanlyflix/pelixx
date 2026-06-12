import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Film, BarChart3, Trash2, ArrowLeft, Crown, Search, Plus, RefreshCw } from 'lucide-react';
import { TMDB, IMG_W300 } from '../services/tmdb';

export default function AdminPanel() {
  const { user, getUsers, saveUsers } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loadingCat, setLoadingCat] = useState(false);
  const [q, setQ] = useState('');
  const [searchRes, setSearchRes] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/browse'); return; }
    setUsers(getUsers());
    loadCatalog();
    // eslint-disable-next-line
  }, []);

  const refresh = () => setUsers(getUsers());

  const loadCatalog = async () => {
    setLoadingCat(true);
    const stored = JSON.parse(localStorage.getItem('strm_catalog') || 'null');
    if (stored) { setCatalog(stored); setLoadingCat(false); return; }
    try {
      const d = await TMDB.popularMovies();
      const top = d.results.map(r => ({ id: r.id, media_type: 'movie', title: r.title, poster_path: r.poster_path, year: (r.release_date||'').slice(0,4) }));
      setCatalog(top);
      localStorage.setItem('strm_catalog', JSON.stringify(top));
    } catch(e){} finally { setLoadingCat(false); }
  };

  const removeUser = (uname) => {
    if (uname === 'admin') return alert('No se puede eliminar el admin');
    if (!window.confirm(`¿Eliminar ${uname}?`)) return;
    const next = users.filter(u => u.username !== uname);
    saveUsers(next); setUsers(next);
  };

  const toggleRole = (uname) => {
    const next = users.map(u => u.username === uname ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u);
    saveUsers(next); setUsers(next);
  };

  const removeFromCatalog = (id) => {
    const next = catalog.filter(c => c.id !== id);
    setCatalog(next);
    localStorage.setItem('strm_catalog', JSON.stringify(next));
  };

  const searchTMDB = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const d = await TMDB.search(q);
    setSearchRes((d.results || []).filter(x => x.media_type === 'movie' || x.media_type === 'tv'));
  };

  const addToCatalog = (item) => {
    if (catalog.find(c => c.id === item.id && c.media_type === (item.media_type || 'movie'))) return;
    const newItem = { id: item.id, media_type: item.media_type || 'movie', title: item.title || item.name, poster_path: item.poster_path, year: ((item.release_date||item.first_air_date)||'').slice(0,4) };
    const next = [newItem, ...catalog];
    setCatalog(next);
    localStorage.setItem('strm_catalog', JSON.stringify(next));
  };

  const stats = {
    users: users.length,
    admins: users.filter(u=>u.role==='admin').length,
    profiles: users.reduce((s,u)=>s+(u.profiles?.length||0), 0),
    items: catalog.length,
    lists: users.reduce((s,u)=>s+(u.myList?.length||0), 0)
  };

  return (
    <div className="layer min-h-screen">
      <header className="flex items-center gap-4 px-6 md:px-10 py-5 border-b border-white/5">
        <button onClick={()=>navigate('/browse')} className="btn-icon"><ArrowLeft size={16}/></button>
        <div>
          <div className="text-[10px] tracking-[.35em] uppercase text-[#c9a87c] flex items-center gap-2"><Crown size={12}/> Panel de control</div>
          <h1 className="font-display text-white text-2xl font-bold">Administración</h1>
        </div>
        <div className="ml-auto">
          <button onClick={refresh} className="btn btn-ghost" style={{padding:'8px 14px', fontSize:'13px'}}><RefreshCw size={14}/> Refrescar</button>
        </div>
      </header>

      <div className="flex gap-2 px-6 md:px-10 pt-5">
        {[
          { k:'overview', label:'Resumen', icon: BarChart3 },
          { k:'users', label:'Usuarios', icon: Users },
          { k:'catalog', label:'Catalogo', icon: Film }
        ].map(({k,label,icon:Icon}) => (
          <button key={k} onClick={()=>setTab(k)} className={`admin-tab ${tab===k?'active':''}`}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {label:'Usuarios', value: stats.users},
              {label:'Admins', value: stats.admins},
              {label:'Perfiles', value: stats.profiles},
              {label:'Ítems catalogo', value: stats.items},
              {label:'En listas', value: stats.lists}
            ].map(s => (
              <div key={s.label} className="kpi">
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-value">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="glass overflow-hidden">
            <table className="table-strm">
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Perfiles</th><th>Creado</th><th></th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.username}>
                    <td className="font-semibold text-white">{u.username}</td>
                    <td className="text-zinc-400">{u.email}</td>
                    <td><span className={`chip ${u.role==='admin'?'chip-accent':''}`}>{u.role}</span></td>
                    <td>{u.profiles?.length || 0}</td>
                    <td className="text-zinc-500">{(u.createdAt||'').slice(0,10)}</td>
                    <td className="text-right">
                      <button onClick={()=>toggleRole(u.username)} className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 mr-2 transition">Cambiar rol</button>
                      <button onClick={()=>removeUser(u.username)} className="text-xs px-3 py-1.5 rounded-md bg-[#d97070]/15 text-[#d97070] hover:bg-[#d97070]/25 inline-flex items-center gap-1 transition"><Trash2 size={12}/> Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'catalog' && (
          <div>
            <form onSubmit={searchTMDB} className="flex gap-2 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                <input className="field field-with-icon" placeholder="Buscar en TMDB para añadir..." value={q} onChange={e=>setQ(e.target.value)} />
              </div>
              <button className="btn btn-primary">Buscar</button>
            </form>

            {searchRes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-zinc-300 mb-4 text-sm tracking-wide">Resultados (pulsa + para añadir):</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {searchRes.slice(0,12).map(r => (
                    <div key={`${r.media_type}-${r.id}`} className="glass overflow-hidden" style={{borderRadius:'12px'}}>
                      {r.poster_path ? <img src={`${IMG_W300}${r.poster_path}`} alt="" className="w-full aspect-[2/3] object-cover"/> : <div className="w-full aspect-[2/3] bg-zinc-900"/>}
                      <div className="p-2.5">
                        <p className="text-white text-[12px] font-semibold line-clamp-1">{r.title || r.name}</p>
                        <button onClick={()=>addToCatalog(r)} className="mt-2 w-full text-[11px] bg-[#c9a87c]/20 text-[#c9a87c] hover:bg-[#c9a87c]/30 py-1.5 rounded-md inline-flex items-center justify-center gap-1 transition"><Plus size={11}/> Añadir</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-zinc-300 mb-4 text-sm tracking-wide">Catalogo destacado ({catalog.length})</h3>
            {loadingCat && <p className="text-zinc-500">Cargando...</p>}
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {catalog.map(c => (
                <div key={`${c.media_type}-${c.id}`} className="glass overflow-hidden relative group" style={{borderRadius:'12px'}}>
                  {c.poster_path ? <img src={`${IMG_W300}${c.poster_path}`} alt="" className="w-full aspect-[2/3] object-cover"/> : <div className="w-full aspect-[2/3] bg-zinc-900"/>}
                  <div className="p-2">
                    <p className="text-white text-[12px] line-clamp-1 font-semibold">{c.title}</p>
                    <p className="text-zinc-500 text-[10px]">{c.year} • {c.media_type}</p>
                  </div>
                  <button onClick={()=>removeFromCatalog(c.id)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-[#d97070]/90 hover:bg-[#d97070] rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
