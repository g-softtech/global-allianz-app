import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import ServiceSection      from "../components/ServiceSection";
import ServicesStickyNav   from "../components/ServicesStickyNav";
import ScrollProgressBar   from "../components/ScrollProgressBar";
import useActiveSection    from "../hooks/useActiveSection";

const SECTION_IDS = [
  "business-insurance",
  "motor-insurance",
  "health-insurance",
  "life-insurance",
  "property-insurance",
  "travel-insurance",
];

const SERVICES = [
  {
    id:          "business-insurance",
    icon:        "🏢",
    title:       "Business Insurance",
    tagline:     "Complete protection for your enterprise",
    image:       "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop",
    description: "Whether you run an SME or a multinational corporation, our business insurance packages protect you against the full spectrum of commercial risks — from public liability to property damage, business interruption, and more.",
    coverage:    ["Public & Product Liability", "Employers' Liability", "Commercial Property", "Business Interruption", "Professional Indemnity", "Group Life & Health"],
    ideal:       "SMEs, Corporations, NGOs, Manufacturing companies",
  },
  {
    id:          "motor-insurance",
    icon:        "🚗",
    title:       "Motor Insurance",
    tagline:     "Drive with complete confidence",
    image:       "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80&fit=crop",
    description: "From mandatory third-party to comprehensive cover, we offer the full range of motor insurance products for private cars, commercial vehicles, and large fleets at competitive premiums.",
    coverage:    ["Third-Party Liability (TPO)", "Comprehensive Cover", "Fleet Insurance", "Commercial Vehicle Cover", "Motorcycles & Tricycles", "Motor Trade Insurance"],
    ideal:       "Private car owners, Fleet operators, Transport companies",
  },
  {
    id:          "health-insurance",
    icon:        "💊",
    title:       "Health Insurance",
    tagline:     "Quality healthcare for every budget",
    image:       "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&fit=crop",
    description: "Access quality healthcare through our NHIS and private health insurance products. We partner with leading HMOs to deliver individual and group plans that keep your team healthy and productive.",
    coverage:    ["Individual Health Plans", "Group/Corporate HMO", "NHIS Compliance Plans", "Maternity Cover", "Dental & Vision Add-ons", "International Health Cover"],
    ideal:       "Individuals, Corporate employers, SMEs, Government agencies",
  },
  {
    id:          "life-insurance",
    icon:        "🛡️",
    title:       "Life Insurance",
    tagline:     "Secure your family's financial future",
    image:       "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop",
    description: "Life insurance is the foundation of financial planning. We offer term life, whole life, and investment-linked policies to ensure your family is taken care of no matter what.",
    coverage:    ["Term Life Insurance", "Whole Life Insurance", "Mortgage Protection", "Investment-Linked Plans", "Group Life Cover", "Credit Life Insurance"],
    ideal:       "Families, Employees, Mortgage holders, Business partners",
  },
  {
    id:          "property-insurance",
    icon:        "🏠",
    title:       "Property Insurance",
    tagline:     "Protect your biggest investment",
    image:       "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fit=crop",
    description: "Your home and property deserve the best protection. Our comprehensive property insurance covers buildings and contents against fire, burglary, floods, and accidental damage.",
    coverage:    ["Buildings Insurance", "Home Contents", "All-Risks Cover", "Landlord Insurance", "Commercial Property", "Burglary & Theft"],
    ideal:       "Homeowners, Landlords, Tenants, Commercial property owners",
  },
  {
    id:          "travel-insurance",
    icon:        "✈️",
    title:       "Travel Insurance",
    tagline:     "Adventure with complete peace of mind",
    image:       "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&fit=crop",
    description: "Whether it's a business trip to London or a family holiday in Dubai, our travel insurance covers medical emergencies, trip cancellations, baggage loss, and more.",
    coverage:    ["Emergency Medical Cover", "Trip Cancellation", "Lost/Delayed Baggage", "Travel Delays", "Personal Accident", "Schengen Visa Cover"],
    ideal:       "Frequent travelers, Families, Corporate road warriors",
  },
];

