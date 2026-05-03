// v4 - forces fresh Vercel build - do not remove this comment
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
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
  const [loading, setLoading] = useState(true);
  const [users,    setUsers]    = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claims,   setClaims]   = useState([]);
  const [payments, setPayments] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, c, pay] = await Promise.allSettled([
        apiClient.get("/users/admin/all?limit=500"),
        apiClient.get("/policies/admin/all?limit=500"),
        apiClient.get("/claims/admin/all?limit=500"),
        apiClient.get("/payments/admin/all?limit=500"),
      ]);

      if (u.status   === "fulfilled") setUsers(u.value?.data?.data?.users       || []);
      if (p.status   === "fulfilled") setPolicies(p.value?.data?.data?.policies || p.value?.data?.data || []);
      if (c.status   === "fulfilled") setClaims(c.value?.data?.data?.claims     || c.value?.data?.data || []);
      if (pay.status === "fulfilled") setPayments(pay.value?.data?.data?.payments || pay.value?.data?.data || []);

    } catch (e) {
      console.error("[Dashboard]", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const now        = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const nonAdmin       = users.filter(u => u.role !== "admin");
  const totalUsers     = nonAdmin.length;
  const newUsers       = nonAdmin.filter(u => new Date(u.createdAt) >= monthStart).length;
  const kycPending     = nonAdmin.filter(u => !u.kycVerified && u.kycDocuments?.length > 0).length;
  const totalPolicies  = Array.isArray(policies) ? policies.length : 0;
  const openClaims     = Array.isArray(claims) ? claims.filter(c => ["submitted","under_review","assessment"].includes(c.status)).length : 0;
  const approvedClaims = Array.isArray(claims) ? claims.filter(c => c.status === "approved").length : 0;
  const totalRevenue   = Array.isArray(payments) ? payments.filter(p => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0) : 0;
  const pendingPay     = Array.isArray(payments) ? payments.filter(p => p.status === "pending").length : 0;

  const recentClaims   = Array.isArray(claims)   ? [...claims].sort((a,b)   => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5) : [];
  const recentPayments = Array.isArray(payments) ? [...payments].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5) : [];

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const STAT_CARDS = [
    { icon: "👥", label: "Total Users",     value: totalUsers,                            sub: `${newUsers} new this month`,  color: "navy"   },
    { icon: "📄", label: "Total Policies",  value: totalPolicies,                         sub: "All policies",                color: "gold"   },
    { icon: "⚡", label: "Open Claims",     value: openClaims,                            sub: "Awaiting review",             color: "red"    },
    { icon: "💰", label: "Total Revenue",   value: `₦${(totalRevenue/1000).toFixed(0)}K`, sub: "Successful payments",         color: "green"  },
    { icon: "⏳", label: "KYC Pending",     value: kycPending,                            sub: "Awaiting verification",       color: "orange" },
    { icon: "🔄", label: "Pending Payment", value: pendingPay,                            sub: "Awaiting payment",            color: "purple" },
    { icon: "✅", label: "Claims Approved", value: approvedClaims,                        sub: "This period",                 color: "green"  },
    { icon: "🤝", label: "Agents",          value: nonAdmin.filter(u=>u.role==="agent").length, sub: "Active brokers",       color: "gold"   },
  ];

  const QUICK_ACTIONS = [
    { icon: "⚡", label: "Review Claims",  to: "/admin/claims",   bg: "bg-red-50",    text: "text-red-600",    badge: openClaims    },
    { icon: "🪪", label: "Verify KYC",     to: "/admin/kyc",      bg: "bg-orange-50", text: "text-orange-600", badge: kycPending    },
    { icon: "👥", label: "Manage Users",   to: "/admin/users",    bg: "bg-blue-50",   text: "text-blue-600",   badge: totalUsers    },
    { icon: "📄", label: "All Policies",   to: "/admin/policies", bg: "bg-yellow-50", text: "text-yellow-700", badge: totalPolicies },
  ];

  return (
    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="font-sans text-sm text-gray-400 mt-1">{today}</p>
        </div>
        <button onClick={fetchAll} disabled={loading}
          className="btn border border-gray-200 text-gray-600 hover:border-navy-300 text-sm px-4 py-2 disabled:opacity-50">
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-navy-900">Recent Claims</h3>
            <Link to="/admin/claims" className="font-sans text-xs text-gold-600 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}</div>
          ) : recentClaims.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-8">No claims yet</p>
          ) : recentClaims.map(claim => (
            <div key={claim._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
              <div>
                <p className="font-sans text-sm font-medium text-navy-900">{claim.claimNumber}</p>
                <p className="font-sans text-xs text-gray-400 capitalize">{claim.type} · {claim.user?.firstName} {claim.user?.lastName}</p>
              </div>
              <div className="text-right">
                <p className="font-sans text-sm font-bold text-navy-900">₦{claim.claimedAmount?.toLocaleString()}</p>
                <span className={`font-sans text-xs font-semibold capitalize ${
                  claim.status==="approved"?"text-gsuccess-600":claim.status==="rejected"?"text-gerror-600":"text-orange-500"
                }`}>{claim.status?.replace(/_/g," ")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-navy-900">Recent Payments</h3>
            <Link to="/admin/payments" className="font-sans text-xs text-gold-600 font-medium">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"/>)}</div>
          ) : recentPayments.length === 0 ? (
            <p className="font-sans text-sm text-gray-400 text-center py-8">No payments yet</p>
          ) : recentPayments.map(pay => (
            <div key={pay._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
              <div>
                <p className="font-sans text-sm font-medium text-navy-900 truncate max-w-[180px]">{pay.reference}</p>
                <p className="font-sans text-xs text-gray-400">{pay.user?.firstName} {pay.user?.lastName}</p>
              </div>
              <div className="text-right">
                <p className="font-sans text-sm font-bold text-navy-900">₦{pay.amount?.toLocaleString()}</p>
                <span className={`font-sans text-xs font-semibold ${
                  pay.status==="success"?"text-gsuccess-600":pay.status==="failed"?"text-gerror-600":"text-orange-500"
                }`}>{pay.status?.charAt(0).toUpperCase()+pay.status?.slice(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h3 className="font-display font-semibold text-navy-900 mb-5">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(action => (
            <Link key={action.label} to={action.to}
              className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl
                border-2 border-transparent hover:border-gold-300 hover:shadow-card
                transition-all duration-200 group ${action.bg}`}>
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
              <span className={`font-sans text-sm font-semibold text-center ${action.text}`}>{action.label}</span>
              {!loading && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs
                  font-bold min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center">
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
