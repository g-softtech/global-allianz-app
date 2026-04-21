import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const NAV_ITEMS = [
  { to: "/admin",           icon: "📊", label: "Dashboard"  },
  { to: "/admin/users",     icon: "👥", label: "Users"      },
  { to: "/admin/policies",  icon: "📄", label: "Policies"   },
  { to: "/admin/claims",    icon: "⚡", label: "Claims"     },
  { to: "/admin/payments",  icon: "💳", label: "Payments"   },
  { to: "/admin/kyc",       icon: "🪪", label: "KYC Review" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to) =>
    to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-navy-gradient flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-700">
          <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-navy-900 text-xs">GA</span>
          </div>
          <div>
            <span className="block font-display font-bold text-white text-sm leading-none">Global Allianz</span>
            <span className="block font-sans text-gold-400 text-[10px] uppercase tracking-widest mt-0.5">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-gold-500 text-navy-900"
                  : "text-gray-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom — user + links */}
        <div className="px-3 py-4 border-t border-navy-700 space-y-1">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-navy-800 hover:text-white font-sans text-sm transition-colors">
            <span>🌐</span> View Public Site
          </a>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gerror-400 hover:bg-navy-800 font-sans text-sm transition-colors">
            <span>🚪</span> Logout
          </button>
          <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-navy-800 rounded-xl">
            <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-xs flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="font-sans text-[10px] text-gold-400 uppercase tracking-wide">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="font-display font-semibold text-navy-900 text-lg">
                {NAV_ITEMS.find(n => isActive(n.to))?.label || "Admin"}
              </h1>
              <p className="font-sans text-xs text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="font-sans text-sm text-gray-500 hover:text-navy-700 transition-colors hidden sm:block flex items-center gap-1.5">
              🌐 View Public Site
            </a>
            <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-sm">
              {user?.firstName?.[0]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