const PROCESS = [
  { step: "01", title: "Consultation",    desc: "Speak with a licensed broker about your needs." },
  { step: "02", title: "Risk Assessment", desc: "We identify the most suitable coverage options." },
  { step: "03", title: "Quote & Compare", desc: "We source competitive quotes from multiple insurers." },
  { step: "04", title: "Policy Issued",   desc: "We handle docs and issue your certificate instantly." },
  { step: "05", title: "Ongoing Support", desc: "Claims, renewals and changes — we're always here." },
];

export default function ServicesPage() {
  const location = useLocation();
  const { activeSection, scrollToSection } = useActiveSection(SECTION_IDS);
  const hasScrolled = useRef(false);

  // Handle hash navigation on load
  useEffect(() => {
    if (hasScrolled.current) return;
    const hash = location.hash?.replace("#", "");
    if (hash && SECTION_IDS.includes(hash)) {
      hasScrolled.current = true;
      // Small delay to ensure page is painted
      setTimeout(() => scrollToSection(hash), 300);
    }
  }, [location.hash]);

  return (
    <>
      {/* Scroll progress bar — fixed at very top */}
      <ScrollProgressBar />

      <div>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative pt-32 pb-16 bg-navy-gradient overflow-hidden">
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.5) 1px, transparent 0)", backgroundSize: "36px 36px" }} />

          {/* Decorative blobs */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-navy-400/10 rounded-full blur-2xl" />

          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 text-gold-400 px-4 py-2 rounded-full text-xs font-sans font-semibold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                NAICOM Licensed · 25+ Years Experience
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
                Insurance Solutions
                <span className="block text-gold-400">Built for Nigeria</span>
              </h1>
              <p className="font-sans text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
                From motor to life, health to business — we connect you with the right coverage at the best rates. Expert brokers, transparent process, fast claims.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => scrollToSection("business-insurance")}
                  className="btn btn-primary px-7 py-3.5"
                >
                  Explore All Services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Link to="/contact" className="btn btn-white px-7 py-3.5">
                  Get a Free Quote
                </Link>
              </div>
            </div>

            {/* Quick nav pills */}
            <div className="flex flex-wrap gap-2 mt-10">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-2 bg-navy-800/60 hover:bg-gold-500/20 border border-navy-700 hover:border-gold-500/50 text-gray-300 hover:text-gold-400 px-4 py-2 rounded-full text-xs font-sans font-medium transition-all duration-200"
                >
                  <span>{s.icon}</span> {s.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sticky Sub-Nav ───────────────────────────────── */}
        <ServicesStickyNav
          activeSection={activeSection}
          onNavClick={scrollToSection}
        />

        {/* ── Service Sections ─────────────────────────────── */}
        <div className="bg-white">
          <div className="container-custom">
            {SERVICES.map((service, index) => (
              <ServiceSection
                key={service.id}
                {...service}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-section-gradient">
          <div className="container-custom">
            <div className="text-center mb-14">
              <span className="section-label">
                <span className="gold-divider w-8 h-px" />
                Simple Process
                <span className="gold-divider w-8 h-px" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4">
                How It Works
              </h2>
              <p className="font-sans text-gray-500 max-w-lg mx-auto mt-3">
                From first contact to active policy — we make insurance simple.
              </p>
            </div>

            <div className="relative">
              {/* Connecting line — desktop */}
              <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {PROCESS.map((p, i) => (
                  <div key={p.step} className="relative flex flex-col items-center text-center group">
                    <div className="w-16 h-16 bg-navy-gradient rounded-2xl flex items-center justify-center mb-4 shadow-navy group-hover:shadow-gold transition-shadow duration-300 z-10">
                      <span className="font-display font-bold text-gold-400 text-xl">{p.step}</span>
                    </div>
                    <h3 className="font-sans font-semibold text-navy-900 text-sm mb-2">{p.title}</h3>
                    <p className="font-sans text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────── */}
        <section className="relative py-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&fit=crop)" }}
          />
          <div className="absolute inset-0 bg-navy-950/88" />
          <div className="relative z-10 container-custom text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Not Sure Which Policy You Need?
            </h2>
            <p className="font-sans text-gray-300 max-w-xl mx-auto text-base mb-8">
              Our licensed brokers will assess your risks and recommend the right coverage — completely free of charge.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn btn-primary px-8 py-4 text-base">
                Talk to a Broker
              </Link>
              <a
                href="tel:+2341234567890"
                className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 text-base"
              >
                Call +234 (0)1 234 5678
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
