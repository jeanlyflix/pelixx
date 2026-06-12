import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ChevronDown, LogOut, UserCircle, Shield, ArrowLeft, X, LayoutGrid } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import { isAdminUser } from '../mock';

export default function Navbar() {
  const { user, profile, logout, switchProfile, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [q, setQ] = useState('');
  const debounceRef = useRef(0);

  const onSearchPage = location.pathname.startsWith('/search');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync query from URL when on search page
  useEffect(() => {
    if (onSearchPage) {
      const params = new URLSearchParams(location.search);
      const urlQ = params.get('q') || '';
      setQ(urlQ);
      setSearchOpen(true);
    }
  }, [location.search, onSearchPage]);

  // Live search: debounced navigation
  const onChangeSearch = (e) => {
    const v = e.target.value;
    setQ(v);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (v.trim()) navigate(`/search?q=${encodeURIComponent(v.trim())}`, { replace: onSearchPage });
      else if (onSearchPage) navigate('/search', { replace: true });
    }, 220);
  };

  const closeSearch = () => {
    setQ(''); setSearchOpen(false);
    if (onSearchPage) navigate(-1);
  };

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      {onSearchPage && (
        <button onClick={()=>navigate(-1)} className="nav-action-btn shrink-0" title="Volver" aria-label="Volver">
          <ArrowLeft size={18}/>
        </button>
      )}
      <Link to="/browse" className="brand-mark brand-mark-anim">JANLYFLIX</Link>

      <div className="nav-links hidden md:flex items-center gap-7 ml-4">
        <NavLink to="/browse" end className={({isActive})=>`nav-link ${isActive?'active':''}`}>Inicio</NavLink>
        <NavLink to="/browse/series" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Series</NavLink>
        <NavLink to="/browse/movies" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Películas</NavLink>
        <NavLink to="/browse/new" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Novedades</NavLink>
        <NavLink to="/categories" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Categorías</NavLink>
        <NavLink to="/my-list" className={({isActive})=>`nav-link ${isActive?'active':''}`}>Mi lista</NavLink>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex items-center">
          {searchOpen ? (
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e0a370]"/>
              <input
                autoFocus
                value={q}
                onChange={onChangeSearch}
                placeholder="Buscar películas, series..."
                className="nav-search-input pl-9 pr-9"
                aria-label="Búsqueda"
              />
              {q && (
                <button onClick={()=>{setQ(''); if(onSearchPage) navigate('/search', {replace:true});}} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1">
                  <X size={14}/>
                </button>
              )}
            </div>
          ) : (
            <button type="button" onClick={()=>setSearchOpen(true)} className="nav-action-btn" data-tip="Buscar (Ctrl+K)" aria-label="Buscar">
              <Search size={17}/>
            </button>
          )}
          {searchOpen && !onSearchPage && (
            <button onClick={closeSearch} className="text-zinc-400 hover:text-white p-1 ml-1" title="Cerrar"><X size={14}/></button>
          )}
        </div>

        <NavLink to="/categories" className="nav-action-btn hidden md:flex" data-tip="Categorías" aria-label="Categorías">
          <LayoutGrid size={17}/>
        </NavLink>

        <div className="relative">
          <button className="nav-action-btn hidden sm:flex" data-tip="Notificaciones" onClick={()=>setNotifOpen(o=>!o)} aria-label="Notificaciones">
            <Bell size={17}/>
            {unreadCount > 0 && <span className="dot" />}
          </button>
          {notifOpen && <NotificationsPanel onClose={()=>setNotifOpen(false)}/>}
        </div>

        <div className="relative">
          <button onClick={()=>setMenuOpen(o=>!o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition" aria-haspopup="menu" data-tip="Cuenta">
            <img src={profile?.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" style={{border:'1px solid rgba(224,163,112,.35)'}}/>
            <ChevronDown size={14} className={`text-zinc-300 transition-transform ${menuOpen?'rotate-180':''}`}/>
          </button>
          {menuOpen && (
            <>
              {/* Click-outside backdrop (touch-friendly) */}
              <div className="account-menu-backdrop" onClick={()=>setMenuOpen(false)} aria-hidden="true"/>
              <div className="account-menu" role="menu">
                <div className="account-menu-head">
                  <p className="account-menu-name">{profile?.name}</p>
                  <p className="account-menu-sub">{user?.username}</p>
                </div>
                <button onClick={()=>{setMenuOpen(false); switchProfile(); navigate('/profiles');}} className="account-menu-item" role="menuitem">
                  <UserCircle size={16}/> <span>Cambiar perfil</span>
                </button>
                {isAdminUser(user) && (
                  <button onClick={()=>{setMenuOpen(false); navigate('/admin');}} className="account-menu-item" role="menuitem">
                    <Shield size={16} color="#f0bb89"/> <span>Panel Admin</span>
                  </button>
                )}
                <div className="account-menu-divider"/>
                <button onClick={()=>{setMenuOpen(false); logout(); navigate('/login');}} className="account-menu-item account-menu-danger" role="menuitem">
                  <LogOut size={16}/> <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
