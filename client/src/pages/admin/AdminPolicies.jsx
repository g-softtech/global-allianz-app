import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const STATUS_COLORS = {
  active:          "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
  pending:         "bg-orange-50 text-orange-600 border-orange-200",
  pending_payment: "bg-yellow-50 text-yellow-600 border-yellow-200",
  expired:         "bg-gray-100 text-gray-500 border-gray-200",
  cancelled:       "bg-gerror-50 text-gerror-600 border-gerror-200",
  draft:           "bg-gray-100 text-gray-500 border-gray-200",
};

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [type,     setType]     = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const LIMIT = 15;

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(search && { search }),
        ...(status && { status }),
        ...(type   && { type   }),
      });
      const res  = await apiClient.get(`/policies/admin/all?${params}`);
      const data = res.data?.data;
      setPolicies(data?.policies || data || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError("Failed to load policies: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, [page, search, status, type]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleStatusChange = async (policyId, newStatus) => {
    try {
      await apiClient.put(`/policies/${policyId}`, { status: newStatus });
      setPolicies(p => p.map(pol => pol._id === policyId ? { ...pol, status: newStatus } : pol));
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Policies</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{total} total policies</p>
        </div>
        <button onClick={fetchPolicies}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2">
          ↻ Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by policy number..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field flex-1 min-w-[200px] text-sm"/>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field w-44 text-sm">
          <option value="">All Statuses</option>
          {["active","pending","pending_payment","expired","cancelled"].map(s =>
            <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
          )}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="input-field w-44 text-sm">
          <option value="">All Types</option>
          {["motor","health","life","travel","property","business","corporate"].map(t =>
            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
          )}
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
        ) : policies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📄</p>
            <h3 className="font-display font-semibold text-navy-900 mb-2">No policies found</h3>
            <p className="font-sans text-gray-400 text-sm">
              {search || status || type ? "Try adjusting your filters." : "No policies have been created yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Policy #","Type","Customer","Premium","Status","Start Date","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {policies.map(pol => (
                  <tr key={pol._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-navy-700 whitespace-nowrap">
                      {pol.policyNumber || "—"}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm capitalize text-navy-900">
                      {pol.type}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-sans text-sm text-navy-900">
                        {pol.user?.firstName} {pol.user?.lastName}
                      </p>
                      <p className="font-sans text-xs text-gray-400">{pol.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm font-semibold text-navy-900 whitespace-nowrap">
                      ₦{pol.premium?.amount?.toLocaleString()}/yr
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[pol.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {pol.status?.replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-400 whitespace-nowrap">
                      {pol.startDate ? new Date(pol.startDate).toLocaleDateString("en-NG") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {pol.status !== "active" && (
                          <button onClick={() => handleStatusChange(pol._id, "active")}
                            className="font-sans text-xs text-gsuccess-600 bg-gsuccess-50 hover:bg-gsuccess-100 px-3 py-1.5 rounded-lg transition-colors">
                            Activate
                          </button>
                        )}
                        {pol.status === "active" && (
                          <button onClick={() => handleStatusChange(pol._id, "cancelled")}
                            className="font-sans text-xs text-gerror-600 bg-gerror-50 hover:bg-gerror-100 px-3 py-1.5 rounded-lg transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-navy-300 transition-colors">
                ← Prev
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:border-navy-300 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
