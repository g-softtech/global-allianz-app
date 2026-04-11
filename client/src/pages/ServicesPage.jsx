import { Link } from "react-router-dom";
import useScrollReveal from "../hooks/useScrollReveal";

const SERVICES = [
  {
    id: "business",
    icon: "🏢",
    title: "Business Insurance",
    tagline: "Complete protection for your enterprise",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop",
    description: "Whether you run an SME or a multinational corporation, our business insurance packages protect you against the full spectrum of commercial risks — from public liability to property damage, business interruption, and more.",
    coverage: ["Public & Product Liability", "Employers' Liability", "Commercial Property", "Business Interruption", "Professional Indemnity", "Group Life & Health"],
    ideal: "SMEs, Corporations, NGOs, Manufacturing companies",
  },
  {
    id: "motor",
    icon: "🚗",
    title: "Motor Insurance",
    tagline: "Drive with complete confidence",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80&fit=crop",
    description: "From mandatory third-party to comprehensive cover, we offer the full range of motor insurance products for private cars, commercial vehicles, and large fleets at competitive premiums.",
    coverage: ["Third-Party Liability (TPO)", "Comprehensive Cover", "Fleet Insurance", "Commercial Vehicle Cover", "Motorcycles & Tricycles", "Motor Trade Insurance"],
    ideal: "Private car owners, Fleet operators, Transport companies",
  },
  {
    id: "health",
    icon: "💊",
    title: "Health Insurance",
    tagline: "Quality healthcare for every budget",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&fit=crop",
    description: "Access quality healthcare through our NHIS and private health insurance products. We partner with leading HMOs to deliver individual and group plans that keep your team healthy and productive.",
    coverage: ["Individual Health Plans", "Group/Corporate HMO", "NHIS Compliance Plans", "Maternity Cover", "Dental & Vision Add-ons", "International Health Cover"],
    ideal: "Individuals, Corporate employers, SMEs, Government agencies",
  },
  {
    id: "life",
    icon: "🛡️",
    title: "Life Insurance",
    tagline: "Secure your family's financial future",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop",
    description: "Life insurance is the foundation of financial planning. We offer term life, whole life, and investment-linked policies to ensure your family is taken care of no matter what.",
    coverage: ["Term Life Insurance", "Whole Life Insurance", "Mortgage Protection", "Investment-Linked Plans", "Group Life Cover", "Credit Life Insurance"],
    ideal: "Families, Employees, Mortgage holders, Business partners",
  },
  {
    id: "property",
    icon: "🏠",
    title: "Property Insurance",
    tagline: "Protect your biggest investment",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fit=crop",
    description: "Your home and property deserve the best protection. Our comprehensive property insurance covers buildings and contents against fire, burglary, floods, and accidental damage.",
    coverage: ["Buildings Insurance", "Home Contents", "All-Risks Cover", "Landlord Insurance", "Commercial Property", "Burglary & Theft"],
    ideal: "Homeowners, Landlords, Tenants, Commercial property owners",
  },
  {
    id: "travel",
    icon: "✈️",
    title: "Travel Insurance",
    tagline: "Adventure with complete peace of mind",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&fit=crop",
    description: "Whether it's a business trip to London or a family holiday in Dubai, our travel insurance covers medical emergencies, trip cancellations, baggage loss, and more for single and multi-trip plans.",
    coverage: ["Emergency Medical Cover", "Trip Cancellation", "Lost/Delayed Baggage", "Travel Delays", "Personal Accident", "Schengen Visa Cover"],
    ideal: "Frequent travelers, Families, Corporate road warriors",
  },
];

const PROCESS = [
  { step: "01", title: "Consultation", desc: "Speak with our licensed broker to discuss your specific insurance needs." },
  { step: "02", title: "Risk Assessment", desc: "We assess your risks and identify the most suitable coverage options." },
  { step: "03", title: "Quote & Compare", desc: "We source competitive quotes from multiple insurers on your behalf." },
  { step: "04", title: "Policy Placement", desc: "We place your policy, handle documentation, and issue your certificate." },
  { step: "05", title: "Ongoing Support", desc: "We manage renewals, claims, and any changes throughout your policy lifecycle." },
];

export default function ServicesPage() {
  useScrollReveal();

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.4) 1px, transparent 0)", backgroundSize: "40px 40px"}} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="section-label text-gold-400 mb-4 block">What We Offer</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Our Insurance Services
          </h1>
          <p className="font-sans text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Comprehensive insurance solutions for individuals, families, and businesses across Nigeria — backed by 25+ years of expertise.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="section-pad bg-white">
        <div className="container-custom space-y-20">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              id={s.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
            >
              <div className={`reveal-${i % 2 === 0 ? "left" : "right"}`}>
                <div className="rounded-2xl overflow-hidden shadow-card aspect-[4/3]">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className={`reveal-${i % 2 === 0 ? "right" : "left"} ${i % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-900">{s.title}</h2>
                    <p className="font-sans text-gold-600 text-sm font-medium">{s.tagline}</p>
                  </div>
                </div>
                <p className="font-sans text-gray-600 leading-relaxed mb-6">{s.description}</p>

                <div className="mb-6">
                  <h4 className="font-sans font-semibold text-navy-900 text-sm uppercase tracking-wide mb-3">Coverage Includes:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {s.coverage.map((c) => (
                      <div key={c} className="flex items-center gap-2 text-sm text-gray-600 font-sans">
                        <svg className="w-4 h-4 text-gsuccess-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-navy-50 rounded-xl px-4 py-3 mb-6">
                  <span className="font-sans text-xs text-navy-600 font-semibold uppercase tracking-wide">Ideal for: </span>
                  <span className="font-sans text-xs text-navy-700">{s.ideal}</span>
                </div>

                <Link to="/contact" className="btn btn-primary">
                  Get a Quote for {s.title}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="section-pad bg-section-gradient">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              How It Works
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4">Our Simple 5-Step Process</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="reveal text-center relative" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-14 h-14 bg-navy-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-navy">
                  <span className="font-display font-bold text-gold-400 text-lg">{p.step}</span>
                </div>
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-gray-200 z-0" />
                )}
                <h3 className="font-sans font-semibold text-navy-900 text-sm mb-2">{p.title}</h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad-sm bg-navy-gradient">
        <div className="container-custom text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 reveal">
            Not Sure Which Cover You Need?
          </h2>
          <p className="font-sans text-gray-400 mb-8 reveal delay-100">Our expert brokers will assess your needs and recommend the perfect solution — for free.</p>
          <div className="flex flex-wrap gap-4 justify-center reveal delay-200">
            <Link to="/contact" className="btn btn-primary">Talk to a Broker</Link>
            <a href="tel:+2341234567890" className="btn btn-white">Call +234 (0)1 234 5678</a>
          </div>
        </div>
      </section>
    </div>
  );
}
