import { useEffect, useState } from 'react';

/**
 * Smart viewport detector for JANLYFLIX.
 * Detects: width/height, device type (mobile/tablet/desktop),
 * OS (iOS/Android), orientation, PWA standalone mode.
 * Also fixes the iOS Safari 100vh bug by exposing --vh.
 */
export function useViewport() {
  const get = () => {
    if (typeof window === 'undefined') {
      return { width: 1280, height: 800, orientation: 'landscape',
        isMobile: false, isTablet: false, isDesktop: true,
        isIOS: false, isAndroid: false, isStandalone: false, pixelRatio: 1 };
    }
    const vv = window.visualViewport;
    const w = vv ? vv.width  : window.innerWidth;
    const h = vv ? vv.height : window.innerHeight;
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    const isAndroid = /Android/i.test(ua);
    const isStandalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
    return {
      width: w, height: h,
      orientation: w >= h ? 'landscape' : 'portrait',
      isMobile:  w < 768,
      isTablet:  w >= 768 && w < 1024,
      isDesktop: w >= 1024,
      isSmall:   w < 360,
      isIOS, isAndroid, isStandalone,
      pixelRatio: window.devicePixelRatio || 1
    };
  };

  const [vp, setVp] = useState(get);

  useEffect(() => {
    let raf = 0;
    const setCssVh = () => {
      const h = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
      document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
      document.documentElement.style.setProperty('--svh', `${h}px`);
    };
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setCssVh();
        setVp(get());
      });
    };
    setCssVh();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update, { passive: true });
      window.visualViewport.addEventListener('scroll', update, { passive: true });
    }
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', update);
        window.visualViewport.removeEventListener('scroll', update);
      }
      cancelAnimationFrame(raf);
    };
  }, []);

  return vp;
}
