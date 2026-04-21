import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

const ROLES   = ["", "customer", "agent", "admin"];
const STATUS_CLASSES = {
  customer: "bg-navy-50 text-navy-600",
  agent:    "bg-gold-50 text-gold-600",
  admin:    "bg-gerror-50 text-gerror-600",
};

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [selected, setSelected] = useState(null); // user detail modal
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.append("search", search);
    if (role)   params.append("role",   role);

    apiClient.get(`/users?${params}`)
      .then((res) => {
        setUsers(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdateUser = async (userId, updates) => {
    setSaving(true);
    try {
      await apiClient.put(`/users/${userId}`, updates);
      setMsg("User updated successfully");
      setSelected(null);
      fetchUsers();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveKYC = async (userId, approved) => {
    setSaving(true);
    try {
      await apiClient.put(`/users/${userId}/kyc`, { approved });
      setMsg(`KYC ${approved ? "approved" : "rejected"} successfully`);
      setSelected(null);
      fetchUsers();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Failed to update KYC");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {msg && (
        <div className="bg-gsuccess-50 border border-gsuccess-200 text-gsuccess-700 px-5 py-3 rounded-xl font-sans text-sm">
          {msg}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field flex-1"
          />
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input-field sm:w-40">
            <option value="">All Roles</option>
            {ROLES.filter(Boolean).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <div className="flex items-center gap-2 font-sans text-sm text-gray-500 flex-shrink-0">
            <span>{total} users</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-sans text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Name", "Email", "Phone", "Role", "KYC", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-navy-gradient rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-sans text-sm font-semibold text-navy-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-sans text-sm text-gray-600">{u.email}</td>
                    <td className="px-5 py-3 font-sans text-sm text-gray-600">{u.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_CLASSES[u.role] || "bg-gray-100 text-gray-500"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.kycVerified ? "bg-gsuccess-50 text-gsuccess-600" : "bg-orange-50 text-orange-600"}`}>
                        {u.kycVerified ? "✓ Verified" : "⏳ Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-sans text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(u)}
                        className="font-sans text-xs text-gold-600 hover:text-gold-700 font-semibold">
                        Manage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="font-sans text-sm text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                className="btn border-2 border-gray-200 text-gray-600 text-sm px-3 py-1.5 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selected && (
        <UserModal
          user={selected}
          saving={saving}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdateUser}
          onKYC={handleApproveKYC}
        />
      )}
    </div>
  );
}

function UserModal({ user, saving, onClose, onUpdate, onKYC }) {
  const [role,     setRole]     = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-lg overflow-hidden">
        <div className="bg-navy-gradient px-6 py-4 flex items-center justify-between">
          <h3 className="font-display font-semibold text-white">Manage User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-navy-gradient rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div>
              <h4 className="font-display font-semibold text-navy-900">{user.firstName} {user.lastName}</h4>
              <p className="font-sans text-sm text-gray-500">{user.email}</p>
              <p className="font-sans text-xs text-gray-400">{user.phone}</p>
            </div>
          </div>

          {/* KYC documents */}
          {user.kycDocuments?.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted Documents</p>
              <div className="space-y-2">
                {user.kycDocuments.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="font-sans text-sm font-semibold text-navy-900 capitalize">{doc.type?.replace("_", " ")}</p>
                      <p className="font-sans text-xs text-gray-400">{doc.fileName || "Uploaded"} · {doc.fileSize ? `${Math.round(doc.fileSize/1024)}KB` : ""}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doc.verified ? "bg-gsuccess-50 text-gsuccess-600" : "bg-orange-50 text-orange-600"}`}>
                      {doc.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role & status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                <option value="customer">Customer</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Deactivated</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {!user.kycVerified && user.kycDocuments?.length > 0 && (
              <>
                <button onClick={() => onKYC(user._id, true)} disabled={saving}
                  className="btn bg-gsuccess-600 text-white hover:bg-green-700 text-sm px-4 py-2 flex-1">
                  ✓ Approve KYC
                </button>
                <button onClick={() => onKYC(user._id, false)} disabled={saving}
                  className="btn bg-gerror-600 text-white hover:bg-red-700 text-sm px-4 py-2 flex-1">
                  ✗ Reject KYC
                </button>
              </>
            )}
            {user.kycVerified && (
              <button onClick={() => onKYC(user._id, false)} disabled={saving}
                className="btn border-2 border-gerror-200 text-gerror-600 hover:bg-gerror-50 text-sm px-4 py-2">
                Revoke KYC
              </button>
            )}
            <button
              onClick={() => onUpdate(user._id, { role, isActive })}
              disabled={saving}
              className="btn btn-primary text-sm px-6 py-2 ml-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
