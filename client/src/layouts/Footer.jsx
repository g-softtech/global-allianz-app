import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
  { label: "Get a Quote", to: "/contact" },
];

const SERVICES = [
  { label: "Business Insurance", to: "/services" },
  { label: "Motor Insurance", to: "/services" },
  { label: "Health Insurance", to: "/services" },
  { label: "Life Insurance", to: "/services" },
  { label: "Travel Insurance", to: "/services" },
  { label: "Property Insurance", to: "/services" },
];

const LEGAL = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Compliance", to: "/compliance" },
];

export default function Footer() {
  return (
    <footer className="bg-navy-gradient text-white">
      {/* CTA Band */}
      <div className="bg-gold-500">
        <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-navy-900">Ready to get protected?</h3>
            <p className="font-sans text-navy-700 mt-1 text-sm">Talk to our expert brokers today — no obligation, completely free.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/contact" className="btn bg-navy-900 text-white hover:bg-navy-800 text-sm px-6 py-3">
              Free Consultation
            </Link>
            <a href="tel:+2341234567890" className="btn border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white text-sm px-6 py-3 transition-colors">
              Call Us Now
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center">
                <span className="font-display font-bold text-navy-900 text-sm">GA</span>
              </div>
              <div>
                <span className="block font-display font-bold text-white text-base leading-none">Global Allianz</span>
                <span className="block font-sans text-gold-400 text-[10px] uppercase tracking-widest mt-0.5">Insurance Brokers</span>
              </div>
            </Link>
            <p className="font-sans text-gray-400 text-sm leading-relaxed mb-6">
              Connecting Nigerians with trusted insurance solutions since inception. Your protection is our purpose.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { label: "Facebook", href: "#", icon: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.991 22 12z" },
                { label: "Twitter", href: "#", icon: "M8.29 20c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-7.104 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" },
                { label: "LinkedIn", href: "#", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 bg-navy-800 hover:bg-gold-500 rounded-lg flex items-center justify-center transition-all duration-300 group">
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-navy-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="font-sans text-sm text-gray-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">Our Services</h4>
            <ul className="space-y-3">
              {SERVICES.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="font-sans text-sm text-gray-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white text-base mb-5">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <svg className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-sans text-sm text-gray-400 leading-relaxed">1 Oba Akran Avenue, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+2341234567890" className="font-sans text-sm text-gray-400 hover:text-gold-400 transition-colors">+234 (0)1 234 5678</a>
              </li>
              <li className="flex gap-3">
                <svg className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@gaib.com.ng" className="font-sans text-sm text-gray-400 hover:text-gold-400 transition-colors">info@gaib.com.ng</a>
              </li>
              <li className="flex gap-3">
                <svg className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-sans text-sm text-gray-400">Mon–Fri: 8am – 5pm WAT</span>
              </li>
            </ul>

            {/* WhatsApp */}
            <a
              href="https://wa.me/2341234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-gsuccess-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-gray-500 text-sm">
            © {new Date().getFullYear()} Global Allianz Insurance Brokers Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL.map((l) => (
              <Link key={l.label} to={l.to} className="font-sans text-xs text-gray-500 hover:text-gold-400 transition-colors">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
