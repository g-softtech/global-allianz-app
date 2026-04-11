import { Link } from "react-router-dom";
import useScrollReveal from "../hooks/useScrollReveal";

const VALUES = [
  { icon: "🤝", title: "Integrity", desc: "We operate with honesty, transparency, and ethical standards in every interaction." },
  { icon: "🎓", title: "Expertise", desc: "Our licensed brokers bring deep industry knowledge to every client engagement." },
  { icon: "💡", title: "Innovation", desc: "We embrace technology to deliver faster, smarter insurance solutions." },
  { icon: "👥", title: "Client Focus", desc: "Your needs drive everything we do — we are your advocate, not the insurer's." },
  { icon: "🌍", title: "Accessibility", desc: "Insurance for all — we make quality coverage reachable and affordable." },
];

const TEAM = [
  {
    name: "Adebayo Okonkwo",
    role: "Managing Director / CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&facepad=3",
    bio: "Over 25 years of insurance industry experience across Nigeria and West Africa.",
  },
  {
    name: "Amaka Chukwuemeka",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&fit=crop&facepad=3",
    bio: "Expert in claims management and client relationship management with 18 years' experience.",
  },
  {
    name: "Seun Fashola",
    role: "Head of Corporate Accounts",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&facepad=3",
    bio: "Specializes in corporate risk management and large fleet insurance solutions.",
  },
];

const MILESTONES = [
  { year: "2001", event: "Global Allianz Insurance Brokers founded in Lagos, Nigeria" },
  { year: "2005", event: "Received full NAICOM brokerage license and regulatory approval" },
  { year: "2010", event: "Expanded to Abuja and Port Harcourt with dedicated offices" },
  { year: "2015", event: "Crossed 5,000 active client milestone; won Lagos Insurance Broker of the Year" },
  { year: "2020", event: "Launched digital policy management platform for clients" },
  { year: "2026", event: "Serving 10,000+ clients with 50+ insurance products nationwide" },
];

export default function AboutPage() {
  useScrollReveal();

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-navy-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.4) 1px, transparent 0)", backgroundSize: "40px 40px"}} />
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="section-label text-gold-400 mb-4 block">About Us</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-5">
            Nigeria's Trusted Insurance Brokerage
          </h1>
          <p className="font-sans text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            For over two decades, Global Allianz Insurance Brokers has been connecting Nigerians with the protection they need — from individuals to Fortune 500 companies.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80&fit=crop"
                alt="GAIB team at work"
                className="rounded-2xl shadow-navy w-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="reveal-right">
              <span className="section-label">Our Purpose</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-3 mb-8">
                Driven by a Clear Mission
              </h2>
              <div className="space-y-8">
                <div className="border-l-4 border-gold-500 pl-6">
                  <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">Our Mission</h3>
                  <p className="font-sans text-gray-600 leading-relaxed">
                    "To exceed our clients' expectations in our commitment to their financial security and peace of mind through expert insurance brokerage services."
                  </p>
                </div>
                <div className="border-l-4 border-navy-500 pl-6">
                  <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">Our Vision</h3>
                  <p className="font-sans text-gray-600 leading-relaxed">
                    "To deliver our services in a way that will make our clients our best marketers — through exceptional service that earns lifelong trust and advocacy."
                  </p>
                </div>
                <div className="bg-navy-50 rounded-2xl p-5">
                  <p className="font-sans text-sm text-navy-700 font-medium italic">
                    "We are not just brokers — we are your long-term partners in building financial resilience across every stage of life and business."
                  </p>
                  <p className="font-sans text-xs text-gray-400 mt-2">— Adebayo Okonkwo, CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-pad bg-section-gradient">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              Our Foundation
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4 mb-4">Core Values</h2>
            <p className="font-sans text-gray-500 max-w-lg mx-auto">These principles guide every decision we make and every service we deliver.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className="reveal card text-center border border-gray-100" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-display font-semibold text-navy-900 text-base mb-2">{v.title}</h3>
                <p className="font-sans text-xs text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-pad bg-navy-gradient">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label text-gold-400">Our Journey</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">25 Years of Excellence</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-navy-700" />
            {MILESTONES.map((m, i) => (
              <div
                key={m.year}
                className={`reveal relative flex gap-8 mb-10 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                  <div className="bg-navy-800 rounded-xl p-5 border border-navy-700 inline-block max-w-xs">
                    <div className="font-display text-gold-400 font-bold text-lg mb-1">{m.year}</div>
                    <p className="font-sans text-gray-300 text-sm">{m.event}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-5 w-4 h-4 bg-gold-500 rounded-full border-4 border-navy-900 z-10" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <span className="section-label">
              <span className="gold-divider w-8 h-px" />
              The People Behind GAIB
              <span className="gold-divider w-8 h-px" />
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mt-4">Meet Our Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <div key={member.name} className="reveal card border border-gray-100 text-center group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-5 border-4 border-gold-100 group-hover:border-gold-400 transition-colors duration-300">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-900 mb-1">{member.name}</h3>
                <p className="font-sans text-xs text-gold-600 uppercase tracking-widest font-medium mb-3">{member.role}</p>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad-sm bg-gold-500">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-900">Start Your Protection Journey Today</h2>
            <p className="font-sans text-navy-700 mt-1 text-sm">Speak with a licensed broker — completely free, no commitment.</p>
          </div>
          <Link to="/contact" className="btn btn-secondary flex-shrink-0">
            Get a Free Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
