import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

const DOC_LABELS = {
  id_card:        "National ID Card",
  passport:       "International Passport",
  drivers_licence:"Driver's Licence",
  voters_card:    "Voter's Card",
  utility_bill:   "Utility Bill",
  bank_statement: "Bank Statement",
};

const DOC_ICONS = {
  id_card:"🪪", passport:"📘", drivers_licence:"🚗",
  voters_card:"🗳️", utility_bill:"🧾", bank_statement:"🏦",
};

// Force download by fetching blob — bypasses browser "preview instead of download" behaviour
const forceDownload = async (url, fileName) => {
  try {
    // For Cloudinary URLs, add fl_attachment to force download
    let downloadUrl = url;
    if (url.includes("cloudinary.com")) {
      // Insert fl_attachment into the Cloudinary transformation chain
      downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }

    const response = await fetch(downloadUrl);
    const blob     = await response.blob();
    const blobUrl  = window.URL.createObjectURL(blob);

    const link     = document.createElement("a");
    link.href      = blobUrl;
    link.download  = fileName || "document";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Fallback — open in new tab
    console.error("Download failed:", err);
    window.open(url, "_blank");
  }
};

function DocCard({ doc }) {
  const [downloading, setDownloading] = useState(false);
  const hasRealUrl = doc.url && doc.url !== "pending_upload" && doc.url.startsWith("http");
  const isPDF      = doc.mimeType === "application/pdf" || doc.fileName?.endsWith(".pdf");

  const handleDownload = async () => {
    setDownloading(true);
    await forceDownload(doc.url, doc.fileName);
    setDownloading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{DOC_ICONS[doc.type] || "📄"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-sans text-sm font-semibold text-navy-900">
            {DOC_LABELS[doc.type] || doc.type}
          </p>
          <p className="font-sans text-xs text-gray-400 truncate mt-0.5">
            {doc.fileName || "document"} · {Math.round((doc.fileSize || 0) / 1024)}KB
          </p>
          {doc.uploadedAt && (
            <p className="font-sans text-xs text-gray-400">
              {new Date(doc.uploadedAt).toLocaleDateString("en-NG")}
            </p>
          )}
        </div>
        <span className={`font-sans text-xs font-bold flex-shrink-0 ${
          doc.verified ? "text-gsuccess-600" : "text-orange-500"
        }`}>
          {doc.verified ? "✓ OK" : "⏳"}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        {hasRealUrl ? (
          <>
            {/* Preview — opens in new tab */}
            <button
              onClick={() => window.open(doc.url, "_blank")}
              className="flex-1 font-sans text-xs font-medium bg-navy-50 text-navy-700
                hover:bg-navy-100 px-3 py-2 rounded-lg transition-colors
                flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Preview
            </button>

            {/* Download — forces actual file download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 font-sans text-xs font-medium bg-gold-50 text-gold-700
                hover:bg-gold-100 px-3 py-2 rounded-lg transition-colors
                flex items-center justify-center gap-1.5 disabled:opacity-60">
              {downloading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download
                </>
              )}
            </button>
          </>
        ) : (
          <div className="flex-1 font-sans text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg text-center">
            ⚠️ Not uploaded to cloud — user must resubmit
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminKYC() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("pending");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res   = await apiClient.get("/users/admin/all?limit=500&page=1");
      const data  = res.data?.data;
      setAllUsers(data?.users || []);
    } catch (err) {
      console.error("AdminKYC fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = allUsers.filter(u => {
    if (filter === "pending")       return !u.kycVerified && u.kycDocuments?.length > 0;
    if (filter === "verified")      return u.kycVerified;
    if (filter === "not_submitted") return !u.kycVerified && (!u.kycDocuments || u.kycDocuments.length === 0);
    return true;
  });

  const pendingCount  = allUsers.filter(u => !u.kycVerified && u.kycDocuments?.length > 0).length;
  const verifiedCount = allUsers.filter(u => u.kycVerified).length;
  const notSubmitted  = allUsers.filter(u => !u.kycVerified && (!u.kycDocuments || u.kycDocuments.length === 0)).length;

  const handleApprove = async (userId) => {
    setUpdating(userId);
    try {
      await apiClient.put(`/users/${userId}/kyc`, { kycVerified: true });
      setAllUsers(prev => prev.map(u =>
        u._id === userId
          ? { ...u, kycVerified: true, kycDocuments: u.kycDocuments.map(d => ({ ...d, verified: true })) }
          : u
      ));
      setExpanded(null);
    } catch (err) {
      alert("Failed to approve: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(null); }
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Reject this KYC submission? The user will need to resubmit.")) return;
    setUpdating(userId);
    try {
      await apiClient.put(`/users/${userId}/kyc`, { kycVerified: false });
      setAllUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, kycVerified: false } : u
      ));
      if (expanded === userId) setExpanded(null);
    } catch (err) {
      alert("Failed to reject: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(null); }
  };

  const FILTER_TABS = [
    { id: "pending",       label: "Pending Review", count: pendingCount   },
    { id: "verified",      label: "Verified",        count: verifiedCount  },
    { id: "not_submitted", label: "Not Submitted",   count: notSubmitted   },
    { id: "all",           label: "All",             count: allUsers.length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">KYC Verification</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">
          Review and approve customer identity documents
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: pendingCount,    color: "text-orange-600 bg-orange-50 border-orange-100"          },
          { label: "Verified",       value: verifiedCount,   color: "text-gsuccess-600 bg-gsuccess-50 border-gsuccess-200"    },
          { label: "Not Submitted",  value: notSubmitted,    color: "text-gerror-600 bg-gerror-50 border-gerror-200"           },
          { label: "Total Users",    value: allUsers.length, color: "text-navy-600 bg-navy-50 border-navy-100"                 },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="font-display text-2xl font-bold">{loading ? "—" : s.value}</p>
            <p className="font-sans text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`font-sans text-sm px-4 py-2 rounded-xl border transition-all duration-200
              flex items-center gap-2 ${
              filter === f.id
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-navy-300"
            }`}>
            {f.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              filter === f.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {loading ? "…" : f.count}
            </span>
          </button>
        ))}
        <button onClick={fetchAll}
          className="font-sans text-sm px-4 py-2 rounded-xl border border-gray-200 bg-white
            text-gray-500 hover:border-navy-300 transition-colors ml-auto">
          ↻ Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <p className="text-4xl mb-3">{filter === "pending" ? "✅" : "📋"}</p>
          <h3 className="font-display font-semibold text-navy-900 mb-2">
            {filter === "pending" ? "No pending submissions" : "No users in this category"}
          </h3>
          <p className="font-sans text-sm text-gray-400">
            {filter === "pending"
              ? "All submitted documents have been reviewed."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <div key={user._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">

              {/* User row */}
              <div className="flex items-center gap-4 p-5 flex-wrap">
                <div className="w-10 h-10 bg-navy-gradient rounded-xl flex items-center
                  justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans font-semibold text-navy-900 text-sm">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="font-sans text-xs text-gray-400">
                    {user.email} · {user.phone}
                  </p>
                  {user.nin && (
                    <p className="font-sans text-xs text-navy-600 font-semibold mt-0.5">
                      NIN: {user.nin}
                    </p>
                  )}
                </div>

                <span className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-full
                  flex-shrink-0 ${
                  user.kycVerified
                    ? "bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200"
                    : user.kycDocuments?.length > 0
                      ? "bg-orange-50 text-orange-600 border border-orange-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}>
                  {user.kycVerified ? "✓ Verified"
                    : user.kycDocuments?.length > 0 ? "⏳ Pending"
                    : "Not Submitted"}
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.kycDocuments?.length > 0 && (
                    <button
                      onClick={() => setExpanded(expanded === user._id ? null : user._id)}
                      className="font-sans text-xs font-medium text-navy-600 bg-navy-50
                        hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors">
                      {expanded === user._id
                        ? "Hide"
                        : `View ${user.kycDocuments.length} doc(s)`}
                    </button>
                  )}
                  {!user.kycVerified && user.kycDocuments?.length > 0 && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id)}
                        disabled={updating === user._id}
                        className="font-sans text-xs font-semibold bg-gsuccess-600 text-white
                          hover:bg-green-700 px-4 py-1.5 rounded-lg transition-colors
                          disabled:opacity-50">
                        {updating === user._id ? "..." : "✓ Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        disabled={updating === user._id}
                        className="font-sans text-xs font-semibold bg-gerror-50 text-gerror-600
                          hover:bg-gerror-100 border border-gerror-200 px-4 py-1.5 rounded-lg
                          transition-colors disabled:opacity-50">
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Documents panel */}
              {expanded === user._id && user.kycDocuments?.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <p className="font-sans text-xs font-semibold text-gray-400 uppercase
                    tracking-wide mb-3">
                    Submitted Documents — Preview to verify, Download to save
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.kycDocuments.map((doc, i) => (
                      <DocCard key={i} doc={doc} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
