import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");

  const [status,  setStatus]  = useState("verifying"); // verifying | success | failed
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found.");
      return;
    }

    apiClient.get(`/payments/verify/${reference}`)
      .then((res) => {
        setPayment(res.data.data);
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(err.response?.data?.message || "Payment verification failed.");
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-section-gradient flex items-center justify-center px-4 pt-24 pb-16">
      <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-10 w-full max-w-md text-center">

        {/* Verifying */}
        {status === "verifying" && (
          <>
            <div className="w-16 h-16 border-4 border-navy-100 border-t-gold-500 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Verifying Payment</h2>
            <p className="font-sans text-gray-500 text-sm">Please wait while we confirm your payment with Paystack...</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-gsuccess-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gsuccess-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Payment Successful!</h2>
            <p className="font-sans text-gray-500 text-sm mb-6">{message}</p>

            {payment && (
              <div className="bg-gsuccess-50 border border-gsuccess-200 rounded-xl p-5 text-left mb-6 space-y-2">
                {[
                  { label: "Reference",   value: payment.reference },
                  { label: "Amount Paid", value: `₦${payment.amount?.toLocaleString()} NGN` },
                  { label: "Channel",     value: payment.channel || "Online" },
                  { label: "Status",      value: "Confirmed ✅" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="font-sans text-xs text-gray-500">{row.label}</span>
                    <span className="font-sans text-xs font-semibold text-navy-900 capitalize">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn btn-primary w-full justify-center">
                Go to Dashboard
              </Link>
              <Link to="/profile" className="btn border-2 border-gray-200 text-gray-600 hover:border-navy-300 w-full justify-center text-sm">
                View My Policies
              </Link>
            </div>
          </>
        )}

        {/* Failed */}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-gerror-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gerror-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Payment Failed</h2>
            <p className="font-sans text-gray-500 text-sm mb-6">{message}</p>

            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="btn btn-primary w-full justify-center">
                Try Again
              </Link>
              <a href="https://wa.me/2341234567890" target="_blank" rel="noopener noreferrer"
                className="btn border-2 border-gray-200 text-gray-600 hover:border-gsuccess-400 w-full justify-center text-sm">
                Contact Support
              </a>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
