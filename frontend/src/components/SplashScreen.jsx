import React, { useEffect } from 'react';

export default function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="splash">
      <div className="splash-mark">JANLYFLIX</div>
      <div className="splash-sub">Cinema Reimagined</div>
      <div className="splash-bar"><span /></div>
    </div>
  );
}
