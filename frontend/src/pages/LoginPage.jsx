import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User, ArrowRight, KeyRound } from 'lucide-react';
import { SECURITY_QUESTIONS } from '../mock';

export default function LoginPage() {
  const { login, recoverPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'recover'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // recovery
  const [recStep, setRecStep] = useState(1);
  const [recUser, setRecUser] = useState('');
  const [recQ, setRecQ] = useState({ q1: '', q2: '' });
  const [recA, setRecA] = useState({ a1: '', a2: '' });
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    setTimeout(() => {
      const res = login(username.trim(), password);
      if (!res.ok) { setError(res.error); setLoading(false); return; }
      setLoading(false);
      navigate('/profiles');
    }, 350);
  };

  const startRecover = (e) => {
    e.preventDefault(); setError('');
    const users = JSON.parse(localStorage.getItem('strm_users') || '[]');
    const u = users.find(x => x.username.toLowerCase() === recUser.trim().toLowerCase());
    if (!u) { setError('Usuario no encontrado'); return; }
    setRecQ({ q1: u.question1.q, q2: u.question2.q });
    setRecStep(2);
  };
  const finishRecover = (e) => {
    e.preventDefault(); setError('');
    if (newPass.length < 4) return setError('La nueva contraseña debe tener al menos 4 caracteres');
    if (newPass !== newPass2) return setError('Las contraseñas no coinciden');
    const res = recoverPassword(recUser.trim(), recA.a1, recA.a2, newPass);
    if (!res.ok) return setError(res.error);
    setMode('login'); setRecStep(1); setError('');
    setPassword(newPass); setUsername(recUser.trim());
    alert('Contraseña actualizada. Inicia sesión.');
  };

  return (
    <div className="auth-shell layer">
      <header className="px-8 py-6 flex items-center justify-between">
        <Link to="/" className="brand-mark" style={{fontSize:'30px'}}>JANLYFLIX</Link>
        <Link to="/register" className="btn btn-ghost" style={{padding:'8px 16px', fontSize:'13px'}}>Crear cuenta</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="auth-card">
          <div className="flex items-center gap-3 mb-4">
            <span className="step-pill">{mode === 'login' ? 'Bienvenido' : 'Recuperar acceso'}</span>
          </div>
          <h1 className="font-display text-white text-[34px] leading-[1.1] font-bold mb-2">
            {mode === 'login' ? <>Inicia<br/>sesión</> : <>Recuperar<br/>contraseña</>}
          </h1>
          <p className="text-zinc-400 text-sm mb-7">
            {mode === 'login' ? 'Accede con tu usuario y contraseña.' : 'Responde tus preguntas de seguridad para crear una nueva.'}
          </p>

          {mode === 'login' && (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input className="field field-with-icon" placeholder="Usuario" value={username} onChange={e=>setUsername(e.target.value)} required autoFocus autoComplete="username" />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input className="field field-with-icon pr-12" type={showPw?'text':'password'} placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {error && <p className="text-[#e08585] text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center disabled:opacity-60">
                {loading ? 'Validando...' : (<>Entrar <ArrowRight size={16}/></>)}
              </button>
              <div className="flex items-center justify-between text-[13px] text-zinc-400 pt-2">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-[#e0a370]"/> Recordarme</label>
                <button type="button" onClick={()=>{ setMode('recover'); setError(''); }} className="hover:text-zinc-200 inline-flex items-center gap-1"><KeyRound size={13}/> Recuperar acceso</button>
              </div>
            </form>
          )}

          {mode === 'recover' && recStep === 1 && (
            <form onSubmit={startRecover} className="space-y-4">
              <input className="field" placeholder="Tu usuario" value={recUser} onChange={e=>setRecUser(e.target.value)} required autoFocus />
              {error && <p className="text-[#e08585] text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={()=>{setMode('login'); setError('');}} className="btn btn-ghost flex-1 justify-center">Volver</button>
                <button type="submit" className="btn btn-primary flex-1 justify-center">Continuar <ArrowRight size={16}/></button>
              </div>
            </form>
          )}

          {mode === 'recover' && recStep === 2 && (
            <form onSubmit={finishRecover} className="space-y-4">
              <div>
                <label className="text-zinc-300 text-[13px] block mb-2">{recQ.q1}</label>
                <input className="field" value={recA.a1} onChange={e=>setRecA(s=>({...s, a1: e.target.value}))} required />
              </div>
              <div>
                <label className="text-zinc-300 text-[13px] block mb-2">{recQ.q2}</label>
                <input className="field" value={recA.a2} onChange={e=>setRecA(s=>({...s, a2: e.target.value}))} required />
              </div>
              <input className="field" type="password" placeholder="Nueva contraseña" value={newPass} onChange={e=>setNewPass(e.target.value)} required />
              <input className="field" type="password" placeholder="Confirmar contraseña" value={newPass2} onChange={e=>setNewPass2(e.target.value)} required />
              {error && <p className="text-[#e08585] text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={()=>setRecStep(1)} className="btn btn-ghost flex-1 justify-center">Atrás</button>
                <button type="submit" className="btn btn-primary flex-1 justify-center">Restablecer</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
