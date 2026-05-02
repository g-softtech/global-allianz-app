import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

function StatCard({ icon, label, value, sub, color = "navy", loading }) {
  const colors = {
    navy:   "bg-navy-50 text-navy-600",
    gold:   "bg-gold-50 text-gold-600",
    green:  "bg-gsuccess-50 text-gsuccess-600",
    red:    "bg-gerror-50 text-gerror-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${colors[color] || colors.navy}`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mb-1" />
      ) : (
        <div className="font-display text-2xl font-bold text-navy-900 mb-0.5">{value ?? 0}</div>
      )}
      <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-sans text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading,        setLoading]        = useState(true);
  const [recentClaims,   setRecentClaims]   = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  // Store raw counts directly — simpler and more reliable
  const [counts, setCounts] = useState({
    totalUsers:      0,
    newUsers:        0,
    kycPending:      0,
    totalPolicies:   0,
    openClaims:      0,
    approvedClaims:  0,
    totalRevenue:    0,
    pendingPayments: 0,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch everything in parallel — use allSettled so one failure doesn't block others
      const [usersRes, policiesRes, claimsListRes, paymentsListRes] = await Promise.allSettled([
        apiClient.get("/users/admin/all?limit=200"),
        apiClient.get("/policies/admin/all?limit=200"),
        apiClient.get("/claims/admin/all?limit=10"),
        apiClient.get("/payments/admin/all?limit=10"),
      ]);

      // ── Users ─────────────────────────────────────────────
      let totalUsers = 0, newUsers = 0, kycPending = 0;
      if (usersRes.status === "fulfilled") {
        const users = usersRes.value?.data?.data?.users || [];
        const now   = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        totalUsers = users.filter(u => u.role !== "admin").length;
        newUsers   = users.filter(u => u.role !== "admin" && new Date(u.createdAt) >= monthStart).length;
        kycPending = users.filter(u => !u.kycVerified && u.kycDocuments?.length > 0).length;
      }

      // ── Policies ──────────────────────────────────────────
      let totalPolicies = 0;
      if (policiesRes.status === "fulfilled") {
        const pols = policiesRes.value?.data?.data;
        totalPolicies = pols?.total
          ?? pols?.policies?.length
          ?? (Array.isArray(pols) ? pols.length : 0);
      }

      // ── Claims ────────────────────────────────────────────
      let openClaims = 0, approvedClaims = 0, claimsArr = [];
      if (claimsListRes.status === "fulfilled") {
        const d = claimsListRes.value?.data?.data;
        claimsArr     = d?.claims || (Array.isArray(d) ? d : []);
        // For open claims, fetch with status filter
        try {
          const openRes = await apiClient.get("/claims/admin/all?limit=200&status=submitted");
          const openD   = openRes.data?.data;
          openClaims    = openD?.total ?? openD?.claims?.length ?? (Array.isArray(openD) ? openD.length : 0);
        } catch { openClaims = 0; }
        try {
          const appRes = await apiClient.get("/claims/admin/all?limit=200&status=approved");
          const appD   = appRes.data?.data;
          approvedClaims = appD?.total ?? appD?.claims?.length ?? 0;
        } catch { approvedClaims = 0; }
        setRecentClaims(claimsArr.slice(0, 5));
      }

      // ── Payments ──────────────────────────────────────────
      let totalRevenue = 0, pendingPayments = 0, paymentsArr = [];
      if (paymentsListRes.status === "fulfilled") {
        const d = paymentsListRes.value?.data?.data;
        paymentsArr = d?.payments || (Array.isArray(d) ? d : []);
        setRecentPayments(paymentsArr.slice(0, 5));

        // Calculate revenue from all successful payments
        try {
          const allPayRes = await apiClient.get("/payments/admin/all?limit=500&status=success");
          const allPayD   = allPayRes.data?.data;
          const allPays   = allPayD?.payments || (Array.isArray(allPayD) ? allPayD : []);
          totalRevenue    = allPays.reduce((sum, p) => sum + (p.amount || 0), 0);
        } catch {
          totalRevenue = paymentsArr.filter(p => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);
        }

        try {
          const pendRes = await apiClient.get("/payments/admin/all?limit=200&status=pending");
          const pendD   = pendRes.data?.data;
          pendingPayments = pendD?.total ?? pendD?.payments?.length ?? 0;
        } catch { pendingPayments = 0; }
      }

      setCounts({ totalUsers, newUsers, kycPending, totalPolicies, openClaims, approvedClaims, totalRevenue, pendingPayments });

    } catch (err) {
      console.error("[AdminDashboard] fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { totalUsers, newUsers, kycPending, totalPolicies, openClaims, approvedClaims, totalRevenue, pendingPayments } = counts;

  const STAT_CARDS = [
    { icon: "👥", label: "Total Users",     value: totalUsers,                              sub: `${newUsers} new this month`,  color: "navy"   },
    { icon: "📄", label: "Total Policies",  value: totalPolicies,                           sub: "All policies",                color: "gold"   },
    { icon: "⚡", label: "Open Claims",     value: openClaims,                              sub: "Awaiting review",             color: "red"    },
    { icon: "💰", label: "Total Revenue",   value: `₦${(totalRevenue/1000).toFixed(0)}K`,   sub: "Successful payments",         color: "green"  },
    { icon: "⏳", label: "KYC Pending",     value: kycPending,                              sub: "Awaiting verification",       color: "orange" },
    { icon: "🔄", label: "Pending Payment", value: pendingPayments,                         sub: "Awaiting payment",            color: "purple" },
    { icon: "✅", label: "Claims Approved", value: approvedClaims,                          sub: "This period",                 color: "green"  },
    { icon: "🤝", label: "Agents",          value: 0,                                       sub: "Active brokers",              color: "gold"   },
  ];

  const QUICK_ACTIONS = [
    { icon: "⚡", label: "Review Claims",  to: "/admin/claims",   color: "bg-gerror-50",  textColor: "text-gerror-600",  badge: openClaims    },
    { icon: "🪪", label: "Verify KYC",     to: "/admin/kyc",      color: "bg-orange-50",  textColor: "text-orange-600",  badge: kycPending    },
    { icon: "👥", label: "Manage Users",   to: "/admin/users",    color: "bg-navy-50",    textColor: "text-navy-600",    badge: totalUsers    },
    { icon: "📄", label: "All Policies",   to: "/admin/policies", color: "bg-gold-50",    textColor: "text-gold-600",    badge: totalPolicies },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{today}</p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2 disabled:opacity-50">
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} loading={loading} />
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Claims */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-navy-900">Recent Claims</h3>
            <Link to="/admin/claims" className="font-sans text-xs text-gold-600 hover:text-gold-700 font-medium">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}
            </div>
          ) : recentClaims.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-8">No claims yet</p>
          ) : (
            <div className="space-y-3">
              {recentClaims.map((claim) => (
                <div key={claim._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-sans text-sm font-medium text-navy-900">{claim.claimNumber}</p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5 capitalize">
                      {claim.type} · {claim.user?.firstName} {claim.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-bold text-navy-900">₦{claim.claimedAmount?.toLocaleString()}</p>
                    <span className={`font-sans text-xs font-semibold capitalize ${
                      claim.status === "approved" ? "text-gsuccess-600" :
                      claim.status === "rejected" ? "text-gerror-600" : "text-orange-500"
                    }`}>{claim.status?.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-navy-900">Recent Payments</h3>
            <Link to="/admin/payments" className="font-sans text-xs text-gold-600 hover:text-gold-700 font-medium">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}
            </div>
          ) : recentPayments.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-8">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((pay) => (
                <div key={pay._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-sans text-sm font-medium text-navy-900 truncate max-w-[180px]">{pay.reference}</p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">{pay.user?.firstName} {pay.user?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-bold text-navy-900">₦{pay.amount?.toLocaleString()}</p>
                    <span className={`font-sans text-xs font-semibold ${
                      pay.status === "success" ? "text-gsuccess-600" :
                      pay.status === "failed"  ? "text-gerror-600"  : "text-orange-500"
                    }`}>{pay.status?.charAt(0).toUpperCase() + pay.status?.slice(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions with live badges */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={action.to}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2
                border-transparent hover:border-gold-200 hover:shadow-card transition-all
                duration-200 group ${action.color}`}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </span>
              <span className={`font-sans text-sm font-semibold text-center ${action.textColor}`}>
                {action.label}
              </span>
              {/* Badge — always render, show when count > 0 and not loading */}
              {!loading && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-gerror-600 text-white text-xs
                  font-bold min-w-[22px] h-[22px] px-1 rounded-full flex items-center
                  justify-center shadow-sm animate-pulse-soft">
                  {action.badge > 99 ? "99+" : action.badge}
                </span>
              )}
              {/* Show loading skeleton on badge */}
              {loading && (
                <span className="absolute -top-2 -right-2 bg-gray-200 w-[22px] h-[22px]
                  rounded-full animate-pulse"/>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
