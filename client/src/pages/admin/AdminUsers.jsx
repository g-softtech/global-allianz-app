import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";

const ROLES = ["customer", "agent", "admin"];

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [updating,   setUpdating]   = useState(false);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT,
        ...(search     && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res  = await apiClient.get(`/users/admin/all?${params}`);
      // API returns { success, data: { users: [], total: 0 } }
      const data = res.data?.data;
      setUsers(data?.users || []);
      setTotal(data?.total || 0);
    } catch (err) {
      setError("Failed to load users: " + (err.response?.data?.message || err.message));
      console.error("AdminUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(true);
    try {
      await apiClient.put(`/users/${userId}`, { role: newRole });
      setUsers(u => u.map(user => user._id === userId ? { ...user, role: newRole } : user));
      if (selected?._id === userId) setSelected(s => ({ ...s, role: newRole }));
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(false); }
  };

  const handleToggleActive = async (userId, isActive) => {
    setUpdating(true);
    try {
      await apiClient.put(`/users/${userId}`, { isActive: !isActive });
      setUsers(u => u.map(user => user._id === userId ? { ...user, isActive: !isActive } : user));
      if (selected?._id === userId) setSelected(s => ({ ...s, isActive: !isActive }));
    } catch (err) {
      alert("Failed to update user: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(false); }
  };

  const handleApproveKYC = async (userId) => {
    setUpdating(true);
    try {
      await apiClient.put(`/users/${userId}/kyc`, { kycVerified: true });
      setUsers(u => u.map(user => user._id === userId ? { ...user, kycVerified: true } : user));
      if (selected?._id === userId) setSelected(s => ({ ...s, kycVerified: true }));
    } catch (err) {
      alert("Failed to approve KYC: " + (err.response?.data?.message || err.message));
    } finally { setUpdating(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const kycColor = (u) => u.kycVerified ? "text-gsuccess-600" : u.kycDocuments?.length > 0 ? "text-orange-500" : "text-gerror-500";
  const kycLabel = (u) => u.kycVerified ? "✓ Verified" : u.kycDocuments?.length > 0 ? "⏳ Pending" : "Not submitted";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Users</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{total} total registered users</p>
        </div>
        <button onClick={fetchUsers}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2">
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field flex-1 text-sm"
        />
        <select value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field w-full sm:w-44 text-sm">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {error && (
        <div className="bg-gerror-50 border border-gerror-200 text-gerror-700 px-4 py-3 rounded-xl text-sm font-sans">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">👥</p>
            <h3 className="font-display font-semibold text-navy-900 mb-2">No users found</h3>
            <p className="font-sans text-gray-400 text-sm">
              {search || roleFilter ? "No users match your filters." : "No users have registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["User", "Phone", "Role", "KYC", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-gradient rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-sans font-medium text-navy-900 text-sm whitespace-nowrap">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="font-sans text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-500 whitespace-nowrap">
                      {u.phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <select value={u.role} disabled={updating}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="font-sans text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-gold-500 transition-colors">
                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-xs font-semibold ${kycColor(u)}`}>
                        {kycLabel(u)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-sans text-xs font-semibold ${u.isActive ? "text-gsuccess-600" : "text-gerror-600"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-sans text-xs text-gray-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setSelected(selected?._id === u._id ? null : u)}
                          className="font-sans text-xs font-medium text-navy-600 hover:text-navy-900 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          {selected?._id === u._id ? "Close" : "View"}
                        </button>
                        {!u.kycVerified && u.kycDocuments?.length > 0 && (
                          <button onClick={() => handleApproveKYC(u._id)} disabled={updating}
                            className="font-sans text-xs font-medium text-gsuccess-600 hover:text-white hover:bg-gsuccess-600 bg-gsuccess-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                            Approve KYC
                          </button>
                        )}
                        <button onClick={() => handleToggleActive(u._id, u.isActive)} disabled={updating}
                          className={`font-sans text-xs font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                            u.isActive
                              ? "text-gerror-600 bg-gerror-50 hover:bg-gerror-100"
                              : "text-gsuccess-600 bg-gsuccess-50 hover:bg-gsuccess-100"
                          }`}>
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="font-sans text-xs text-gray-400">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} users
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:border-navy-300 disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <span className="font-sans text-xs px-3 py-1.5 text-gray-400">
                {page} / {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="font-sans text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:border-navy-300 disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-semibold text-navy-900">User Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-navy-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-navy-gradient rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {selected.firstName?.[0]}{selected.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-display font-bold text-navy-900 text-lg">
                    {selected.firstName} {selected.lastName}
                  </h4>
                  <p className="font-sans text-sm text-gray-400">{selected.email}</p>
                  <p className="font-sans text-sm text-gray-400">{selected.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Role",       value: selected.role },
                  { label: "Status",     value: selected.isActive ? "Active" : "Deactivated" },
                  { label: "KYC",        value: kycLabel(selected) },
                  { label: "NIN",        value: selected.nin || "Not provided" },
                  { label: "Joined",     value: new Date(selected.createdAt).toLocaleDateString("en-NG", { dateStyle: "long" }) },
                  { label: "Last Login", value: selected.lastLogin ? new Date(selected.lastLogin).toLocaleDateString("en-NG") : "Never" },
                ].map(row => (
                  <div key={row.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{row.label}</p>
                    <p className="font-sans font-semibold text-navy-900 text-sm mt-1 capitalize">{row.value}</p>
                  </div>
                ))}
              </div>

              {selected.kycDocuments?.length > 0 && (
                <div>
                  <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    KYC Documents ({selected.kycDocuments.length})
                  </p>
                  <div className="space-y-2">
                    {selected.kycDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 bg-navy-50 rounded-xl px-4 py-3">
                        <span className="text-lg">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-navy-900 capitalize">
                            {doc.type?.replace(/_/g, " ")}
                          </p>
                          <p className="font-sans text-xs text-gray-400">
                            {doc.fileName} · {Math.round((doc.fileSize || 0) / 1024)}KB
                          </p>
                        </div>
                        <span className={`font-sans text-xs font-semibold ${doc.verified ? "text-gsuccess-600" : "text-orange-500"}`}>
                          {doc.verified ? "✓" : "⏳"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!selected.kycVerified && (
                    <button onClick={() => handleApproveKYC(selected._id)} disabled={updating}
                      className="btn bg-gsuccess-600 text-white hover:bg-green-700 w-full justify-center mt-4 text-sm">
                      ✓ Approve KYC Verification
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
