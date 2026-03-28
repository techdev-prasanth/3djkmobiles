import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Camera, Zap, Settings, ShieldCheck, MapPin, Phone, Mail, CreditCard, Instagram, Printer } from 'lucide-react';
import CanvasSequence from './components/CanvasSequence';
import GlassCard from './components/GlassCard';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

// Target total frames for the cinematic sequence (use full available set)
const TOTAL_FRAMES = 240;

function App() {
  const [framesLoaded, setFramesLoaded] = useState(false);
  const containerRef = useRef(null);

  // Initialize Lenis for smooth native scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  // Set up text entry animations AFTER frames are loaded
  useEffect(() => {
    if (!framesLoaded) return;

    // We animate each story-content block using GSAP ScrollTrigger
    const sections = gsap.utils.toArray('.story-content');
    
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section.parentElement, // Triggered by the 150vh parent wrapper
            start: 'top center',
            end: 'bottom center',
            toggleActions: 'play reverse play reverse',
          }
        }
      );
    });

    // Cleanup triggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [framesLoaded]);

  return (
    <div id="main-container" ref={containerRef} style={{ position: 'relative' }}>
      
      {/* 
        PRELOADER
        Fades out cleanly when all canvas sequence frames are cached
      */}
      <div className={`preloader ${framesLoaded ? 'hidden' : ''}`}>
        <div className="loader-glow" />
        <h1 className="premium-title" style={{ fontSize: '3rem', position: 'relative', zIndex: 1 }}>JK Mobiles</h1>
        <p className="premium-subtitle" style={{ fontSize: '1.2rem', marginTop: '1rem', position: 'relative', zIndex: 1 }}>Optimizing Cinematic Experience...</p>
        <div className="progress-bar-container" style={{ position: 'relative', zIndex: 1 }}>
           <div className="progress-bar" style={{ animation: 'pulse-opacity 1.5s infinite alternate' }} />
        </div>
      </div>

      {/* THE 3D SEQUENCE BACKGROUND */}
      <CanvasSequence frameCount={TOTAL_FRAMES} onLoaded={() => setFramesLoaded(true)} />

      {/* 
        STORYTELLING SCRUB SPACE
        This controls the scroll height of the document.
      */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* 1. HERO INTRO */}
        <section className="story-section hero-section">
          <div className="story-content" style={{ textAlign: 'center' }}>
             <h1 className="premium-title">JK MOBILE'S<br/>SALES & SERVICE</h1>
             <p className="premium-subtitle" style={{ marginTop: '1.5rem', letterSpacing: '0.2rem', textTransform: 'uppercase' }}>
               Premium Mobile Sales & Service Hub
             </p>
          </div>
        </section>

        {/* 2. ROTATION SEQUENCE */}
        <section className="story-section" style={{ alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ maxWidth: '500px' }}>
              <div className="glass-badge" style={{ marginBottom: '1rem' }}>
                <ShieldCheck size={16} color="var(--accent)" /> Best Price Guarantee
              </div>
              <h2 className="premium-title" style={{ fontSize: '3.5rem' }}>Trusted<br/>Service.</h2>
              <p className="premium-subtitle" style={{ marginTop: '1rem' }}>
                Engineered with precision. Every detail meticulously crafted for perfection.
              </p>
            </div>
          </div>
        </section>

        {/* 3. CAMERA SECTION */}
        <section className="story-section" style={{ alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GlassCard style={{ maxWidth: '450px' }}>
              <Camera size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
              <h2 className="premium-title" style={{ fontSize: '2.5rem' }}>Pro Camera</h2>
              <p className="premium-subtitle" style={{ marginTop: '1rem', color: '#ccc' }}>
                All brand service available. Crystal clear shots repaired to original manufacturer specifications.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* 4. EXPLODED VIEW */}
        <section className="story-section" style={{ alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 className="premium-title" style={{ fontSize: '3.5rem' }}>Core<br/>Internal Perfection</h2>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <span className="glass-badge"><Settings size={16} /> Advanced Repair</span>
                <span className="glass-badge"><Zap size={16} /> Original Accessories</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SLIM DESIGN */}
        <section className="story-section" style={{ alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', justifyContent: 'flex-start' }}>
             <div style={{ maxWidth: '400px' }}>
               <h2 className="premium-title" style={{ fontSize: '4rem', letterSpacing: '0.05em' }}>Sleek.<br/>Powerful.<br/>Reliable.</h2>
             </div>
          </div>
        </section>

        {/* 6. DISPLAY ON */}
        <section className="story-section" style={{ alignItems: 'center' }}>
          <div className="story-content" style={{ textAlign: 'center' }}>
             <h2 className="premium-title" style={{ fontSize: '3.5rem' }}>Vibrant Displays</h2>
             <p className="premium-subtitle" style={{ marginTop: '1rem' }}>All Mobile & Dish Recharge Available.</p>
          </div>
        </section>

        {/* 7. BUSINESS SERVICES SECTION (IMPORTANT) */}
        <section className="story-section" style={{ height: '180vh', alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', justifyContent: 'center' }}>
            <GlassCard style={{ width: '100%', maxWidth: '800px', padding: '3rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 className="premium-title" style={{ fontSize: '3rem' }}>Instant Services</h2>
                <div style={{ display: 'inline-block', marginTop: '1rem', background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem 1.5rem', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.5)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>பணம் எடுத்தல் & அனுப்புதல்</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px' }}>
                    <CreditCard size={24} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Financial Services</h3>
                    <ul style={{ color: 'var(--text-secondary)', listStyle: 'none', lineHeight: '1.8' }}>
                      <li>Money Transfer</li>
                      <li>Aadhaar Cash Withdrawal</li>
                      <li>Credit Card Cash</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px' }}>
                    <Printer size={24} color="var(--accent)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Documentation</h3>
                    <ul style={{ color: 'var(--text-secondary)', listStyle: 'none', lineHeight: '1.8' }}>
                      <li>Xerox & Color Xerox</li>
                      <li>Printouts</li>
                      <li>Instant Documentation Services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* 8. STORE DETAILS SECTION & 9. SOCIAL PROOF */}
        <section className="story-section" style={{ height: '150vh', alignItems: 'center' }}>
          <div className="story-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <GlassCard style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                
                {/* Contact Info */}
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem',  background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    JK Mobiles
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                    <p style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', lineHeight: '1.6' }}>
                      <MapPin size={24} color="var(--accent)" style={{ flexShrink: 0 }} /> 
                      <span>Near TKVS Petrol Pump,<br/>Thavittupalayam, Anthiyur – 638501</span>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Phone size={24} color="var(--accent)" style={{ flexShrink: 0 }} /> 
                      <span style={{ fontSize: '1.1rem' }}>95663 69594 / 95789 39926</span>
                    </p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Mail size={24} color="var(--accent)" style={{ flexShrink: 0 }} /> 
                      <span>jkmobiles212024@gmail.com</span>
                    </p>
                  </div>
                </div>

                {/* Social Proof */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Instagram size={32} color="#E1306C" style={{ marginBottom: '1rem' }} />
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Latest Offers & Updates</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Follow us on Instagram for daily deals and new arrivals.</p>
                    <a href="#" style={{ display: 'inline-block', textDecoration: 'none', color: '#fff', background: 'var(--accent)', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem' }}>
                      @jkmobiles212024
                    </a>
                  </div>
                </div>

              </div>
            </GlassCard>
          </div>
        </section>

        {/* 10. FINAL HERO END */}
        <section className="story-section" style={{ height: '100vh', alignItems: 'flex-end', paddingBottom: '10vh' }}>
          <div className="story-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <h2 className="premium-title" style={{ fontSize: '4rem', marginBottom: '2.5rem', textShadow: '0 0 40px rgba(255,255,255,0.2)' }}>
              Visit Store Today
            </h2>
            <button style={{
              background: '#fff', color: '#000', border: 'none', padding: '1.2rem 4rem', borderRadius: '40px', 
              fontSize: '1.2rem', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255,255,255,0.2)',
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
            }} 
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,255,255,0.3)'; }} 
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.2)'; }}>
              Get Directions
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
