import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../services/apiClient";

export default function LoginPage() {
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      setAuth(response.data.data);
      navigate("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError("Too many login attempts. Please wait a few minutes and try again.");
      } else if (status === 423) {
        setError(err.response?.data?.message || "Account temporarily locked. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.6) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
            <span className="font-display font-bold text-navy-900 text-sm">GA</span>
          </div>
          <div>
            <span className="block font-display font-bold text-white text-base leading-none">Global Allianz</span>
            <span className="block font-sans text-gold-400 text-[10px] uppercase tracking-widest mt-0.5">Insurance Brokers</span>
          </div>
        </Link>

        {/* Middle content */}
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-white leading-snug mb-4">
            Welcome back.<br />Your protection awaits.
          </h2>
          <p className="font-sans text-gray-400 text-sm leading-relaxed mb-8">
            Access your policies, track claims, and manage your insurance coverage — all in one place.
          </p>
          <div className="space-y-4">
            {[
              { icon: "📄", text: "View & renew all your active policies" },
              { icon: "⚡", text: "Submit and track claims in real time" },
              { icon: "🔒", text: "Secure, NDPR-compliant platform" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-sans text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-navy-700 pt-6">
          <p className="font-sans text-xs text-gray-500 italic">
            "To exceed our clients' expectations in our commitment to their financial success."
          </p>
          <p className="font-sans text-xs text-gold-500 mt-1 font-medium">— GAIB Mission Statement</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-navy-900 text-xs">GA</span>
            </div>
            <span className="font-display font-bold text-navy-900 text-base">Global Allianz</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Sign In</h1>
            <p className="font-sans text-gray-500 text-sm">Don't have an account?{" "}
              <Link to="/register" className="text-navy-600 font-semibold hover:text-gold-600 transition-colors">Create one free</Link>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-gerror-50 border border-gerror-200 text-gerror-600 px-4 py-3 rounded-xl mb-6 text-sm font-sans">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className="input-field" placeholder="you@example.com" />
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="font-sans text-xs text-navy-500 hover:text-gold-600 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="input-field pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600 transition-colors">
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3.5 mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="font-sans text-xs text-gray-400">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="text-navy-500 hover:text-gold-600 transition-colors">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-navy-500 hover:text-gold-600 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
