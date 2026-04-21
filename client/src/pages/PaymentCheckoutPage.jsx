import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/apiClient";

export default function PaymentCheckoutPage() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { user }     = useAuthStore();
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [initiated,  setInitiated]  = useState(false);

  const policy  = state?.policy;
  const subType = state?.subType;

  // Redirect if no policy data
  useEffect(() => {
    if (!policy) navigate("/policies/buy");
  }, [policy, navigate]);

  if (!policy) return null;

  const amount = policy.premium?.amount || subType?.price || 0;

  const handlePay = async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.post("/payments/initialize", {
        policyId: policy._id,
        amount,
      });

      const { authorizationUrl } = res.data.data;

      // Mark as initiated so we don't double-click
      setInitiated(true);

      // Redirect to Paystack checkout
      window.location.href = authorizationUrl;

    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16 flex items-start justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <Link to="/policies/buy" className="flex items-center gap-1.5 text-gray-400 hover:text-navy-700 font-sans text-sm mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Policy Selection
          </Link>
          <h1 className="font-display text-2xl font-bold text-navy-900">Complete Payment</h1>
          <p className="font-sans text-gray-500 text-sm mt-1">Review your order and pay securely via Paystack.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-gerror-50 border border-gerror-200 text-gerror-600 px-5 py-3 rounded-xl mb-5 font-sans text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden mb-4">
          <div className="bg-navy-gradient px-6 py-4">
            <p className="font-sans text-xs text-gold-400 uppercase tracking-widest">Order Summary</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Policy</span>
              <span className="font-sans text-sm font-semibold text-navy-900 capitalize">{policy.type} Insurance</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Plan</span>
              <span className="font-sans text-sm font-semibold text-navy-900 capitalize">{policy.subType?.replace("_", " ") || subType?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Policy Number</span>
              <span className="font-sans text-sm font-semibold text-navy-900">{policy.policyNumber || "Pending"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Duration</span>
              <span className="font-sans text-sm font-semibold text-navy-900">12 months</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Billing</span>
              <span className="font-sans text-sm font-semibold text-navy-900">Annual</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-sans font-semibold text-navy-900">Total Due</span>
              <span className="font-display text-2xl font-bold text-gold-600">₦{amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Billing info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 mb-4">
          <p className="font-sans text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3">Billing Information</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Name</span>
              <span className="font-sans text-sm font-semibold text-navy-900">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Email</span>
              <span className="font-sans text-sm font-semibold text-navy-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-sm text-gray-500">Phone</span>
              <span className="font-sans text-sm font-semibold text-navy-900">{user?.phone || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Test card info */}
        <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-5">
          <p className="font-sans text-xs font-semibold text-gold-800 uppercase tracking-wide mb-2">🧪 Test Mode — Use these card details</p>
          <div className="space-y-1">
            {[
              ["Card Number", "4084 0840 8408 4081"],
              ["Expiry",      "Any future date"],
              ["CVV",         "408"],
              ["OTP",         "123456"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="font-sans text-xs text-gold-700">{label}</span>
                <span className="font-mono text-xs font-semibold text-gold-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading || initiated}
          className="btn btn-primary w-full py-4 text-base"
        >
          {loading || initiated ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Redirecting to Paystack...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Pay ₦{amount.toLocaleString()} Securely
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-5">
          {["🔒 SSL Secured", "✅ Paystack", "🏛️ NAICOM Licensed"].map((badge) => (
            <span key={badge} className="font-sans text-xs text-gray-400">{badge}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
