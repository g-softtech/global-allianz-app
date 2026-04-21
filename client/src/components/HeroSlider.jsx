import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600&q=85&fit=crop",
    eyebrow: "Trusted since 2001",
    headline: "Insurance built\nfor real life.",
    sub: "Expert brokers. Transparent coverage. Fast claims. Protecting what matters most to Nigerians.",
    cta: "Explore Coverage",
    ctaTo: "/services",
  },
  {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=85&fit=crop",
    eyebrow: "10,000+ clients protected",
    headline: "Your broker\nworks for you.",
    sub: "We represent you — not the insurer. Independent advice that puts your interests first, always.",
    cta: "Meet Our Team",
    ctaTo: "/about",
  },
  {
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1600&q=85&fit=crop",
    eyebrow: "NAICOM Licensed",
    headline: "Protect what\nyou've built.",
    sub: "From motor to business, health to life — comprehensive coverage with Nigeria's trusted brokers.",
    cta: "Get a Free Quote",
    ctaTo: "/contact",
  },
];

export default function HeroSlider() {
  const [current,   setCurrent]   = useState(0);
  const [prev,      setPrev]      = useState(null);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 900);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-navy-950">

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-900 ${
          i === current ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}>
          <div className={`absolute inset-0 bg-cover bg-center ${i === current ? "animate-ken-burns" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }} />
          {/* Refined overlay — gradient from left */}
          <div className="absolute inset-0 bg-hero-overlay" />
          {/* Subtle vignette */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 20% 50%, transparent 50%, rgba(2,8,16,0.4) 100%)"
          }} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container-custom w-full">
          <div className="max-w-xl">

            {/* Eyebrow */}
            <div key={`ey-${current}`} className="animate-fade-up mb-5">
              <span className="label-overline text-gold-400">
                {SLIDES[current].eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1 key={`h-${current}`}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-up whitespace-pre-line"
              style={{ animationDelay: "0.08s" }}>
              {SLIDES[current].headline}
            </h1>

            {/* Sub */}
            <p key={`s-${current}`}
              className="font-sans text-gray-300 text-lg leading-relaxed mb-10 animate-fade-up"
              style={{ animationDelay: "0.16s" }}>
              {SLIDES[current].sub}
            </p>

            {/* CTAs */}
            <div key={`c-${current}`} className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.24s" }}>
              <Link to={SLIDES[current].ctaTo} className="btn btn-primary px-8 py-3.5 text-sm">
                {SLIDES[current].cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <a href="tel:+2341234567890"
                className="btn btn-white px-8 py-3.5 text-sm">
                <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal dot navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i+1}`}
            className={`rounded-full transition-all duration-500 ${
              i === current ? "w-6 h-1.5 bg-gold-500" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Subtle scroll indicator */}
      <div className="absolute bottom-8 right-10 z-30 hidden md:flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
        <span className="font-sans text-[10px] text-white uppercase tracking-widest rotate-90 origin-center">scroll</span>
      </div>
    </section>
  );
}
