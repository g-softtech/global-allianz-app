import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import useScrollReveal from "../hooks/useScrollReveal";

const SERVICES = [
  { icon: "🏢", title: "Business",  hash: "business-insurance", desc: "Liability, property, interruption and group cover for enterprises of every size." },
  { icon: "🏠", title: "Property",  hash: "property-insurance", desc: "Buildings and contents protection against fire, theft, floods and accidents." },
  { icon: "🚗", title: "Motor",     hash: "motor-insurance",    desc: "Third-party to comprehensive vehicle cover for individuals and fleets." },
  { icon: "💊", title: "Health",    hash: "health-insurance",   desc: "Individual and group healthcare plans with leading Nigerian HMOs." },
  { icon: "🛡️", title: "Life",     hash: "life-insurance",     desc: "Term, whole life and investment-linked plans for your family's future." },
  { icon: "✈️", title: "Travel",   hash: "travel-insurance",   desc: "Single and multi-trip cover for medical emergencies and cancellations." },
];

const STATS = [
  { value: "25+",  label: "Years in Business" },
  { value: "10K+", label: "Clients Protected" },
  { value: "50+",  label: "Insurance Products" },
  { value: "98%",  label: "Claims Settled" },
];

const WHY = [
  { icon: "◈", title: "Independent Advice",   desc: "We represent you — not the insurer. Always advocating for your best interests." },
  { icon: "◉", title: "Expert Brokers",        desc: "Licensed professionals with deep market knowledge and insurer relationships." },
  { icon: "◐", title: "Fast Claims Support",   desc: "Dedicated claims team ensuring swift, fair settlement on every claim." },
  { icon: "◇", title: "NAICOM Regulated",      desc: "Fully licensed and compliant with all Nigerian insurance regulations." },
];

const TESTIMONIALS = [
  {
    quote: "GAIB processed our flood claim in under two weeks. Exceptional service from a team that genuinely cares.",
    name: "Chidinma Okafor", role: "Business Owner, Lagos", init: "CO",
  },
  {
    quote: "Managing motor insurance for 40 vehicles used to be a headache. GAIB made it seamless with the most competitive premiums I've found.",
    name: "Emmanuel Adewale", role: "Fleet Manager, Abuja", init: "EA",
  },
  {
    quote: "Their group health plan covered my entire clinic staff at a price that made sense. Claims are transparent and fast.",
    name: "Dr. Ngozi Eze", role: "Medical Director, Port Harcourt", init: "NE",
  },
];

export default function HomePage() {
  useScrollReveal();

  return (
    <div>
      <HeroSlider />

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section className="bg-navy-900 border-y border-navy-800">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-navy-800">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-6 first:pl-0 last:pr-0">
                <div className="font-display text-3xl font-bold text-gold-400">{s.value}</div>
                <div className="font-sans text-xs text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="label-overline mb-4">What We Offer</p>
            <h2 className="section-title mb-4">Coverage for every need</h2>
            <p className="section-body max-w-lg mx-auto">
              Six specialised insurance lines, each tailored to the Nigerian market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
              <Link
                key={s.title}
                to={`/services#${s.hash}`}
                className="reveal card-gold-hover group p-7"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="text-3xl mb-5 transition-transform duration-300 group-hover:scale-110 inline-block">{s.icon}</div>
                <h3 className="font-display text-lg font-semibold text-navy-900 mb-2 group-hover:text-navy-700">{s.title} Insurance</h3>
                <p className="font-sans text-sm text-warm-500 leading-relaxed mb-5">{s.desc}</p>
                <span className="font-sans text-xs font-semibold text-gold-600 flex items-center gap-1.5 group-hover:gap-3 transition-all duration-300">
                  Learn more
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <Link to="/services" className="btn btn-outline">
              View all services
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────── */}
      <section className="section-pad bg-section-warm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div className="reveal-left">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=85&fit=crop"
                  alt="GAIB brokers at work"
                  className="rounded-3xl w-full object-cover aspect-[4/3] shadow-navy"
                />
                {/* Floating stat card */}
                <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-soft-lg p-5 border border-warm-100">
                  <div className="font-display text-3xl font-bold text-navy-900">98%</div>
                  <div className="font-sans text-xs text-warm-500 mt-1 max-w-[120px]">Claims satisfaction rate</div>
                  <div className="flex gap-0.5 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-right">
              <p className="label-overline mb-4">Why Choose GAIB</p>
              <h2 className="section-title mb-5">Nigeria's most trusted insurance brokerage</h2>
              <p className="section-body mb-10">
                We work for you — not the insurance companies. Our independent brokers negotiate the best terms on your behalf, ensuring you get the right coverage at the right price.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {WHY.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-8 h-8 bg-gold-50 border border-gold-200 rounded-lg flex items-center justify-center text-gold-600 flex-shrink-0 font-mono text-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-navy-900 text-sm mb-1">{item.title}</h4>
                      <p className="font-sans text-xs text-warm-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex gap-4">
                <Link to="/about" className="btn btn-secondary py-3 text-sm">
                  About us
                </Link>
                <Link to="/contact" className="btn btn-outline py-3 text-sm">
                  Free consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <p className="label-overline mb-4">Client Stories</p>
            <h2 className="section-title">What our clients say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="reveal card p-7 flex flex-col gap-5" style={{ transitionDelay: `${i * 80}ms` }}>
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="font-sans text-sm text-warm-600 leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-warm-100">
                  <div className="w-9 h-9 bg-navy-gradient rounded-full flex items-center justify-center text-white font-display font-bold text-xs flex-shrink-0">
                    {t.init}
                  </div>
                  <div>
                    <p className="font-sans font-semibold text-navy-900 text-xs">{t.name}</p>
                    <p className="font-sans text-warm-400 text-xs mt-0.5">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="section-pad bg-navy-gradient">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <p className="label-overline text-gold-400 mb-4">Free Consultation</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-5 leading-tight reveal">
              Ready to get the right coverage?
            </h2>
            <p className="font-sans text-gray-400 mb-10 leading-relaxed reveal delay-100">
              Speak with one of our licensed brokers today. No pressure, no jargon — just honest advice tailored to your situation.
            </p>
            <div className="flex flex-wrap gap-4 justify-center reveal delay-200">
              <Link to="/contact" className="btn btn-primary px-8 py-4">
                Get a free quote
              </Link>
              <a href="https://wa.me/2341234567890" target="_blank" rel="noopener noreferrer"
                className="btn bg-white/10 border border-white/20 text-white hover:bg-white/20 px-8 py-4 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
