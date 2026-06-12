import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AVATAR_OPTIONS, KIDS_AVATAR, playKidsChime } from '../mock';
import { Plus, Pencil, X, ChevronLeft, ChevronRight, Lock, Sparkles, Check } from 'lucide-react';

const MAX_PROFILES = 4; // 3 regular + 1 Kids

function PinPad({ length = 4, onSubmit, onCancel, title = 'Introduce el PIN', subtitle }) {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const press = (d) => {
    if (pin.length >= length) return;
    const next = pin + d;
    setPin(next);
    if (next.length === length) {
      setTimeout(() => {
        const ok = onSubmit(next);
        if (ok === false) { setShake(true); setTimeout(()=>{ setShake(false); setPin(''); }, 400); }
      }, 100);
    }
  };
  const back = () => setPin(p => p.slice(0, -1));

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className={`glass-strong p-7 w-full max-w-sm text-center ${shake?'shake':''}`} onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{background:'rgba(224,163,112,.18)', color:'#f0bb89'}}><Lock size={20}/></div>
        <h2 className="font-display text-white text-2xl font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-zinc-400 text-sm mb-5">{subtitle}</p>}
        <div className="flex justify-center gap-3 my-5">
          {Array.from({length}).map((_, i) => (
            <div key={i} className="w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{background:'rgba(255,230,200,.04)', border:'1px solid '+(pin.length>i?'#e0a370':'rgba(255,230,200,.12)'), color:'#f4ebdc'}}>
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} type="button" onClick={()=>press(String(n))} className="pin-key">{n}</button>
          ))}
          <button type="button" onClick={onCancel} className="pin-key pin-key-text">Cancel</button>
          <button type="button" onClick={()=>press('0')} className="pin-key">0</button>
          <button type="button" onClick={back} className="pin-key pin-key-text">⌫</button>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onSave, onClose, onDelete }) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [pin, setPin] = useState(profile.pin || '');
  const [removePin, setRemovePin] = useState(false);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-strong p-7 max-w-md w-full" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-white text-2xl font-bold">Editar perfil</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X size={18}/></button>
        </div>
        <input className="field mb-4" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} autoFocus />
        <p className="text-zinc-400 text-sm mb-2">Avatar:</p>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {AVATAR_OPTIONS.map(a => (
            <button key={a} onClick={()=>setAvatar(a)} className={`rounded-lg overflow-hidden border-2 transition ${avatar===a?'border-[#e0a370]':'border-transparent'}`}>
              <img src={a} alt="" className="w-full aspect-square object-cover" />
            </button>
          ))}
        </div>
        <label className="text-zinc-400 text-sm block mb-2">PIN de 4 dígitos (opcional):</label>
        <input className="field mb-3" placeholder="Sin PIN" inputMode="numeric" maxLength={4} pattern="[0-9]*" value={removePin ? '' : pin} disabled={removePin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} />
        {profile.pin && (
          <label className="flex items-center gap-2 text-zinc-300 text-sm mb-5 cursor-pointer">
            <input type="checkbox" checked={removePin} onChange={e=>setRemovePin(e.target.checked)} className="accent-[#e0a370]"/> Quitar PIN
          </label>
        )}
        <div className="flex gap-3">
          {onDelete && <button onClick={onDelete} className="btn btn-ghost text-[#e08585]">Eliminar</button>}
          <button onClick={onClose} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
          <button onClick={()=>onSave({ name: name.trim(), avatar, pin: removePin ? null : (pin || null) })} className="btn btn-primary flex-1 justify-center"><Check size={16}/> Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSelector() {
  const { user, selectProfile, updateUser, verifyProfilePin } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[2]);
  const [newPin, setNewPin] = useState('');
  const [pinFor, setPinFor] = useState(null);
  const [entering, setEntering] = useState(null);

  // Ensure Kids profile exists
  useEffect(() => {
    if (!user) return;
    if (!(user.profiles || []).some(p => p.isKid)) {
      updateUser(u => {
        u.profiles = [...(u.profiles||[]), { id: 'p_kids_' + Date.now(), name: 'KIDS', avatar: KIDS_AVATAR, isKid: true, pin: null }];
        return u;
      });
    }
    // eslint-disable-next-line
  }, [user?.username]);

  if (!user) { navigate('/login'); return null; }

  const kidsProfile = (user.profiles || []).find(p => p.isKid) || { id:'kids', name:'KIDS', avatar:KIDS_AVATAR, isKid:true, pin:null };
  const others = (user.profiles || []).filter(p => !p.isKid);
  const all = [...others, kidsProfile];
  const canAddMore = others.length < (MAX_PROFILES - 1);

  const finalizeEnter = (p) => {
    selectProfile(p);
    setTimeout(() => navigate('/browse'), 950);
  };
  const enterProfile = (p) => {
    if (editMode) {
      if (!p.isKid) setEditingProfile(p);
      return;
    }
    if (p.pin) { setPinFor(p); return; }
    if (p.isKid) playKidsChime();
    setEntering(p);
    setTimeout(() => finalizeEnter(p), 50);
  };
  const handlePinSubmit = (pin) => {
    if (!pinFor) return false;
    if (verifyProfilePin(pinFor.id, pin)) {
      const p = pinFor; setPinFor(null);
      if (p.isKid) playKidsChime();
      setEntering(p);
      setTimeout(() => finalizeEnter(p), 50);
      return true;
    }
    return false;
  };

  const addProfile = () => {
    if (!newName.trim() || !canAddMore) return;
    updateUser(u => {
      u.profiles = [...(u.profiles||[]), { id: 'p_'+Date.now(), name: newName.trim(), avatar: newAvatar, isKid: false, pin: newPin || null }];
      return u;
    });
    setNewName(''); setNewAvatar(AVATAR_OPTIONS[2]); setNewPin(''); setCreating(false);
  };

  const saveProfile = (changes) => {
    updateUser(u => {
      u.profiles = u.profiles.map(p => p.id === editingProfile.id ? { ...p, ...changes } : p);
      return u;
    });
    setEditingProfile(null);
  };
  const deleteProfile = () => {
    if (!editingProfile || editingProfile.isKid) return;
    if (!window.confirm(`¿Eliminar perfil ${editingProfile.name}?`)) return;
    updateUser(u => { u.profiles = u.profiles.filter(p => p.id !== editingProfile.id); return u; });
    setEditingProfile(null);
  };

  return (
    <div className={`layer min-h-screen flex flex-col items-center justify-center px-4 py-14 ${entering ? 'profile-enter-overlay' : ''}`}>
      <div className="text-center mb-10">
        <div className="text-[11px] tracking-[.4em] uppercase text-[#e0a370] mb-3">Janlyflix</div>
        <h1 className="font-display text-white text-4xl md:text-5xl font-bold">
          {editMode ? 'Administrar perfiles' : '¿Quién está viendo?'}
        </h1>
      </div>

      <div className="relative w-full max-w-5xl">
        <div className="profile-rail profile-rail-centered no-scrollbar">
          {all.map(p => (
            <div key={p.id}
                 className={`profile-card ${entering?.id===p.id ? 'is-entering' : ''} ${entering && entering.id !== p.id ? 'is-fading' : ''} ${p.isKid?'is-kid':''} ${editMode && p.isKid?'is-locked':''}`}
                 onClick={()=>enterProfile(p)}>
              <div className="profile-avatar relative">
                <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" draggable="false"/>
                {editMode && !p.isKid && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[2px]">
                    <Pencil className="text-white" size={26}/>
                  </div>
                )}
                {editMode && p.isKid && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[2px]" data-tip="Perfil protegido">
                    <Lock className="text-[#f0bb89]" size={22}/>
                  </div>
                )}
                {p.isKid && !editMode && (
                  <div className="kids-badge"><Sparkles size={11}/> KIDS</div>
                )}
                {!editMode && p.pin && (
                  <div className="pin-lock-badge"><Lock size={11}/></div>
                )}
              </div>
              <div className="profile-name">{p.name}</div>
              {p.isKid && <div className="text-[10px] tracking-[.3em] uppercase text-[#f0bb89] mt-1">Solo familiar</div>}
            </div>
          ))}

          {!editMode && canAddMore && (
            <div className="profile-card" onClick={() => setCreating(true)}>
              <div className="profile-avatar flex items-center justify-center" style={{borderStyle:'dashed', borderColor:'rgba(255,255,255,.14)'}}>
                <Plus className="text-zinc-500" size={42}/>
              </div>
              <div className="profile-name">Añadir perfil</div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-[.3em] text-zinc-500 mt-6">
        {others.length}/{MAX_PROFILES - 1} perfiles · KIDS protegido
      </p>

      <button onClick={() => setEditMode(e=>!e)} className="btn btn-outline mt-5" style={{letterSpacing:'.25em', fontSize:'12px'}}>
        {editMode ? 'LISTO' : 'ADMINISTRAR PERFILES'}
      </button>

      {creating && (
        <div className="modal-backdrop" onClick={()=>setCreating(false)}>
          <div className="glass-strong p-7 max-w-md w-full" onClick={e=>e.stopPropagation()}>
            <h2 className="font-display text-white text-2xl font-bold mb-5">Nuevo perfil</h2>
            <input className="field mb-4" placeholder="Nombre" value={newName} onChange={e=>setNewName(e.target.value)} autoFocus />
            <p className="text-zinc-400 text-sm mb-2">Elige un avatar anime:</p>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {AVATAR_OPTIONS.map(a => (
                <button key={a} onClick={()=>setNewAvatar(a)} className={`rounded-lg overflow-hidden border-2 transition ${newAvatar===a?'border-[#e0a370]':'border-transparent'}`}>
                  <img src={a} alt="" className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
            <input className="field mb-4" placeholder="PIN de 4 dígitos (opcional)" inputMode="numeric" maxLength={4} pattern="[0-9]*" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,''))} />
            <div className="flex gap-3">
              <button onClick={()=>setCreating(false)} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
              <button onClick={addProfile} className="btn btn-primary flex-1 justify-center">Crear perfil</button>
            </div>
          </div>
        </div>
      )}

      {editingProfile && (
        <EditProfileModal
          profile={editingProfile}
          onSave={saveProfile}
          onClose={()=>setEditingProfile(null)}
          onDelete={others.length > 1 ? deleteProfile : null}
        />
      )}

      {pinFor && (
        <PinPad title="Introduce el PIN" subtitle={`Perfil: ${pinFor.name}`} onSubmit={handlePinSubmit} onCancel={()=>setPinFor(null)}/>
      )}

      {entering && (
        <div className={`profile-portal ${entering.isKid?'is-kid':''}`}>
          <div className="profile-portal-bg"/>
          <div className="profile-portal-card">
            <img src={entering.avatar} alt="" className="w-full h-full object-cover"/>
            {entering.isKid && <div className="kids-badge" style={{top:10, right:10, position:'absolute'}}><Sparkles size={11}/> KIDS</div>}
          </div>
          <div className="profile-portal-text">
            <div className="text-[11px] tracking-[.4em] uppercase text-[#e0a370] mb-2">Bienvenido</div>
            <div className="profile-portal-name font-display">{entering.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}
