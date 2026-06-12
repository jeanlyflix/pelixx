import React, { createContext, useContext, useEffect, useState } from 'react';
import { seedAdmin } from '../mock';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedAdmin();
    const savedUser = JSON.parse(localStorage.getItem('strm_session_user') || 'null');
    const savedProfile = JSON.parse(localStorage.getItem('strm_session_profile') || 'null');
    if (savedUser) setUser(savedUser);
    if (savedProfile) setProfile(savedProfile);
    setReady(true);
  }, []);

  const getUsers = () => JSON.parse(localStorage.getItem('strm_users') || '[]');
  const saveUsers = (list) => localStorage.setItem('strm_users', JSON.stringify(list));

  const register = ({ username, password, q1, a1, q2, a2 }) => {
    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase()))
      return { ok: false, error: 'El usuario ya existe' };
    const newUser = {
      username, password, role: 'user',
      question1: { q: q1, a: a1.toLowerCase().trim() },
      question2: { q: q2, a: a2.toLowerCase().trim() },
      profiles: [{
        id: 'p_' + Date.now(),
        name: username,
        avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=' + encodeURIComponent(username) + '&backgroundColor=fcd34d&radius=14',
        isKid: false,
        pin: null
      }],
      myList: [],
      notifications: [
        { id: 'welcome', title: 'Bienvenido a JANLYFLIX', body: 'Empieza explorando el catálogo.', time: new Date().toISOString(), read: false }
      ],
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return { ok: true, user: newUser };
  };

  // Single-step login (no more 2-step verification at sign-in)
  const login = (username, password) => {
    const u = getUsers().find(x => x.username.toLowerCase() === username.toLowerCase());
    if (!u) return { ok: false, error: 'Usuario no encontrado' };
    if (u.password !== password) return { ok: false, error: 'Contraseña incorrecta' };
    setUser(u);
    localStorage.setItem('strm_session_user', JSON.stringify(u));
    return { ok: true, user: u };
  };

  // Password recovery (uses security questions)
  const recoverPassword = (username, a1, a2, newPassword) => {
    const users = getUsers();
    const u = users.find(x => x.username.toLowerCase() === username.toLowerCase());
    if (!u) return { ok: false, error: 'Usuario no encontrado' };
    if (u.question1.a !== a1.toLowerCase().trim()) return { ok: false, error: 'Respuesta 1 incorrecta' };
    if (u.question2.a !== a2.toLowerCase().trim()) return { ok: false, error: 'Respuesta 2 incorrecta' };
    u.password = newPassword;
    saveUsers(users);
    return { ok: true };
  };

  const selectProfile = (p) => {
    setProfile(p);
    localStorage.setItem('strm_session_profile', JSON.stringify(p));
  };

  const verifyProfilePin = (profileId, pin) => {
    const p = (user?.profiles || []).find(x => x.id === profileId);
    if (!p) return false;
    if (!p.pin) return true;
    return p.pin === pin;
  };

  const setProfilePin = (profileId, pin) => {
    updateUser(u => {
      u.profiles = u.profiles.map(p => p.id === profileId ? { ...p, pin } : p);
      return u;
    });
  };

  const logout = () => {
    localStorage.removeItem('strm_session_user');
    localStorage.removeItem('strm_session_profile');
    setUser(null);
    setProfile(null);
  };

  const switchProfile = () => {
    localStorage.removeItem('strm_session_profile');
    setProfile(null);
  };

  const updateUser = (updater) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.username === user.username);
    if (idx < 0) return;
    const updated = updater({ ...users[idx] });
    users[idx] = updated;
    saveUsers(users);
    setUser(updated);
    localStorage.setItem('strm_session_user', JSON.stringify(updated));
  };

  const toggleMyList = (item) => {
    updateUser(u => {
      const exists = (u.myList || []).find(x => x.id === item.id && x.media_type === item.media_type);
      u.myList = exists
        ? u.myList.filter(x => !(x.id === item.id && x.media_type === item.media_type))
        : [...(u.myList || []), { id: item.id, media_type: item.media_type, title: item.title || item.name, poster_path: item.poster_path, backdrop_path: item.backdrop_path }];
      return u;
    });
  };
  const inMyList = (item) =>
    !!(user?.myList || []).find(x => x.id === item.id && x.media_type === item.media_type);

  // Likes (per content item)
  const toggleLike = (item) => {
    updateUser(u => {
      u.likes = u.likes || [];
      const key = `${item.media_type}-${item.id}`;
      u.likes = u.likes.includes(key) ? u.likes.filter(k => k !== key) : [...u.likes, key];
      return u;
    });
  };
  const isLiked = (item) => {
    const key = `${item.media_type}-${item.id}`;
    return !!(user?.likes || []).includes(key);
  };

  // Notifications
  const markAllRead = () => {
    updateUser(u => {
      u.notifications = (u.notifications || []).map(n => ({ ...n, read: true }));
      return u;
    });
  };
  const unreadCount = (user?.notifications || []).filter(n => !n.read).length;

  return (
    <AuthContext.Provider value={{
      user, profile, ready,
      register, login, recoverPassword,
      selectProfile, verifyProfilePin, setProfilePin,
      logout, switchProfile, updateUser,
      toggleMyList, inMyList,
      toggleLike, isLiked,
      markAllRead, unreadCount,
      getUsers, saveUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
