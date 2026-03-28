import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CanvasSequence = ({ frameCount, onLoaded, mobileSrc }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const imagesRef = useRef([]);
  const videoRef = useRef(null);
  // We use max frames
  const totalFrames = frameCount;

  // Use a ref for the animation object so we can use GSAP on it
  const animationState = useRef({ frame: 0 });
  const currentFrameDrawn = useRef(-1);
  const rafRef = useRef(null);
  const currentLerped = useRef(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Preload Images
  useEffect(() => {
    // detect mobile (mobile-first)
    const checkMobile = () => {
      const mq = window.matchMedia('(max-width: 767px)');
      setIsMobile(mq.matches || /Mobi|Android/i.test(navigator.userAgent));
    };

    const mobile = (() => {
      const mq = window.matchMedia('(max-width: 767px)');
      return mq.matches || /Mobi|Android/i.test(navigator.userAgent);
    })();
    setIsMobile(mobile);
    window.addEventListener('resize', checkMobile);

    // Progressive loader: load a sparse set first (every Nth frame), then fill in
    let cancelled = false;
    const images = new Array(totalFrames);

    const progressiveLoad = async () => {
      const primaryCount = Math.min(30, totalFrames); // target initial frames
      const step = Math.max(1, Math.floor(totalFrames / primaryCount));

      let loaded = 0;

      const load = (idx) => new Promise((res) => {
        const img = new Image();
        const formattedNum = (idx + 1).toString().padStart(3, '0');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const candidates = [];
        // Prefer high-res WebP/AVIF when on retina devices (look for @2x suffix)
        if (dpr > 1) {
          candidates.push(`/frames/ezgif-frame-${formattedNum}@2x.webp`);
          candidates.push(`/frames/ezgif-frame-${formattedNum}@2x.png`);
          candidates.push(`/frames/ezgif-frame-${formattedNum}@2x.jpg`);
        }
        candidates.push(`/frames/ezgif-frame-${formattedNum}.webp`);
        candidates.push(`/frames/ezgif-frame-${formattedNum}.png`);
        candidates.push(`/frames/ezgif-frame-${formattedNum}.jpg`);

        let attempt = 0;
        const tryNext = () => {
          if (attempt >= candidates.length) {
            images[idx] = null;
            loaded++;
            setLoadingProgress(Math.round((loaded / totalFrames) * 100));
            return res(false);
          }
          img.src = candidates[attempt];
          attempt++;
        };

        img.onload = () => { images[idx] = img; loaded++; setLoadingProgress(Math.round((loaded / totalFrames) * 100)); res(true); };
        img.onerror = () => { tryNext(); };

        tryNext();
      });

      // load sparse set
      const primaryPromises = [];
      for (let i = 0; i < totalFrames; i += step) {
        primaryPromises.push(load(i));
      }
      await Promise.all(primaryPromises);

      if (cancelled) return;
      // expose the sparse buffer immediately so renderFrame can read from it
      imagesRef.current = images;
      // notify loaded enough to show initial experience
      onLoaded(true);
      // initial render and start scroll-driven animation on non-mobile
      if (!mobile) {
        renderFrame(0);
        initScrollTrigger();
        startRAF();
      }
      // fill remaining frames in background, but throttle concurrency
      const concurrency = 6;
      let queue = [];
      for (let i = 0; i < totalFrames; i++) {
        if (!images[i]) queue.push(i);
      }

      const worker = async () => {
        while (queue.length && !cancelled) {
          const idx = queue.shift();
          // eslint-disable-next-line no-await-in-loop
          await load(idx);
        }
      };

      const workers = new Array(concurrency).fill(0).map(() => worker());
      await Promise.all(workers);

      if (!cancelled) {
        imagesRef.current = images;
        setLoadingProgress(100);
      }
    };

    progressiveLoad();

    return () => {
      cancelled = true;
      stopRAF();
      window.removeEventListener('resize', checkMobile);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [totalFrames, onLoaded]);

  // Render function
  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!contextRef.current) {
      contextRef.current = canvas.getContext('2d', { alpha: false }); // Optimize if no transparency needed
    }
    const ctx = contextRef.current;

    // Ensure we use an integer frame index and clamp in-range
    const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.round(index)));

    // Don't redraw if same frame already drawn
    if (currentFrameDrawn.current === frameIndex) return;
    currentFrameDrawn.current = frameIndex;

    const image = imagesRef.current[frameIndex];

    if (image && image.complete && image.naturalWidth !== 0) {
      // Draw object-fit: contain calculation (accounting for DPR scaling)
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.width / dpr;
      const displayH = canvas.height / dpr;

      const hRatio = displayW / image.naturalWidth;
      const vRatio = displayH / image.naturalHeight;
      // Use min to 'contain' the whole image with letterboxing
      const ratio = Math.min(hRatio, vRatio);

      const drawW = image.naturalWidth * ratio;
      const drawH = image.naturalHeight * ratio;

      const centerShift_x = (displayW - drawW) / 2;
      const centerShift_y = (displayH - drawH) / 2;

      // Fill background for letterboxing
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        image,
        0, 0, image.naturalWidth, image.naturalHeight,
        Math.round(centerShift_x * dpr), Math.round(centerShift_y * dpr),
        Math.round(drawW * dpr), Math.round(drawH * dpr)
      );
    } else {
      // Draw a fallback colorful background based on frame if no image
      ctx.fillStyle = `hsl(${index * 3}, 50%, 10%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.font = '24px Inter';
      ctx.fillText(`Placeholder Frame ${index + 1}`, canvas.width / 2 - 100, canvas.height / 2);
    }
  };

  const initScrollTrigger = () => {
    // Desktop: map scroll to frame number
    gsap.to(animationState.current, {
      frame: totalFrames - 1,
      snap: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#main-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: () => {
          // rAF loop will pick up animationState.current.frame and interpolate
        },
      },
    });
  };

  // rAF-driven interpolation + draw loop
  const startRAF = () => {
    if (rafRef.current) return;
    let lastTime = performance.now();
    const step = (t) => {
      const now = t || performance.now();
      const dt = Math.min(64, now - lastTime) / 1000;
      lastTime = now;

      const target = animationState.current.frame || 0;
      // lerp current toward target (adaptive)
      const lerpAmt = 1 - Math.pow(0.001, dt * 60); // smooth independent of dt
      currentLerped.current = currentLerped.current + (target - currentLerped.current) * lerpAmt;

      // Only draw when integer frame changes (frame skipping)
      const drawIndex = Math.round(currentLerped.current);
      if (Math.abs(drawIndex - currentFrameDrawn.current) >= 1) {
        renderFrame(drawIndex);
      }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stopRAF = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

        // Set backing store size for crisp rendering using visual viewport on mobile
        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        // Keep CSS size at logical pixels (use visualViewport when available)
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;

        // Ensure context transform accounts for DPR
        if (contextRef.current) {
          contextRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // Force redraw on resize
        currentFrameDrawn.current = -1;
        renderFrame(animationState.current.frame);
      }
    };

    // Listen to resize + visualViewport changes for mobile browsers
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      {isMobile ? (
        // Mobile: render a video fallback if available, otherwise still render canvas but keep light-weight behavior
        (mobileSrc || '/frames/mobile-fallback.mp4') ? (
          <video
            ref={videoRef}
            src={mobileSrc || '/frames/mobile-fallback.mp4'}
            playsInline
            muted
            loop
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', display: 'block' }}
          />
        ) : (
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        )
      ) : (
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      )}
      {/* Loading overlay logic passed back via onLoaded; we expose progress via data attribute for external preloader */}
      <div data-loading-progress={loadingProgress} />
    </div>
  );
};

export default CanvasSequence;
