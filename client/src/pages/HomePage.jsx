import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import ServiceCard from "../components/ServiceCard";
import TestimonialCard from "../components/TestimonialCard";
import useScrollReveal from "../hooks/useScrollReveal";

const SERVICES = [
  { icon: "🏢", title: "Business Insurance", color: "navy", description: "Comprehensive coverage for SMEs and corporations — from liability to property, we protect your enterprise." },
  { icon: "🏠", title: "Property Insurance", color: "gold", description: "Safeguard your home and commercial property against fire, theft, floods, and unforeseen damage." },
  { icon: "🚗", title: "Motor Insurance", color: "navy", description: "Third-party and comprehensive vehicle coverage meeting all NAICOM requirements across Nigeria." },
  { icon: "💊", title: "Health Insurance", color: "green", description: "Quality healthcare plans for individuals and corporate groups, partnered with leading HMOs." },
  { icon: "🛡️", title: "Life Insurance", color: "gold", description: "Secure your family's financial future with term life, whole life, and investment-linked plans." },
  { icon: "✈️", title: "Travel Insurance", color: "navy", description: "Worry-free travel with coverage for medical emergencies, trip cancellations, and lost luggage." },
];

const TESTIMONIALS = [
  {
    name: "Chidinma Okafor",
    role: "Business Owner, Lagos",
    initials: "CO",
    quote: "Global Allianz has been our business insurance partner for over 5 years. Their response during our flood claim was exceptional — processed and paid within two weeks.",
  },
  {
    name: "Emmanuel Adewale",
    role: "Fleet Manager, Abuja",
    initials: "EA",
    quote: "Managing motor insurance for 40 vehicles used to be a headache. GAIB made it seamless and their premiums are the most competitive we've found in Nigeria.",
  },
  {
    name: "Dr. Ngozi Eze",
    role: "Medical Director, Port Harcourt",
    initials: "NE",
    quote: "Their group health insurance plan covered my entire clinic staff at a price that made sense. The claims process is transparent and fast.",
  },
];

const STATS = [
  { value: "25+", label: "Years in Business" },
  { value: "10K+", label: "Clients Protected" },
  { value: "50+", label: "Insurance Products" },
  { value: "98%", label: "Claims Settled" },
];

export default function HomePage() {
  useScrollReveal();

  return (
    <div>
      <HeroSlider />

      {/* Stats Bar */}
      <section className="bg-navy-900 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-navy-700">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-6">
                <div className="font-display text-3xl md:text-4xl font-bold text-gold-400">{s.value}</div>
                <div className="font-sans text-xs text-gray-400 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              What We Offer
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4 mb-4">
              Comprehensive Insurance Solutions
            </h2>
            <p className="font-sans text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              From personal protection to corporate risk management, we have the right coverage for every need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.title} {...s} delay={i * 80} />
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <Link to="/services" className="btn btn-secondary">
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-pad bg-section-gradient">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image side */}
            <div className="reveal-left relative">
              <div className="rounded-2xl overflow-hidden shadow-navy aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80&fit=crop"
                  alt="Insurance brokers at work"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-card-hover p-5 max-w-[200px]">
                <div className="font-display text-3xl font-bold text-navy-900">98%</div>
                <div className="font-sans text-xs text-gray-500 mt-1">Claims satisfaction rate from our clients</div>
                <div className="flex mt-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="reveal-right">
              <span className="section-label">Why Choose Us</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-3 mb-5">
                Nigeria's Most Trusted Insurance Brokerage
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed mb-8">
                Global Allianz Insurance Brokers connects you with the best insurers in Nigeria — we work for you, not the insurance companies. Our expert brokers negotiate the best terms on your behalf.
              </p>
              <div className="space-y-4">
                {[
                  { icon: "✅", title: "NAICOM Licensed", desc: "Fully licensed and regulated by the National Insurance Commission" },
                  { icon: "🤝", title: "Independent Brokers", desc: "We represent YOU, not the insurer — always advocating for your best interest" },
                  { icon: "⚡", title: "Fast Claims Processing", desc: "Dedicated claims team to ensure swift and fair settlement" },
                  { icon: "📞", title: "24/7 Support", desc: "Round-the-clock assistance for emergencies and inquiries" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <h4 className="font-sans font-semibold text-navy-900 text-sm">{item.title}</h4>
                      <p className="font-sans text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary mt-8">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              Client Stories
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4 mb-4">
              What Our Clients Say
            </h2>
            <p className="font-sans text-gray-500 max-w-xl mx-auto text-base">
              Thousands of Nigerians trust Global Allianz to protect what matters most.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80&fit=crop)" }}
        />
        <div className="absolute inset-0 bg-navy-950/85" />
        <div className="relative z-10 container-custom text-center">
          <span className="section-label text-gold-400 mb-4 block">
            <span className="bg-gold-500/20 border border-gold-500/30 px-4 py-1.5 rounded-full">Free Consultation</span>
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mt-4 mb-5 reveal">
            Ready to Get the Right Coverage?
          </h2>
          <p className="font-sans text-gray-300 max-w-xl mx-auto text-base mb-10 reveal delay-100">
            Contact our expert brokers today for a free, no-obligation consultation. We'll find the perfect insurance solution for you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center reveal delay-200">
            <Link to="/contact" className="btn btn-primary px-8 py-4 text-base">
              Get a Free Quote
            </Link>
            <a href="https://wa.me/2341234567890" target="_blank" rel="noopener noreferrer"
              className="btn bg-gsuccess-600 text-white hover:bg-green-700 px-8 py-4 text-base">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
