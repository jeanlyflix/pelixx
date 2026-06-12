import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SECURITY_QUESTIONS } from '../mock';
import { Check, Eye, EyeOff, ArrowRight, ChevronLeft, Info } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', password2: '',
    q1: SECURITY_QUESTIONS[0], a1: '',
    q2: SECURITY_QUESTIONS[1], a2: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const upd = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const next = (e) => {
    e.preventDefault();
    setError('');
    if (form.username.length < 3) return setError('Usuario muy corto (mínimo 3)');
    if (form.password.length < 4) return setError('Contraseña mínimo 4 caracteres');
    if (form.password !== form.password2) return setError('Las contraseñas no coinciden');
    setStep(2);
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.a1.trim() || !form.a2.trim()) return setError('Responde ambas preguntas');
    if (form.q1 === form.q2) return setError('Elige preguntas diferentes');
    const res = register(form);
    if (!res.ok) return setError(res.error);
    navigate('/login');
  };

  return (
    <div className="auth-shell layer">
      <header className="px-8 py-6 flex items-center justify-between">
        <Link to="/" className="brand-mark" style={{fontSize:'30px'}}>JANLYFLIX</Link>
        <Link to="/login" className="btn btn-ghost" style={{padding:'8px 16px', fontSize:'13px'}}>Iniciar sesión</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="auth-card">
          <div className="step-track">
            <div className={`step-bar ${step >= 1 ? 'active' : ''}`} />
            <div className={`step-bar ${step >= 2 ? 'active' : ''}`} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="step-pill">{step === 1 ? '01 · Datos' : '02 · Recuperación'}</span>
          </div>
          <h1 className="font-display text-white text-[34px] leading-[1.1] font-bold mb-2">
            {step === 1 ? <>Crea tu<br/>cuenta</> : <>Preguntas<br/>de recuperación</>}
          </h1>
          <p className="text-zinc-400 text-sm mb-7">
            {step === 1 ? 'Solo necesitas un usuario y una contraseña.' : 'Estas preguntas te ayudarán a recuperar tu contraseña si la olvidas.'}
          </p>

          {step === 1 && (
            <form onSubmit={next} className="space-y-4">
              <input className="field" placeholder="Usuario" value={form.username} onChange={e=>upd('username', e.target.value)} required autoFocus autoComplete="username" />
              <div className="relative">
                <input className="field pr-12" type={showPw?'text':'password'} placeholder="Contraseña" value={form.password} onChange={e=>upd('password', e.target.value)} required autoComplete="new-password" />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              <input className="field" type={showPw?'text':'password'} placeholder="Confirmar contraseña" value={form.password2} onChange={e=>upd('password2', e.target.value)} required autoComplete="new-password" />
              {error && <p className="text-[#e08585] text-sm">{error}</p>}
              <button type="submit" className="btn btn-primary w-full justify-center">Siguiente <ArrowRight size={16}/></button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-start gap-2 text-zinc-400 text-[12px] p-3 rounded-lg border border-white/5 bg-white/[.02]">
                <Info size={14} className="mt-0.5 shrink-0 text-[#e0a370]"/>
                <span>Solo se usarán si necesitas recuperar tu contraseña.</span>
              </div>
              <div>
                <label className="text-zinc-300 text-[13px] mb-2 block">Pregunta 1</label>
                <select className="select-strm" value={form.q1} onChange={e=>upd('q1', e.target.value)}>
                  {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
                <input className="field mt-2" placeholder="Tu respuesta" value={form.a1} onChange={e=>upd('a1', e.target.value)} required />
              </div>
              <div>
                <label className="text-zinc-300 text-[13px] mb-2 block">Pregunta 2</label>
                <select className="select-strm" value={form.q2} onChange={e=>upd('q2', e.target.value)}>
                  {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
                <input className="field mt-2" placeholder="Tu respuesta" value={form.a2} onChange={e=>upd('a2', e.target.value)} required />
              </div>
              {error && <p className="text-[#e08585] text-sm">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={()=>setStep(1)} className="btn btn-ghost flex-1 justify-center"><ChevronLeft size={16}/> Atrás</button>
                <button type="submit" className="btn btn-primary flex-1 justify-center"><Check size={16}/> Crear cuenta</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
