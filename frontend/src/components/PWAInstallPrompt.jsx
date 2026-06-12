import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('jly_pwa_dismissed');
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      if (!dismissed) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShow(false); setDeferred(null);
      localStorage.setItem('jly_pwa_dismissed', '1');
    });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome) { setShow(false); setDeferred(null); }
  };
  const dismiss = () => {
    localStorage.setItem('jly_pwa_dismissed', '1');
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="pwa-prompt" role="dialog" aria-label="Instalar JANLYFLIX">
      <div className="pwa-prompt-inner">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:'linear-gradient(180deg, rgba(224,163,112,.3), rgba(224,163,112,.1))', border:'1px solid rgba(224,163,112,.4)'}}>
            <Download size={18} color="#f0bb89"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Instala JANLYFLIX</p>
            <p className="text-zinc-400 text-xs mt-0.5">Añádela a tu pantalla de inicio para una experiencia tipo app.</p>
          </div>
          <button onClick={dismiss} className="text-zinc-500 hover:text-white p-1" aria-label="Cerrar"><X size={16}/></button>
        </div>
        <button onClick={install} className="btn btn-primary w-full justify-center mt-3" style={{padding:'10px 18px', fontSize:'13.5px'}}>
          <Download size={15}/> Instalar app
        </button>
      </div>
    </div>
  );
}
