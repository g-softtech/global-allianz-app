import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate("/");
  };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-navy-900/98 backdrop-blur-xl shadow-sm py-3"
        : "bg-transparent py-5"
    }`}>
      <div className="container-custom flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gold-gradient rounded-lg flex items-center justify-center shadow-gold flex-shrink-0">
            <span className="font-display font-bold text-navy-900 text-xs">GA</span>
          </div>
          <div className="leading-tight">
            <span className="block font-display font-bold text-white text-sm leading-none">
              Global Allianz
            </span>
            <span className="block font-sans text-gold-400 text-[9px] uppercase tracking-widest mt-0.5">
              Insurance Brokers
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}
              className={`relative px-4 py-2 font-sans text-sm font-medium rounded-lg transition-all duration-200 group ${
                isActive(l.to) ? "text-white" : "text-gray-400 hover:text-white"
              }`}>
              {l.label}
              <span className={`absolute bottom-1 left-4 right-4 h-px bg-gold-500 rounded-full transition-all duration-300 origin-left ${
                isActive(l.to)
                  ? "scale-x-100 opacity-100"
                  : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-60"
              }`} />
            </Link>
          ))}
        </nav>

        {/* Auth area — desktop */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            isAdmin ? (
              /* Admin — show admin panel link only, no customer dropdown */
              <div className="flex items-center gap-3">
                <Link to="/admin"
                  className="flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 text-gold-400 hover:bg-gold-500/25 px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Admin Panel
                </Link>
                <button onClick={handleLogout}
                  className="font-sans text-xs text-gray-500 hover:text-gerror-400 transition-colors px-3 py-2">
                  Sign out
                </button>
              </div>
            ) : (
              /* Customer dropdown */
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 transition-colors">
                  <div className="w-6 h-6 bg-gold-gradient rounded-full flex items-center justify-center text-navy-900 font-bold text-xs">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-sans text-sm text-white font-medium">
                    {user?.firstName}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-soft-lg border border-warm-100 overflow-hidden z-50 animate-fade-in">
                    {[
                      { label: "Dashboard",  to: "/dashboard",  icon: "▦" },
                      { label: "My Profile", to: "/profile",    icon: "◉" },
                      { label: "My Policies",to: "/dashboard",  icon: "📄" },
                    ].map((item) => (
                      <Link key={item.label} to={item.to}
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 font-sans text-sm text-warm-700 hover:bg-warm-50 hover:text-navy-900 transition-colors">
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-warm-100" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 font-sans text-sm text-gerror-600 hover:bg-gerror-50 transition-colors">
                      <span>⤤</span> Sign out
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Not logged in */
            <>
              <Link to="/login"
                className="font-sans text-sm font-medium text-gray-400 hover:text-white transition-colors px-3 py-2">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary py-2.5 text-xs">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
          className="lg:hidden flex flex-col gap-1.5 p-2.5 text-white">
          <span className={`hamburger-line ${menuOpen ? "rotate-45 translate-y-2" : ""}`}/>
          <span className={`hamburger-line ${menuOpen ? "opacity-0" : ""}`}/>
          <span className={`hamburger-line ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}/>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-400 ${menuOpen ? "max-h-screen" : "max-h-0"}`}>
        <div className="container-custom py-4 space-y-1 border-t border-navy-800 mt-3">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}
              className={`block px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? "bg-navy-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-navy-800"
              }`}>
              {l.label}
            </Link>
          ))}

          <div className="border-t border-navy-800 pt-3 mt-2 space-y-2">
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <Link to="/admin"
                    className="block px-4 py-3 rounded-xl font-sans text-sm text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 transition-colors">
                    ⚙ Admin Panel
                  </Link>
                  <button onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm text-gerror-400 hover:bg-navy-800 transition-colors">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/dashboard"
                    className="block px-4 py-3 rounded-xl font-sans text-sm text-gray-400 hover:text-white hover:bg-navy-800 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profile"
                    className="block px-4 py-3 rounded-xl font-sans text-sm text-gray-400 hover:text-white hover:bg-navy-800 transition-colors">
                    My Profile
                  </Link>
                  <button onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-xl font-sans text-sm text-gerror-400 hover:bg-navy-800 transition-colors">
                    Sign out
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/login"
                  className="block px-4 py-3 rounded-xl font-sans text-sm text-gray-400 hover:text-white hover:bg-navy-800 transition-colors">
                  Sign in
                </Link>
                <Link to="/register"
                  className="btn btn-primary w-full justify-center text-xs py-3">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
