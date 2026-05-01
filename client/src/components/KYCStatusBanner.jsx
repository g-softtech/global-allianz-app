import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function KYCStatusBanner() {
  const { user } = useAuthStore();
  const [showCongrats, setShowCongrats] = useState(false);

  // Show congratulatory message when KYC is freshly verified
  // We track this using sessionStorage so it only shows once per session
  useEffect(() => {
    if (!user?.kycVerified) return;
    const shown = sessionStorage.getItem("kyc_congrats_shown");
    if (!shown) {
      setShowCongrats(true);
      sessionStorage.setItem("kyc_congrats_shown", "true");
      // Auto-hide after 8 seconds
      const t = setTimeout(() => setShowCongrats(false), 8000);
      return () => clearTimeout(t);
    }
  }, [user?.kycVerified]);

  // ── Congratulatory banner (temporary, auto-dismisses) ─────
  if (showCongrats) {
    return (
      <div className="bg-gsuccess-50 border border-gsuccess-200 rounded-2xl p-5 mb-6 flex items-start gap-4 animate-fade-up">
        <div className="w-10 h-10 bg-gsuccess-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-sans font-bold text-gsuccess-800 text-sm">
            🎉 Congratulations, {user?.firstName}! Your identity has been verified.
          </h3>
          <p className="font-sans text-gsuccess-700 text-xs mt-1 leading-relaxed">
            Your KYC is complete. You can now purchase policies, file claims, and access all features.
          </p>
        </div>
        <button onClick={() => setShowCongrats(false)}
          className="text-gsuccess-400 hover:text-gsuccess-700 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    );
  }

  // ── Already verified — no banner needed ───────────────────
  if (user?.kycVerified) return null;

  // ── Pending — documents submitted but not yet verified ────
  if (user?.kycDocuments?.length > 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-sans font-semibold text-blue-800 text-sm">
            KYC Under Review
          </h3>
          <p className="font-sans text-blue-700 text-xs mt-1 leading-relaxed">
            Your documents have been submitted and are being reviewed by our compliance team.
            This typically takes <strong>24–48 hours</strong>. You'll receive an email once verified.
          </p>
          <p className="font-sans text-blue-500 text-xs mt-2">
            {user?.kycDocuments?.length} document(s) submitted · Awaiting admin review
          </p>
        </div>
      </div>
    );
  }

  // ── Not submitted — prompt to complete KYC ────────────────
  return (
    <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
      <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-sans font-semibold text-gold-800 text-sm">
          Complete Your KYC Verification
        </h3>
        <p className="font-sans text-gold-700 text-xs mt-1 leading-relaxed">
          Identity verification is required before you can purchase policies or file claims.
          It takes less than 5 minutes.
        </p>
      </div>
      <Link to="/profile" state={{ tab: "kyc" }}
        className="btn bg-gold-500 text-navy-900 hover:bg-gold-400 text-xs px-4 py-2 flex-shrink-0">
        Verify Now
      </Link>
    </div>
  );
}
