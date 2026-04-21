import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

function StatCard({ icon, label, value, sub, color = "navy", loading }) {
  const colors = {
    navy:  "bg-navy-50  text-navy-600  border-navy-100",
    gold:  "bg-gold-50  text-gold-600  border-gold-100",
    green: "bg-gsuccess-50 text-gsuccess-600 border-gsuccess-200",
    red:   "bg-gerror-50 text-gerror-600 border-gerror-200",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border text-lg ${colors[color]}`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-gray-100 rounded animate-pulse mb-1" />
      ) : (
        <div className="font-display text-2xl font-bold text-navy-900">{value ?? "—"}</div>
      )}
      <p className="font-sans text-xs text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
      {sub && <p className="font-sans text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentClaims,   setRecentClaims]   = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get("/users/admin/stats"),
      apiClient.get("/policies/admin/stats"),
      apiClient.get("/claims/admin/stats"),
      apiClient.get("/payments/admin/stats"),
      apiClient.get("/claims/admin/all?limit=5"),
      apiClient.get("/payments/admin/all?limit=5"),
    ])
      .then(([u, p, c, pay, rc, rp]) => {
        setStats({
          users:    u.status === 'fulfilled' ? u.value.data.data : {},
          policies: p.status === 'fulfilled' ? p.value.data.data : { byStatus: [] },
          claims:   c.status === 'fulfilled' ? c.value.data.data : { byStatus: [], pendingReview: 0 },
          payments: pay.status === 'fulfilled' ? pay.value.data.data : { totals: {} },
        });
        setRecentClaims(rc.status === 'fulfilled' ? (rc.value.data.data || []) : []);
        setRecentPayments(rp.status === 'fulfilled' ? (rp.value.data.data || []) : []);

        // Log any failures for debugging
        [u, p, c, pay, rc, rp].forEach((r, i) => {
          if (r.status === 'rejected') {
            console.warn('Admin stat fetch failed for request', i, r.reason?.message);
          }
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = stats?.payments?.totals?.totalRevenue || 0;

  return (
    <div className="space-y-6">

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users"     value={stats?.users?.total}               sub={`${stats?.users?.newThisMonth || 0} new this month`}  color="navy"  loading={loading} />
        <StatCard icon="📄" label="Total Policies"  value={stats?.policies?.byStatus?.find(s => s._id === "active")?.count || 0} sub="Active policies"   color="gold"  loading={loading} />
        <StatCard icon="⚡" label="Open Claims"     value={stats?.claims?.pendingReview}       sub="Awaiting review"                                        color="red"   loading={loading} />
        <StatCard icon="💰" label="Total Revenue"   value={`₦${(totalRevenue/1000).toFixed(0)}K`} sub="Successful payments"                              color="green" loading={loading} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="⏳" label="KYC Pending"     value={stats?.users?.kycPending}    sub="Awaiting verification"  color="gold"  loading={loading} />
        <StatCard icon="🔄" label="Pending Payment" value={stats?.policies?.byStatus?.find(s => s._id === "pending_payment")?.count || 0} sub="Awaiting payment" color="navy" loading={loading} />
        <StatCard icon="✅" label="Claims Approved"  value={stats?.claims?.byStatus?.find(s => s._id === "approved")?.count || 0} sub="This period"        color="green" loading={loading} />
        <StatCard icon="🤝" label="Agents"           value={stats?.users?.agents}        sub="Active brokers"         color="navy"  loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Claims */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-display font-semibold text-navy-900">Recent Claims</h3>
            <Link to="/admin/claims" className="font-sans text-xs text-gold-600 hover:text-gold-700 font-semibold">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : recentClaims.length === 0 ? (
            <div className="p-6 text-center text-gray-400 font-sans text-sm">No claims yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentClaims.map((c) => (
                <div key={c._id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-sans text-sm font-semibold text-navy-900">{c.claimNumber}</p>
                    <p className="font-sans text-xs text-gray-400">{c.user?.firstName} {c.user?.lastName} · {c.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-semibold text-navy-900">₦{c.claimedAmount?.toLocaleString()}</p>
                    <StatusPill status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-display font-semibold text-navy-900">Recent Payments</h3>
            <Link to="/admin/payments" className="font-sans text-xs text-gold-600 hover:text-gold-700 font-semibold">View all →</Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-400 font-sans text-sm">No payments yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPayments.map((p) => (
                <div key={p._id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-semibold text-navy-900">{p.reference?.slice(0,22)}...</p>
                    <p className="font-sans text-xs text-gray-400">{p.user?.firstName} {p.user?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-semibold text-navy-900">₦{p.amount?.toLocaleString()}</p>
                    <StatusPill status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "⚡", label: "Review Claims",   to: "/admin/claims?status=submitted",    color: "bg-gerror-50  border-gerror-100  hover:border-gerror-300"  },
            { icon: "🪪", label: "Verify KYC",      to: "/admin/kyc",                         color: "bg-gold-50   border-gold-100    hover:border-gold-400"    },
            { icon: "👥", label: "Manage Users",    to: "/admin/users",                       color: "bg-navy-50   border-navy-100    hover:border-navy-300"    },
            { icon: "📄", label: "All Policies",    to: "/admin/policies",                    color: "bg-gsuccess-50 border-gsuccess-200 hover:border-gsuccess-400" },
          ].map((a) => (
            <Link key={a.label} to={a.to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${a.color}`}>
              <span className="text-2xl">{a.icon}</span>
              <span className="font-sans text-xs font-semibold text-navy-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active:       "bg-gsuccess-50 text-gsuccess-600",
    pending:      "bg-gold-50 text-gold-600",
    pending_payment: "bg-gold-50 text-gold-600",
    submitted:    "bg-blue-50 text-blue-600",
    under_review: "bg-blue-50 text-blue-600",
    approved:     "bg-gsuccess-50 text-gsuccess-600",
    rejected:     "bg-gerror-50 text-gerror-600",
    success:      "bg-gsuccess-50 text-gsuccess-600",
    failed:       "bg-gerror-50 text-gerror-600",
    cancelled:    "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize mt-0.5 ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}
