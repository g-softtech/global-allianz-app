import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-section-gradient flex items-center justify-center px-4 pt-24 pb-16">
        <div className="bg-white rounded-2xl shadow-card-hover border border-warm-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gsuccess-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gsuccess-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">Check your email</h2>
          <p className="font-sans text-warm-500 text-sm leading-relaxed mb-2">
            We sent a password reset link to:
          </p>
          <p className="font-sans font-semibold text-navy-900 text-sm mb-6">{email}</p>
          <p className="font-sans text-xs text-warm-400 mb-8">
            The link expires in 1 hour. Check your spam folder if you don't see it.
          </p>
          <Link to="/login" className="btn btn-primary w-full justify-center">
            Back to Login
          </Link>
          <button onClick={() => setSent(false)}
            className="mt-3 w-full font-sans text-xs text-warm-400 hover:text-navy-700 transition-colors py-2">
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-section-gradient flex items-center justify-center px-4 pt-24 pb-16">
      <div className="bg-white rounded-2xl shadow-card-hover border border-warm-100 p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gold-50 border border-gold-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">Forgot Password?</h1>
          <p className="font-sans text-warm-500 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-gerror-50 border border-gerror-200 text-gerror-700 px-4 py-3 rounded-xl mb-5 text-sm font-sans">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" value={email} required
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Sending...
              </span>
            ) : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6 pt-5 border-t border-warm-100">
          <Link to="/login" className="font-sans text-sm text-warm-500 hover:text-navy-700 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
