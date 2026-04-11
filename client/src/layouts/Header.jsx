import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const NAV_LINKS = [
  { label: "Home",     to: "/" },
  { label: "About",    to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact",  to: "/contact" },
];

export default function Header() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropOpen,     setDropOpen]     = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        scrolled
          ? "bg-navy-900/98 backdrop-blur-md shadow-navy py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-custom flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold group-hover:shadow-lg transition-shadow duration-300">
            <span className="font-display font-bold text-navy-900 text-sm">GA</span>
          </div>
          <div className="leading-tight">
            <span className="block font-display font-bold text-white text-base leading-none">Global Allianz</span>
            <span className="block font-sans text-gold-400 text-[10px] uppercase tracking-widest leading-none mt-0.5">Insurance Brokers</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-sans font-medium text-sm tracking-wide transition-colors duration-200 relative group ${
                isActive(link.to)
                  ? "text-gold-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gold-500 rounded-full transition-all duration-300 ${
                  isActive(link.to) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Auth / CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-xl transition-colors duration-200"
              >
                <div className="w-7 h-7 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-xs">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
                <span className="font-sans text-sm font-medium">{user?.firstName}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-navy-800 hover:bg-navy-50 font-sans text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-navy-800 hover:bg-navy-50 font-sans text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </Link>
                  <div className="border-t border-gray-100" />
                  <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-3 text-gerror-600 hover:bg-gerror-50 font-sans text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="font-sans font-medium text-sm text-gray-300 hover:text-white transition-colors duration-200">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary text-sm px-5 py-2.5">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-navy-800 transition-colors"
        >
          <span className={`hamburger-line ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="container-custom py-4 flex flex-col gap-1 bg-navy-900/98 backdrop-blur-md border-t border-navy-800 mt-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl font-sans font-medium text-sm transition-colors duration-200 ${
                isActive(link.to)
                  ? "bg-navy-800 text-gold-400"
                  : "text-gray-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-navy-800 mt-2 pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="px-4 py-3 rounded-xl font-sans font-medium text-sm text-gray-300 hover:bg-navy-800 hover:text-white transition-colors">Dashboard</Link>
                <button onClick={logout} className="px-4 py-3 rounded-xl font-sans font-medium text-sm text-gerror-400 hover:bg-navy-800 transition-colors text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-3 rounded-xl font-sans font-medium text-sm text-gray-300 hover:bg-navy-800 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="btn btn-primary text-sm justify-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
