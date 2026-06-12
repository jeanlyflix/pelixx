import React from 'react';

export function SkeletonRow({ count = 8 }) {
  return (
    <section className="row-track">
      <div className="row-rail">
        <div className="sk-title"/>
        <div className="row-list no-scrollbar">
          {Array.from({length: count}).map((_, i) => (
            <div key={i} className="row-card"><div className="card-inner sk-shimmer"/></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SkeletonCard() {
  return <div className="card-inner sk-shimmer w-full h-full" style={{borderRadius:'12px'}}/>;
}
