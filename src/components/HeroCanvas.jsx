import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroCanvas = ({ frameCount, setLoaded }) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  // How many frames total
  const totalFrames = frameCount;

  // The state of our frame object which GSAP will tween
  const animationObj = { frame: 0 };
  
  // To keep track of the current frame rendered
  const currentFrameRef = useRef(0);

  useEffect(() => {
    // 1. Preload images
    let loadedCount = 0;
    const images = [];

    const onImageLoaded = () => {
      loadedCount++;
      if (loadedCount === totalFrames) {
        setLoaded(true);
        // Initial render of first frame once loaded
        renderFrame(0);
        setupAnimation();
      }
    };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      // Format number to 3 digits e.g. 001, 002
      const formattedNumber = i.toString().padStart(3, '0');
      img.src = `/frames/ezgif-frame-${formattedNumber}.png`;
      img.onload = onImageLoaded;
      
      // If image fails to load, we still count it so we don't get stuck forever
      img.onerror = () => {
        console.error(`Failed to load frame ${i}`);
        onImageLoaded();
      };
      
      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [totalFrames, setLoaded]);

  const renderFrame = (index) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    // Ensure integer frame index and clamp
    const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.round(index)));
    const image = imagesRef.current[frameIndex];

    if (!canvas || !ctx || !image) return;

    // Prevent redrawing the same integer frame
    if (currentFrameRef.current === frameIndex) return;
    currentFrameRef.current = frameIndex;

    // Draw image maintaining aspect ratio and centering
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = canvas.width / dpr;
    const displayH = canvas.height / dpr;

    const hRatio = displayW / image.width;
    const vRatio = displayH / image.height;
    // Contain: ensure entire frame visible with letterboxing
    const ratio = Math.min(hRatio, vRatio);

    const drawW = image.width * ratio;
    const drawH = image.height * ratio;
    const centerShift_x = (displayW - drawW) / 2;
    const centerShift_y = (displayH - drawH) / 2;

    // Fill background for letterboxing
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      Math.round(centerShift_x * dpr),
      Math.round(centerShift_y * dpr),
      Math.round(drawW * dpr),
      Math.round(drawH * dpr)
    );
  };

  const setupAnimation = () => {
    // 2. Setup GSAP ScrollTrigger
    // We link the total scroll duration to the main container ID in App.js
    gsap.to(animationObj, {
      frame: totalFrames - 1,
      snap: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#main-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // 0.5 gives a bit of smooth inertia
        onUpdate: () => renderFrame(Math.round(animationObj.frame)),
      },
    });
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

        canvas.width = Math.floor(vw * dpr);
        canvas.height = Math.floor(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Re-render current frame so it fits and force redraw
        currentFrameRef.current = -1;
        renderFrame(currentFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Initialize on mount

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) window.visualViewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default HeroCanvas;
