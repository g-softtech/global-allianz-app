import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const STATUS_FLOW  = ["submitted","under_review","assessment","approved","rejected","paid"];
const STATUS_COLORS = {
  submitted:    "bg-blue-50 text-blue-600 border-blue-200",
  under_review: "bg-orange-50 text-orange-600 border-orange-200",
  assessment:   "bg-purple-50 text-purple-600 border-purple-200",
  approved:     "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
  rejected:     "bg-gerror-50 text-gerror-600 border-gerror-200",
  paid:         "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
};

export default function AdminClaims() {
  const [claims,   setClaims]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [selected, setSelected] = useState(null);
  const [note,     setNote]     = useState("");
  const [updating, setUpdating] = useState(false);
  const LIMIT = 15;

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(search && { search }),
        ...(status && { status }),
      });
      const res  = await apiClient.get(`/claims/admin/all?${params}`);
      const data = res.data?.data;
      setClaims(data?.claims || data || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError("Failed to load claims: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleStatusUpdate = async (claimId, newStatus) => {
    setUpdating(true);
    try {
      await apiClient.put(`/claims/${claimId}`, { status: newStatus, adminNote: note });
      setClaims(c => c.map(cl => cl._id === claimId ? { ...cl, status: newStatus } : cl));
      if (selected?._id === claimId) setSelected(s => ({ ...s, status: newStatus }));
      setNote("");
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Claims</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{total} total claims</p>
        </div>
        <button onClick={fetchClaims}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2">
          ↻ Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search by claim number or customer..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field flex-1 min-w-[200px] text-sm"/>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-field w-52 text-sm">
          <option value="">All Statuses</option>
          {STATUS_FLOW.map(s => (
            <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>
          ))}
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
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">⚡</p>
            <h3 className="font-display font-semibold text-navy-900 mb-2">No claims found</h3>
            <p className="font-sans text-gray-400 text-sm">
              {search || status ? "Try adjusting your filters." : "No claims have been filed yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Claim #","Type","Customer","Amount","Status","Date","Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map(claim => (
                  <tr key={claim._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-navy-700 whitespace-nowrap">
                      {claim.claimNumber}
                    </td>
                    <td className="px-5 py-4 font-sans text-sm capitalize text-navy-900">
                      {claim.type}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-sans text-sm text-navy-900">
                        {claim.user?.firstName} {claim.user?.lastName}
                      </p>
                      <p className="font-sans text-xs text-gray-400">{claim.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 font-sans text-sm font-bold text-navy-900 whitespace-nowrap">
                      ₦{claim.claimedAmount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[claim.status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        {claim.status?.replace(/_/g," ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-400 whitespace-nowrap">
                      {new Date(claim.createdAt).toLocaleDateString("en-NG")}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => { setSelected(selected?._id === claim._id ? null : claim); setNote(""); }}
                        className="font-sans text-xs font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors">
                        {selected?._id === claim._id ? "Close" : "Manage"}
                      </button>
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

      {/* Claim Management Panel */}
      {selected && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Managing: {selected.claimNumber}
              </h3>
              <p className="font-sans text-sm text-gray-400 mt-1">
                {selected.user?.firstName} {selected.user?.lastName} · ₦{selected.claimedAmount?.toLocaleString()}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-navy-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          {selected.description && (
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Customer Description
              </p>
              <p className="font-sans text-sm text-navy-700 leading-relaxed">{selected.description}</p>
            </div>
          )}

          {/* Admin note */}
          <div className="form-group mb-5">
            <label className="form-label">Admin Note (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="input-field resize-none text-sm"
              placeholder="Add a note about this status change..."/>
          </div>

          {/* Status buttons */}
          <div>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Update Status — Current: <span className="text-navy-900 capitalize">{selected.status?.replace(/_/g," ")}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.filter(s => s !== selected.status).map(s => (
                <button key={s} disabled={updating} onClick={() => handleStatusUpdate(selected._id, s)}
                  className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${STATUS_COLORS[s] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  → {s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
