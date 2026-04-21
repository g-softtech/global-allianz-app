import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

export default function AdminKYC() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ text: "", type: "" });

  const fetchPending = useCallback(() => {
    setLoading(true);
    // Fetch users who have submitted docs but are not yet verified
    apiClient.get(`/users?limit=15&page=${page}`)
      .then((res) => {
        const pending = (res.data.data || []).filter(
          u => !u.kycVerified && u.kycDocuments?.length > 0
        );
        setUsers(pending);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleKYC = async (userId, approved) => {
    setSaving(true);
    try {
      await apiClient.put(`/users/${userId}/kyc`, { approved });
      setMsg({ text: `KYC ${approved ? "approved ✓" : "rejected ✗"} successfully`, type: approved ? "success" : "error" });
      fetchPending();
      setTimeout(() => setMsg({ text: "", type: "" }), 4000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to update KYC", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-gold-50 border border-gold-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p className="font-sans font-semibold text-gold-800 text-sm">KYC Review Guidelines</p>
          <p className="font-sans text-gold-700 text-xs mt-1 leading-relaxed">
            Verify that documents are clear, unedited, and match the user's profile information.
            Check that ID cards are not expired. Utility bills must not be older than 3 months.
            When in doubt, reject and ask the user to resubmit.
          </p>
        </div>
      </div>

      {msg.text && (
        <div className={`px-5 py-3 rounded-xl font-sans text-sm border ${
          msg.type === "success"
            ? "bg-gsuccess-50 border-gsuccess-200 text-gsuccess-700"
            : "bg-gerror-50 border-gerror-200 text-gerror-700"
        }`}>{msg.text}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-display font-semibold text-navy-900 text-lg mb-2">All Clear!</h3>
          <p className="font-sans text-gray-400 text-sm">No pending KYC submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div key={u._id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              {/* User header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy-gradient rounded-full flex items-center justify-center text-white font-bold">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-navy-900">{u.firstName} {u.lastName}</p>
                    <p className="font-sans text-sm text-gray-500">{u.email} · {u.phone}</p>
                    {u.dateOfBirth && (
                      <p className="font-sans text-xs text-gray-400">DOB: {new Date(u.dateOfBirth).toLocaleDateString("en-NG")}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleKYC(u._id, true)}
                    disabled={saving}
                    className="btn bg-gsuccess-600 text-white hover:bg-green-700 text-sm px-5 py-2"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleKYC(u._id, false)}
                    disabled={saving}
                    className="btn bg-gerror-600 text-white hover:bg-red-700 text-sm px-5 py-2"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              {/* Documents */}
              <div className="px-6 py-4">
                <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Submitted Documents ({u.kycDocuments.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {u.kycDocuments.map((doc, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                      <span className="text-2xl">
                        {doc.type === "id_card" ? "🪪" : doc.type === "passport" ? "📘" : doc.type === "utility_bill" ? "🧾" : "🏦"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-navy-900 text-sm capitalize">{doc.type?.replace("_"," ")}</p>
                        <p className="font-sans text-xs text-gray-400 truncate">{doc.fileName || "Uploaded"}</p>
                        {doc.fileSize && (
                          <p className="font-sans text-xs text-gray-400">{Math.round(doc.fileSize/1024)}KB · {doc.mimeType?.split("/")[1]?.toUpperCase()}</p>
                        )}
                        <p className="font-sans text-xs text-gray-400">
                          Submitted: {new Date(doc.uploadedAt).toLocaleDateString("en-NG")}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        doc.verified ? "bg-gsuccess-50 text-gsuccess-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {doc.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
