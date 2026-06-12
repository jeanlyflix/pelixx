import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer layer">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-6 mb-8">
          <div className="brand-mark" style={{fontSize:'24px'}}>JANLYFLIX</div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-zinc-500 hover:text-zinc-200 transition"><Facebook size={18}/></a>
            <a href="#" className="text-zinc-500 hover:text-zinc-200 transition"><Instagram size={18}/></a>
            <a href="#" className="text-zinc-500 hover:text-zinc-200 transition"><Twitter size={18}/></a>
            <a href="#" className="text-zinc-500 hover:text-zinc-200 transition"><Youtube size={18}/></a>
          </div>
        </div>
        <div className="divider mb-7" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 text-[13px]">
          {['Audio y subtítulos','Audiodescripción','Centro de ayuda','Tarjetas regalo','Prensa','Inversores','Empleo','Términos de uso','Privacidad','Cookies','Contáctanos','Pruebas de velocidad'].map(l => (
            <a key={l} href="#" className="hover:underline">{l}</a>
          ))}
        </div>
        <p className="text-[11px] tracking-widest text-zinc-600 uppercase">© {new Date().getFullYear()} JANLYFLIX — Plataforma educativa independiente</p>
      </div>
    </footer>
  );
}
