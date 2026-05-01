import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function ResetPasswordPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token");
  const email      = params.get("email");

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
    }
  }, [token, email]);

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength      = getStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-green-600"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-section-gradient flex items-center justify-center px-4 pt-24 pb-16">
        <div className="bg-white rounded-2xl shadow-card-hover border border-warm-100 p-10 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gsuccess-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gsuccess-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">Password Reset!</h2>
          <p className="font-sans text-warm-500 text-sm mb-6">
            Your password has been updated successfully. Redirecting to login...
          </p>
          <Link to="/login" className="btn btn-primary w-full justify-center">
            Go to Login
          </Link>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">Set New Password</h1>
          <p className="font-sans text-warm-500 text-sm">
            {email ? `Resetting password for ${decodeURIComponent(email)}` : "Enter your new password below."}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-gerror-50 border border-gerror-200 text-gerror-700 px-4 py-3 rounded-xl mb-5 text-sm font-sans">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              {error}
              {error.includes("expired") && (
                <Link to="/forgot-password" className="block mt-1 font-semibold underline">
                  Request new reset link →
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password} required minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Minimum 6 characters"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 hover:text-navy-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={showPw
                      ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
                  />
                </svg>
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-warm-100"}`} />
                  ))}
                </div>
                <p className={`font-sans text-xs ${strength < 3 ? "text-orange-500" : "text-gsuccess-600"}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"}
              value={confirm} required
              onChange={(e) => setConfirm(e.target.value)}
              className={`input-field ${confirm && confirm !== password ? "border-gerror-400 ring-gerror-200" : ""}`}
              placeholder="Repeat your new password"
            />
            {confirm && confirm !== password && (
              <p className="form-error">Passwords do not match</p>
            )}
          </div>

          <button type="submit" disabled={loading || !token} className="btn btn-primary w-full py-3.5 mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Resetting...
              </span>
            ) : "Reset Password"}
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
