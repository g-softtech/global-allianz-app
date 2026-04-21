import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [stats,    setStats]    = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.append("status", status);
    Promise.all([
      apiClient.get(`/payments/admin/all?${params}`),
      apiClient.get("/payments/admin/stats"),
    ])
      .then(([p, s]) => {
        setPayments(p.data.data || []);
        setTotal(p.data.total || 0);
        setPages(p.data.pages || 1);
        setStats(s.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { fetch(); }, [fetch]);

  const STATUS_CLASSES = {
    success:   "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
    pending:   "bg-gold-50 text-gold-600 border-gold-200",
    failed:    "bg-gerror-50 text-gerror-600 border-gerror-200",
    abandoned: "bg-gray-100 text-gray-500 border-gray-200",
    refunded:  "bg-blue-50 text-blue-600 border-blue-200",
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: `₦${((stats.totals?.totalRevenue||0)/1000).toFixed(0)}K`, icon: "💰" },
            { label: "Transactions",  value: stats.totals?.totalCount || 0,   icon: "💳" },
            { label: "Successful",    value: stats.totals?.successCount || 0, icon: "✅" },
            { label: "Paystack",      value: stats.byProvider?.find(p => p._id === "paystack")?.count || 0, icon: "🔒" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-xl font-bold text-navy-900">{s.value}</div>
              <p className="font-sans text-xs text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-44">
          <option value="">All Statuses</option>
          {["success","pending","failed","abandoned","refunded"].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <span className="font-sans text-sm text-gray-500 self-center">{total} transactions</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-sans text-sm">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Reference","Customer","Policy","Amount","Channel","Date","Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-navy-700">{p.reference?.slice(0,18)}...</td>
                    <td className="px-4 py-3 font-sans text-sm text-navy-900">{p.user?.firstName} {p.user?.lastName}</td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-500">{p.policy?.policyNumber || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm font-semibold text-navy-900">₦{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-500 capitalize">{p.channel || "online"}</td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-400">
                      {new Date(p.paidAt || p.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_CLASSES[p.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="font-sans text-sm text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
