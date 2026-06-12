import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Bookmark, User, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Only show when user has selected a profile (i.e. inside the app)
  if (!user || !profile) return null;

  return (
    <nav className="mob-nav" aria-label="Navegación móvil">
      <NavLink to="/browse" end className={({isActive})=>`mob-nav-item ${isActive?'active':''}`}>
        <Home size={18}/>
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/browse/movies" className={({isActive})=>`mob-nav-item ${isActive?'active':''}`}>
        <Film size={18}/>
        <span>Films</span>
      </NavLink>
      <NavLink to="/search" className={({isActive})=>`mob-nav-item ${isActive?'active':''}`}>
        <Search size={18}/>
        <span>Buscar</span>
      </NavLink>
      <NavLink to="/my-list" className={({isActive})=>`mob-nav-item ${isActive?'active':''}`}>
        <Bookmark size={18}/>
        <span>Mi lista</span>
      </NavLink>
      <button onClick={()=>navigate('/profiles')} className="mob-nav-item">
        <User size={18}/>
        <span>Perfil</span>
      </button>
    </nav>
  );
}
