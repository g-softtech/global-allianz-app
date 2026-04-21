import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const STATUSES = ["", "submitted", "under_review", "assessment", "approved", "rejected", "paid", "closed"];

const STATUS_CONFIG = {
  submitted:    { label: "Submitted",    classes: "bg-blue-50 text-blue-600 border-blue-200" },
  under_review: { label: "Under Review", classes: "bg-gold-50 text-gold-600 border-gold-200" },
  assessment:   { label: "Assessment",   classes: "bg-purple-50 text-purple-600 border-purple-200" },
  approved:     { label: "Approved",     classes: "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200" },
  rejected:     { label: "Rejected",     classes: "bg-gerror-50 text-gerror-600 border-gerror-200" },
  paid:         { label: "Paid",         classes: "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200" },
  closed:       { label: "Closed",       classes: "bg-gray-100 text-gray-500 border-gray-200" },
};

export default function AdminClaims() {
  const [claims,  setClaims]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [msg,      setMsg]      = useState("");

  const fetchClaims = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.append("status", status);
    apiClient.get(`/claims/admin/all?${params}`)
      .then((res) => {
        setClaims(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const handleUpdateClaim = async (claimId, updates) => {
    setUpdating(true);
    try {
      await apiClient.put(`/claims/${claimId}`, updates);
      setMsg("Claim updated successfully");
      setSelected(null);
      fetchClaims();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update claim");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      {msg && (
        <div className="bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-700 px-5 py-3 rounded-xl font-sans text-sm">{msg}</div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-48">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
          ))}
        </select>
        <span className="font-sans text-sm text-gray-500 self-center">{total} claims</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-sans text-sm">No claims found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Claim #", "Customer", "Type", "Claimed", "Status", "Submitted", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">{c.claimNumber}</td>
                    <td className="px-4 py-3 font-sans text-sm text-navy-900">{c.user?.firstName} {c.user?.lastName}</td>
                    <td className="px-4 py-3 font-sans text-sm text-gray-600 capitalize">{c.type}</td>
                    <td className="px-4 py-3 font-sans text-sm font-semibold text-navy-900">₦{c.claimedAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[c.status]?.classes || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {STATUS_CONFIG[c.status]?.label || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-400">
                      {new Date(c.submittedAt).toLocaleDateString("en-NG", { day:"numeric", month:"short" })}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(c)} className="font-sans text-xs text-gold-600 hover:text-gold-700 font-semibold">
                        Review →
                      </button>
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

      {selected && (
        <ClaimModal claim={selected} updating={updating} onClose={() => setSelected(null)} onUpdate={handleUpdateClaim} />
      )}
    </div>
  );
}

function ClaimModal({ claim, updating, onClose, onUpdate }) {
  const [newStatus,      setNewStatus]      = useState(claim.status);
  const [approvedAmount, setApprovedAmount] = useState(claim.approvedAmount || claim.claimedAmount);
  const [adminNotes,     setAdminNotes]     = useState(claim.adminNotes || "");
  const [rejectionReason,setRejectionReason]= useState(claim.rejectionReason || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="bg-navy-gradient px-6 py-4 flex items-center justify-between sticky top-0">
          <div>
            <h3 className="font-display font-semibold text-white">{claim.claimNumber}</h3>
            <p className="font-sans text-gold-400 text-xs">{claim.user?.firstName} {claim.user?.lastName} · {claim.type}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Claim details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Policy",       value: claim.policy?.policyNumber || "—" },
              { label: "Incident Date",value: claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString("en-NG") : "—" },
              { label: "Claimed",      value: `₦${claim.claimedAmount?.toLocaleString()}` },
              { label: "Submitted",    value: new Date(claim.submittedAt).toLocaleDateString("en-NG") },
            ].map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{r.label}</p>
                <p className="font-sans text-sm font-semibold text-navy-900 mt-0.5">{r.value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
            <p className="font-sans text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{claim.description}</p>
          </div>

          {/* Timeline */}
          {claim.timeline?.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Timeline</p>
              <div className="space-y-2">
                {claim.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-sans font-semibold text-navy-900 capitalize">{t.status?.replace("_"," ")}</span>
                      <span className="font-sans text-gray-400 text-xs ml-2">{new Date(t.date).toLocaleDateString("en-NG")}</span>
                      <p className="font-sans text-xs text-gray-500 mt-0.5">{t.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update form */}
          <div className="border-t border-gray-100 pt-5 space-y-4">
            <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">Update Claim</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
                  {STATUSES.filter(Boolean).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                  ))}
                </select>
              </div>
              {["approved", "paid"].includes(newStatus) && (
                <div className="form-group">
                  <label className="form-label">Approved Amount (₦)</label>
                  <input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="input-field" />
                </div>
              )}
            </div>

            {newStatus === "rejected" && (
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2} className="input-field resize-none" placeholder="Explain why the claim is being rejected..." />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Admin Notes (internal)</label>
              <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                rows={2} className="input-field resize-none" placeholder="Internal notes visible only to admins..." />
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="btn border-2 border-gray-200 text-gray-600 text-sm px-5">Cancel</button>
              <button
                onClick={() => onUpdate(claim._id, { status: newStatus, approvedAmount, adminNotes, rejectionReason })}
                disabled={updating}
                className="btn btn-primary text-sm px-6"
              >
                {updating ? "Updating..." : "Update Claim"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
