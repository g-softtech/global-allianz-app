import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&fit=crop",
    headline: "Get Insured in Minutes",
    sub: "Fast, reliable insurance solutions tailored to every Nigerian.",
    cta: "Get a Free Quote",
    ctaTo: "/contact",
    badge: "Trusted by 10,000+ Nigerians",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80&fit=crop",
    headline: "Protect What Matters Most",
    sub: "Comprehensive coverage for individuals, families, and businesses.",
    cta: "Explore Policies",
    ctaTo: "/services",
    badge: "50+ Insurance Products",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1600&q=80&fit=crop",
    headline: "Expert Brokers, Trusted Advice",
    sub: "Professional guidance to help you make the right insurance decisions.",
    cta: "Meet Our Team",
    ctaTo: "/about",
    badge: "25+ Years of Excellence",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600&q=80&fit=crop",
    headline: "Peace of Mind Guaranteed",
    sub: "We secure your future with Nigeria's leading insurance solutions.",
    cta: "Contact Us Today",
    ctaTo: "/contact",
    badge: "NAICOM Licensed Broker",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 900);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-900 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Background Image */}
          <div
            className={`absolute inset-0 bg-cover bg-center ${i === current ? "animate-ken-burns" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-800/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container-custom w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              key={`badge-${current}`}
              className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/40 text-gold-400 px-4 py-1.5 rounded-full text-xs font-sans font-medium uppercase tracking-widest mb-6 animate-fade-up"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
              {SLIDES[current].badge}
            </div>

            {/* Headline */}
            <h1
              key={`h1-${current}`}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              {SLIDES[current].headline}
            </h1>

            {/* Sub */}
            <p
              key={`p-${current}`}
              className="font-sans text-lg text-gray-300 leading-relaxed mb-8 max-w-lg animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {SLIDES[current].sub}
            </p>

            {/* CTAs */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap gap-4 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to={SLIDES[current].ctaTo} className="btn btn-primary text-sm px-7 py-3.5">
                {SLIDES[current].cta}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a href="tel:+2341234567890" className="btn btn-white text-sm px-7 py-3.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} aria-label="Previous slide"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/10 hover:bg-gold-500 border border-white/20 hover:border-gold-500 rounded-full flex items-center justify-center text-white transition-all duration-300 group">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button onClick={next} aria-label="Next slide"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white/10 hover:bg-gold-500 border border-white/20 hover:border-gold-500 rounded-full flex items-center justify-center text-white transition-all duration-300 group">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === current
                ? "w-8 h-2.5 bg-gold-500"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-8 z-30 hidden md:flex flex-col items-center gap-2">
        <span className="font-sans text-xs text-white/50 uppercase tracking-widest rotate-90 origin-center mb-3">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
