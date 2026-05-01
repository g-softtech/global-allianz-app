import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const STATUS_COLORS = {
  success: "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
  pending: "bg-orange-50 text-orange-600 border-orange-200",
  failed:  "bg-gerror-50 text-gerror-600 border-gerror-200",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [status,   setStatus]   = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const LIMIT = 15;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(status && { status }),
      });
      const res  = await apiClient.get(`/payments/admin/all?${params}`);
      const data = res.data?.data;
      setPayments(data?.payments || data || []);
      setTotal(data?.total || 0);

      // Calculate revenue from successful payments
      const revenue = (data?.payments || data || [])
        .filter(p => p.status === "success")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (err) {
      setError("Failed to load payments: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Payments</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">
            {total} total · Revenue: ₦{totalRevenue.toLocaleString()}
          </p>
        </div>
        <button onClick={fetchPayments}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2">
          ↻ Refresh
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field w-48 text-sm">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {error && (
        <div className="bg-gerror-50 border border-gerror-200 text-gerror-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin"/>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">💳</p>
            <h3 className="font-display font-semibold text-navy-900 mb-2">No payments found</h3>
            <p className="font-sans text-gray-400 text-sm">
              {status ? "No payments match this filter." : "No payments have been made yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Reference","Customer","Amount","Method","Status","Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map(pay => (
                  <tr key={pay._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-navy-700 max-w-[180px] truncate">
                      {pay.reference}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-sans text-sm text-navy-900">
                        {pay.user?.firstName} {pay.user?.lastName}
                      </p>
                      <p className="font-sans text-xs text-gray-400">{pay.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm font-bold text-navy-900 whitespace-nowrap">
                      ₦{pay.amount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-500 capitalize">
                      {pay.paymentMethod || "Paystack"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[pay.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-400 whitespace-nowrap">
                      {new Date(pay.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-navy-300 transition-colors">← Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-navy-300 transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
