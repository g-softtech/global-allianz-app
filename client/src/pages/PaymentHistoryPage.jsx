import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/apiClient";

const STATUS_CONFIG = {
  success:   { label: "Success",   classes: "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200" },
  pending:   { label: "Pending",   classes: "bg-gold-50 text-gold-600 border-gold-200" },
  failed:    { label: "Failed",    classes: "bg-gerror-50 text-gerror-600 border-gerror-200" },
  abandoned: { label: "Abandoned", classes: "bg-gray-50 text-gray-500 border-gray-200" },
  refunded:  { label: "Refunded",  classes: "bg-blue-50 text-blue-600 border-blue-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [stats,    setStats]    = useState({ total: 0, success: 0, amount: 0 });

  useEffect(() => {
    apiClient.get("/payments")
      .then((res) => {
        const data = res.data.data || [];
        setPayments(data);
        setStats({
          total:   data.length,
          success: data.filter((p) => p.status === "success").length,
          amount:  data.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0),
        });
      })
      .catch(() => setError("Failed to load payment history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16">
      <div className="container-custom max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-900">Payment History</h1>
            <p className="font-sans text-gray-500 text-sm mt-1">All your payment transactions in one place.</p>
          </div>
          <Link to="/policies/buy" className="btn btn-primary text-sm">
            + New Policy
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Payments",    value: stats.total,                        icon: "💳" },
            { label: "Successful",        value: stats.success,                      icon: "✅" },
            { label: "Total Paid",        value: `₦${stats.amount.toLocaleString()}`, icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-xl font-bold text-navy-900">{s.value}</div>
              <div className="font-sans text-xs text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="font-sans text-gerror-600 text-sm">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-display font-semibold text-navy-900 text-lg mb-2">No payments yet</h3>
              <p className="font-sans text-gray-400 text-sm mb-6">Purchase a policy to see your payment history here.</p>
              <Link to="/policies/buy" className="btn btn-primary text-sm">Buy Your First Policy</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Reference", "Policy", "Amount", "Channel", "Date", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-navy-700 font-semibold">{p.reference?.slice(0, 20)}...</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-sans text-sm text-navy-900 capitalize">{p.policy?.policyNumber || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-sans text-sm font-semibold text-navy-900">₦{p.amount?.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-sans text-xs text-gray-500 capitalize">{p.channel || "Online"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-sans text-xs text-gray-500">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                            : new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                          }
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
