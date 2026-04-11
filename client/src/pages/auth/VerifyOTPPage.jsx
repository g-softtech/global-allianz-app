import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import apiClient from "../../services/apiClient";

export default function VerifyOTPPage() {
  const [digits,    setDigits]    = useState(["", "", "", "", "", ""]);
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [message,   setMessage]   = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);
  const navigate  = useNavigate();
  const { user }  = useAuthStore();

  // Pre-fill email from auth store if available
  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (i, val) => {
    // Handle paste of full OTP
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...digits];
      pasted.forEach((ch, idx) => { if (idx < 6) next[idx] = ch; });
      setDigits(next);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const otp = digits.join("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Please enter the complete 6-digit OTP."); return; }
    setError(""); setMessage(""); setIsLoading(true);
    try {
      await apiClient.post("/auth/verify-otp", { email, otp });
      setMessage("Email verified! Redirecting to sign in...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setError(""); setIsLoading(true);
    try {
      await apiClient.post("/auth/resend-otp", { email });
      setMessage("A new OTP has been sent to your email.");
      setCountdown(60); setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-section-gradient py-16 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-8 md:p-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-navy-900 text-xs">GA</span>
            </div>
            <span className="font-display font-bold text-navy-900 text-base">Global Allianz</span>
          </Link>

          {/* Icon */}
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-bold text-navy-900 text-center mb-2">Verify Your Email</h1>
          <p className="font-sans text-gray-500 text-sm text-center mb-8">
            We sent a 6-digit code to <span className="font-semibold text-navy-700">{email || "your email"}</span>. Check your inbox (and spam folder).
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-gerror-50 border border-gerror-200 text-gerror-600 px-4 py-3 rounded-xl mb-5 text-sm font-sans">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-600 px-4 py-3 rounded-xl mb-5 text-sm font-sans">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field (in case user navigated here directly) */}
            {!user?.email && (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required className="input-field" placeholder="your@email.com" />
              </div>
            )}

            {/* OTP Digit Inputs */}
            <div>
              <label className="form-label text-center block mb-3">Enter OTP Code</label>
              <div className="flex gap-2 justify-center">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-11 h-14 text-center text-xl font-display font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 ${
                      d
                        ? "border-navy-500 bg-navy-50 text-navy-900"
                        : "border-gray-200 bg-white text-navy-900 focus:border-gold-500"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading || otp.length < 6} className="btn btn-primary w-full py-3.5">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : "Verify Email →"}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-6">
            {canResend ? (
              <button onClick={handleResend} disabled={isLoading}
                className="font-sans text-sm text-navy-600 hover:text-gold-600 font-semibold transition-colors">
                Resend OTP code
              </button>
            ) : (
              <p className="font-sans text-sm text-gray-400">
                Resend code in <span className="font-semibold text-navy-700">{countdown}s</span>
              </p>
            )}
          </div>

          <div className="text-center mt-4">
            <Link to="/login" className="font-sans text-xs text-gray-400 hover:text-navy-600 transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
