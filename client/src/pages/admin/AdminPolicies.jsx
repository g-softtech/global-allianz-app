import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const STATUS_CLASSES = {
  active:          "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
  pending_payment: "bg-gold-50 text-gold-600 border-gold-200",
  draft:           "bg-gray-100 text-gray-500 border-gray-200",
  expired:         "bg-gray-100 text-gray-500 border-gray-200",
  cancelled:       "bg-gerror-50 text-gerror-600 border-gerror-200",
  suspended:       "bg-orange-50 text-orange-600 border-orange-200",
};

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [status,   setStatus]   = useState("");
  const [type,     setType]     = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");

  const fetchPolicies = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.append("status", status);
    if (type)   params.append("type",   type);
    apiClient.get(`/policies/admin/all?${params}`)
      .then((res) => {
        setPolicies(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, status, type]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const handleUpdate = async (policyId, updates) => {
    setSaving(true);
    try {
      await apiClient.put(`/policies/${policyId}`, updates);
      setMsg("Policy updated");
      setSelected(null);
      fetchPolicies();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {msg && (
        <div className="bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-700 px-5 py-3 rounded-xl font-sans text-sm">{msg}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-48">
          <option value="">All Statuses</option>
          {["active","pending_payment","draft","expired","cancelled","suspended"].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="input-field w-40">
          <option value="">All Types</option>
          {["motor","health","life","travel","property","business","corporate"].map(t => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
        <span className="font-sans text-sm text-gray-500 self-center">{total} policies</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-sans text-sm">No policies found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Policy #","Customer","Type","Premium","Status","Expiry","Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {policies.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-900">{p.policyNumber || "—"}</td>
                    <td className="px-4 py-3 font-sans text-sm text-navy-900">{p.user?.firstName} {p.user?.lastName}</td>
                    <td className="px-4 py-3 font-sans text-sm text-gray-600 capitalize">{p.type}</td>
                    <td className="px-4 py-3 font-sans text-sm font-semibold text-navy-900">₦{p.premium?.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_CLASSES[p.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {p.status?.replace("_"," ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-gray-400">
                      {p.endDate ? new Date(p.endDate).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(p)} className="font-sans text-xs text-gold-600 hover:text-gold-700 font-semibold">Edit →</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-md">
            <div className="bg-navy-gradient px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">{selected.policyNumber || "Policy"}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <PolicyEditForm policy={selected} saving={saving} onClose={() => setSelected(null)} onSave={handleUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}

function PolicyEditForm({ policy, saving, onClose, onSave }) {
  const [status,      setStatus]      = useState(policy.status);
  const [insurer,     setInsurer]     = useState(policy.insurerName || "");
  const [startDate,   setStartDate]   = useState(policy.startDate ? policy.startDate.slice(0,10) : "");
  const [endDate,     setEndDate]     = useState(policy.endDate   ? policy.endDate.slice(0,10)   : "");

  return (
    <div className="p-6 space-y-4">
      <div className="form-group">
        <label className="form-label">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
          {["draft","pending_payment","active","expired","cancelled","suspended"].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Insurer Name</label>
        <input value={insurer} onChange={(e) => setInsurer(e.target.value)} className="input-field" placeholder="e.g. AXA Mansard" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
        </div>
        <div className="form-group">
          <label className="form-label">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
        <button onClick={onClose} className="btn border-2 border-gray-200 text-gray-600 text-sm px-5">Cancel</button>
        <button
          onClick={() => onSave(policy._id, { status, insurerName: insurer, startDate, endDate })}
          disabled={saving} className="btn btn-primary text-sm px-6"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
