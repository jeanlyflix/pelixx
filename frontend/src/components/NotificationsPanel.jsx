import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Bell } from 'lucide-react';

export default function NotificationsPanel({ onClose }) {
  const { user, markAllRead, unreadCount } = useAuth();
  const notifs = user?.notifications || [];

  return (
    <>
      <div className="notif-backdrop" onClick={onClose}/>
      <div className="notif-panel">
        <div className="notif-head">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-[#e0a370]"/>
            <span className="text-white font-semibold text-sm">Notificaciones</span>
            {unreadCount > 0 && <span className="chip chip-accent" style={{padding:'1px 8px', fontSize:'10px'}}>{unreadCount} nuevas</span>}
          </div>
          {notifs.length > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-[#e0a370] hover:text-[#f0bb89] tracking-wider uppercase flex items-center gap-1"><Check size={12}/> Leídas</button>
          )}
        </div>
        <div className="notif-list">
          {notifs.length === 0 ? (
            <div className="px-4 py-10 text-center text-zinc-500 text-sm">No hay notificaciones</div>
          ) : (
            notifs.slice().reverse().map(n => (
              <div key={n.id} className={`notif-item ${!n.read?'is-new':''}`}>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{background: n.read ? 'transparent' : '#e0a370'}}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-semibold">{n.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{n.body}</p>
                    <p className="text-zinc-600 text-[10px] mt-1">{new Date(n.time).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
