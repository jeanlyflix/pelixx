import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[JANLYFLIX]', error, info);
  }
  reset = () => {
    this.setState({ hasError: false, error: null });
    try { window.location.reload(); } catch (_) {}
  };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 layer">
        <div className="glass-strong max-w-md w-full p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{background:'rgba(224,133,133,.18)', color:'#e08585'}}>
            <AlertCircle size={26}/>
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Algo no fue bien</h2>
          <p className="text-zinc-400 text-sm mb-6">Hemos detectado un error inesperado. Puedes recargar la app para intentarlo de nuevo.</p>
          <pre className="text-[11px] text-zinc-500 bg-black/30 p-3 rounded mb-5 overflow-auto max-h-32 text-left">
            {String(this.state.error?.message || this.state.error || 'Error desconocido')}
          </pre>
          <button onClick={this.reset} className="btn btn-primary w-full justify-center">
            <RotateCw size={16}/> Reintentar
          </button>
        </div>
      </div>
    );
  }
}
