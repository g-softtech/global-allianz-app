import { useState, useEffect } from "react";
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
        <div className="font-display text-2xl font-bold text-navy-900 mb-0.5">{value ?? "—"}</div>
      )}
      <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-sans text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [userStats,    setUserStats]    = useState(null);
  const [policyStats,  setPolicyStats]  = useState(null);
  const [claimStats,   setClaimStats]   = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [recentClaims,   setRecentClaims]   = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [u, p, c, pay, rc, rp] = await Promise.allSettled([
        apiClient.get("/users/admin/stats"),
        apiClient.get("/policies/admin/stats"),
        apiClient.get("/claims/admin/stats"),
        apiClient.get("/payments/admin/stats"),
        apiClient.get("/claims/admin/all?limit=5"),
        apiClient.get("/payments/admin/all?limit=5"),
      ]);

      // Safe data extraction — handles any response shape
      const safeData = (r) => r.status === "fulfilled" ? r.value?.data?.data : null;

      setUserStats(safeData(u));
      setPolicyStats(safeData(p));
      setClaimStats(safeData(c));
      setPaymentStats(safeData(pay));

      // Recent claims — try multiple data shapes
      if (rc.status === "fulfilled") {
        const d = rc.value?.data?.data;
        setRecentClaims(d?.claims || (Array.isArray(d) ? d : []) || []);
      }

      // Recent payments — try multiple data shapes
      if (rp.status === "fulfilled") {
        const d = rp.value?.data?.data;
        setRecentPayments(d?.payments || (Array.isArray(d) ? d : []) || []);
      }

      // Log failures for debugging
      [u, p, c, pay, rc, rp].forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn(`[AdminDashboard] stat request ${i} failed:`, r.reason?.message);
        }
      });

      setLoading(false);
    };

    fetchAll();
  }, []);

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Extract values safely with multiple fallback paths
  const totalUsers     = userStats?.total          ?? 0;
  const newUsers       = userStats?.newThisMonth   ?? 0;
  const kycPending     = userStats?.kycPending     ?? 0;

  // Policy stats — handle both array and object responses
  const totalPolicies  = policyStats?.total
    ?? policyStats?.byStatus?.reduce((a, b) => a + (b.count || 0), 0)
    ?? (Array.isArray(policyStats) ? policyStats.length : 0)
    ?? 0;

  // Claims stats
  const byStatus       = claimStats?.byStatus || [];
  const openClaims     = claimStats?.pendingReview
    ?? byStatus.find(s => s._id === "submitted")?.count
    ?? byStatus.find(s => s._id === "under_review")?.count
    ?? 0;
  const approvedClaims = byStatus.find(s => s._id === "approved")?.count ?? 0;

  // Payment stats
  const totalRevenue   = paymentStats?.totals?.totalRevenue
    ?? paymentStats?.totalRevenue
    ?? 0;
  const pendingPayments = paymentStats?.totals?.pendingCount
    ?? paymentStats?.pendingCount
    ?? 0;

  const STAT_CARDS = [
    { icon: "👥", label: "Total Users",     value: totalUsers,                              sub: `${newUsers} new this month`,   color: "navy"   },
    { icon: "📄", label: "Total Policies",  value: totalPolicies,                           sub: "All policies",                 color: "gold"   },
    { icon: "⚡", label: "Open Claims",     value: openClaims,                              sub: "Awaiting review",              color: "red"    },
    { icon: "💰", label: "Total Revenue",   value: `₦${(totalRevenue/1000).toFixed(0)}K`,   sub: "Successful payments",          color: "green"  },
    { icon: "⏳", label: "KYC Pending",     value: kycPending,                              sub: "Awaiting verification",        color: "orange" },
    { icon: "🔄", label: "Pending Payment", value: pendingPayments,                         sub: "Awaiting payment",             color: "purple" },
    { icon: "✅", label: "Claims Approved", value: approvedClaims,                          sub: "This period",                  color: "green"  },
    { icon: "🤝", label: "Agents",          value: userStats?.agents ?? 0,                  sub: "Active brokers",               color: "gold"   },
  ];

  const QUICK_ACTIONS = [
    { icon: "⚡", label: "Review Claims",  to: "/admin/claims",   color: "bg-gerror-50",  textColor: "text-gerror-600",  badge: openClaims    },
    { icon: "🪪", label: "Verify KYC",     to: "/admin/kyc",      color: "bg-orange-50",  textColor: "text-orange-600",  badge: kycPending    },
    { icon: "👥", label: "Manage Users",   to: "/admin/users",    color: "bg-navy-50",    textColor: "text-navy-600",    badge: totalUsers    },
    { icon: "📄", label: "All Policies",   to: "/admin/policies", color: "bg-gold-50",    textColor: "text-gold-600",    badge: totalPolicies },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="font-sans text-sm text-gray-400 mt-1">{today}</p>
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
                    <p className="font-sans text-sm font-bold text-navy-900">
                      ₦{claim.claimedAmount?.toLocaleString()}
                    </p>
                    <span className={`font-sans text-xs font-semibold capitalize ${
                      claim.status === "approved" ? "text-gsuccess-600" :
                      claim.status === "rejected" ? "text-gerror-600" : "text-orange-500"
                    }`}>
                      {claim.status?.replace(/_/g, " ")}
                    </span>
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
                    <p className="font-sans text-sm font-medium text-navy-900 truncate max-w-[180px]">
                      {pay.reference}
                    </p>
                    <p className="font-sans text-xs text-gray-400 mt-0.5">
                      {pay.user?.firstName} {pay.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-sm font-bold text-navy-900">
                      ₦{pay.amount?.toLocaleString()}
                    </p>
                    <span className={`font-sans text-xs font-semibold ${
                      pay.status === "success" ? "text-gsuccess-600" :
                      pay.status === "failed"  ? "text-gerror-600"  : "text-orange-500"
                    }`}>
                      {pay.status?.charAt(0).toUpperCase() + pay.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={action.to}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-transparent
                hover:border-gold-200 hover:shadow-card transition-all duration-200 group ${action.color}`}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </span>
              <span className={`font-sans text-sm font-semibold text-center ${action.textColor}`}>
                {action.label}
              </span>
              {/* Badge — only show if count > 0 */}
              {!loading && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-gerror-600 text-white text-xs font-bold
                  min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center shadow-sm">
                  {action.badge > 99 ? "99+" : action.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
