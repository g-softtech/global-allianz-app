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
  const navigate  = useNavigate();
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
      const code   = err.response?.data?.code;
      if (status === 429) {
        setError("Too many login attempts. Please wait a few minutes and try again.");
      } else if (status === 423 || code === "ACCOUNT_LOCKED") {
        setError(err.response?.data?.message || "Account temporarily locked. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-section-gradient flex items-center justify-center py-12 px-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card-hover border border-warm-100 p-8">

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold">
              <span className="font-display font-bold text-navy-900 text-sm">GA</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-1">Welcome Back</h2>
            <p className="font-sans text-warm-500 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-gerror-50 border border-gerror-200 text-gerror-700 px-4 py-3 rounded-xl mb-5 text-sm font-sans">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password} required
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12" placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-navy-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d={showPass
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                    />
                  </svg>
                </button>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password"
                  className="font-sans text-xs text-gold-600 hover:text-gold-700 transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary w-full py-3.5 mt-2">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-warm-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-navy-700 hover:text-gold-600 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
