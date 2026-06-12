// YouTube IFrame Player API loader (singleton)
let ytPromise = null;
export function loadYouTubeAPI() {
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') { try { prev(); } catch(_){} }
      resolve(window.YT);
    };
    if (!document.querySelector('script[data-yt-api="1"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.dataset.ytApi = '1';
      document.body.appendChild(tag);
    }
  });
  return ytPromise;
}

export function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s}` : `${m}:${s}`;
}
