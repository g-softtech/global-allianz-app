import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/apiClient";

const QUICK_ACTIONS = [
  { icon: "📄", label: "Buy New Policy",  to: "/policies/buy", color: "bg-navy-50  border-navy-100 hover:border-navy-300" },
  { icon: "⚡", label: "File a Claim",    to: "/claims/new",   color: "bg-gold-50  border-gold-100  hover:border-gold-400" },
  { icon: "🔄", label: "Renew Policy",    to: "/policies/buy", color: "bg-navy-50  border-navy-100 hover:border-navy-300" },
  { icon: "📞", label: "Contact Broker",  to: "/contact",      color: "bg-gsuccess-50 border-gsuccess-200 hover:border-gsuccess-400" },
  { icon: "💳", label: "Payment History", to: "/payments",     color: "bg-navy-50  border-navy-100 hover:border-navy-300" },
];

const STATUS_CONFIG = {
  active:           { label: "Active",       classes: "bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200" },
  pending:          { label: "Pending",      classes: "bg-gold-50 text-gold-600 border border-gold-200" },
  pending_payment:  { label: "Pending Pay",  classes: "bg-gold-50 text-gold-600 border border-gold-200" },
  expired:          { label: "Expired",      classes: "bg-gray-100 text-gray-500 border border-gray-200" },
  cancelled:        { label: "Cancelled",    classes: "bg-gray-100 text-gray-500 border border-gray-200" },
  draft:            { label: "Draft",        classes: "bg-gray-100 text-gray-500 border border-gray-200" },
  submitted:        { label: "Submitted",    classes: "bg-blue-50 text-blue-600 border border-blue-200" },
  under_review:     { label: "Under Review", classes: "bg-blue-50 text-blue-600 border border-blue-200" },
  assessment:       { label: "Assessment",   classes: "bg-purple-50 text-purple-600 border border-purple-200" },
  approved:         { label: "Approved",     classes: "bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200" },
  rejected:         { label: "Rejected",     classes: "bg-gerror-50 text-gerror-600 border border-gerror-200" },
  paid:             { label: "Paid",         classes: "bg-gsuccess-50 text-gsuccess-600 border border-gsuccess-200" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, classes: "bg-gray-100 text-gray-500 border border-gray-200" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="border border-gray-100 rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-24" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");

  // Real data from API
  const [policies,  setPolicies]  = useState([]);
  const [claims,    setClaims]    = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [statsData, setStatsData] = useState({ activePolicies: 0, openClaims: 0, totalPremium: 0 });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [polRes, clmRes, payRes] = await Promise.allSettled([
          apiClient.get("/policies?limit=10"),
          apiClient.get("/claims?limit=10"),
          apiClient.get("/payments?limit=5"),
        ]);

        const pols = polRes.status === "fulfilled" ? (polRes.value.data.data || []) : [];
        const clms = clmRes.status === "fulfilled" ? (clmRes.value.data.data || []) : [];
        const pays = payRes.status === "fulfilled" ? (payRes.value.data.data || []) : [];

        setPolicies(pols);
        setClaims(clms);
        setPayments(pays);

        // Calculate real stats
        const activePolicies = pols.filter(p => p.status === "active").length;
        const openClaims     = clms.filter(c => ["submitted","under_review","assessment"].includes(c.status)).length;
        const totalPremium   = pays.filter(p => p.status === "success").reduce((s, p) => s + (p.amount || 0), 0);

        setStatsData({ activePolicies, openClaims, totalPremium });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const STATS = [
    {
      label: "Active Policies",
      value: loading ? "—" : statsData.activePolicies,
      icon: "📄",
      sub: loading ? "Loading..." : `${policies.filter(p => p.status === "pending_payment").length} pending payment`,
      color: "text-navy-600",
    },
    {
      label: "Open Claims",
      value: loading ? "—" : statsData.openClaims,
      icon: "⚡",
      sub: loading ? "Loading..." : statsData.openClaims > 0 ? "Under review" : "No open claims",
      color: "text-gold-600",
    },
    {
      label: "Total Premium Paid",
      value: loading ? "—" : statsData.totalPremium === 0 ? "₦0" : `₦${(statsData.totalPremium / 1000).toFixed(0)}K`,
      icon: "💰",
      sub: "Successful payments",
      color: "text-navy-600",
    },
    {
      label: "KYC Status",
      value: user?.kycVerified ? "Verified" : "Pending",
      icon: user?.kycVerified ? "✅" : "⏳",
      sub: user?.kycVerified ? "Fully verified" : "Action required",
      color: user?.kycVerified ? "text-gsuccess-600" : "text-orange-500",
    },
  ];

  // Build recent activity from real data
  const recentActivity = [
    ...payments.slice(0, 2).map(p => ({
      icon: "💳",
      text: `Payment of ₦${p.amount?.toLocaleString()} — ${p.status}`,
      time: new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      color: "bg-gsuccess-50",
    })),
    ...claims.slice(0, 2).map(c => ({
      icon: "⚡",
      text: `Claim ${c.claimNumber} — ${c.status?.replace("_", " ")}`,
      time: new Date(c.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      color: "bg-gold-50",
    })),
    ...policies.slice(0, 2).map(p => ({
      icon: "📄",
      text: `${p.type?.charAt(0).toUpperCase() + p.type?.slice(1)} policy — ${p.status?.replace("_", " ")}`,
      time: new Date(p.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
      color: "bg-navy-50",
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  return (
    <div className="bg-section-gradient min-h-screen pt-24 pb-16">
      <div className="container-custom">

        {/* Welcome Banner */}
        <div className="relative bg-navy-gradient rounded-2xl p-6 md:p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(212,175,55,0.5) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-sans text-gold-400 text-sm font-medium uppercase tracking-widest mb-1">{greeting}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="font-sans text-gray-400 text-sm mt-1">
                Account ID: <span className="text-gray-300 font-medium">
                  {String(user?._id || user?.id || '').slice(-8).toUpperCase() || "GAIB-XXXX"}
                </span>
                {" · "}
                <span className="capitalize">{user?.role || "Customer"}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/policies/buy" className="btn btn-primary text-sm px-5 py-2.5">
                + New Policy
              </Link>
              <a href="https://wa.me/2341234567890" target="_blank" rel="noopener noreferrer"
                className="btn bg-gsuccess-600 text-white hover:bg-green-700 text-sm px-5 py-2.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card">
              <div className="text-2xl mb-3">{s.icon}</div>
              {loading && s.label !== "KYC Status" ? (
                <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <div className={`font-display text-2xl font-bold ${s.color} mb-0.5`}>{s.value}</div>
              )}
              <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className="font-sans text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* KYC Alert */}
        {!user?.kycVerified && (
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-sans font-semibold text-gold-800 text-sm">Complete Your KYC Verification</h3>
              <p className="font-sans text-xs text-gold-700 mt-1 leading-relaxed">
                To purchase policies and file claims, please verify your identity. This takes less than 5 minutes.
              </p>
            </div>
            <Link to="/profile" className="btn bg-gold-500 text-navy-900 hover:bg-gold-400 text-xs px-4 py-2 flex-shrink-0">
              Verify Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "policies", label: `Policies${policies.length ? ` (${policies.length})` : ""}` },
                  { id: "claims",   label: `Claims${claims.length ? ` (${claims.length})` : ""}` },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 font-sans text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "text-navy-900 border-gold-500"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="font-display text-lg font-semibold text-navy-900 mb-4">Recent Activity</h3>
                    {loading ? (
                      [1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-48" />
                            <div className="h-3 bg-gray-100 rounded w-20" />
                          </div>
                        </div>
                      ))
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-3xl mb-2">📋</p>
                        <p className="font-sans text-sm text-gray-400">No activity yet. Purchase a policy to get started.</p>
                      </div>
                    ) : (
                      recentActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-sm text-navy-900 font-medium capitalize">{item.text}</p>
                            <p className="font-sans text-xs text-gray-400 mt-0.5">{item.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Policies Tab */}
                {activeTab === "policies" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display text-lg font-semibold text-navy-900">My Policies</h3>
                      <Link to="/policies/buy" className="btn btn-primary text-xs px-4 py-2">+ New Policy</Link>
                    </div>
                    {loading ? (
                      <div className="space-y-3">{[1,2].map(i => <SkeletonRow key={i} />)}</div>
                    ) : policies.length === 0 ? (
                      <EmptyState icon="📄" title="No policies yet" desc="Purchase your first insurance policy to get started." cta="Browse Policies" ctaTo="/policies/buy" />
                    ) : (
                      <div className="space-y-3">
                        {policies.map((p) => (
                          <div key={p._id} className="border border-gray-100 rounded-xl p-4 hover:border-navy-200 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-sans font-semibold text-navy-900 text-sm capitalize">{p.type} Insurance</p>
                                <p className="font-sans text-xs text-gray-400 mt-0.5">{p.policyNumber || "Pending number"}</p>
                              </div>
                              <StatusBadge status={p.status} />
                            </div>
                            <div className="flex gap-6 mt-3">
                              {p.endDate && (
                                <div>
                                  <p className="font-sans text-xs text-gray-400">Expiry</p>
                                  <p className="font-sans text-xs font-semibold text-navy-700 mt-0.5">
                                    {new Date(p.endDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="font-sans text-xs text-gray-400">Annual Premium</p>
                                <p className="font-sans text-xs font-semibold text-navy-700 mt-0.5">
                                  ₦{p.premium?.amount?.toLocaleString() || "—"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Claims Tab */}
                {activeTab === "claims" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display text-lg font-semibold text-navy-900">My Claims</h3>
                      <Link to="/claims/new" className="btn btn-primary text-xs px-4 py-2">File a Claim</Link>
                    </div>
                    {loading ? (
                      <div className="space-y-3">{[1,2].map(i => <SkeletonRow key={i} />)}</div>
                    ) : claims.length === 0 ? (
                      <EmptyState icon="⚡" title="No claims filed" desc="Your filed claims will appear here." cta="File a Claim" ctaTo="/claims/new" />
                    ) : (
                      <div className="space-y-3">
                        {claims.map((c) => (
                          <div key={c._id} className="border border-gray-100 rounded-xl p-4 hover:border-navy-200 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-sans font-semibold text-navy-900 text-sm capitalize">{c.type} Insurance Claim</p>
                                <p className="font-sans text-xs text-gray-400 mt-0.5">
                                  {c.claimNumber} · {new Date(c.submittedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <StatusBadge status={c.status} />
                            </div>
                            <div className="mt-3">
                              <p className="font-sans text-xs text-gray-400">Claimed Amount</p>
                              <p className="font-sans text-sm font-bold text-navy-900 mt-0.5">₦{c.claimedAmount?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-display text-base font-semibold text-navy-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((a) => (
                  <Link key={a.label} to={a.to}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-0.5 ${a.color}`}>
                    <span className="text-2xl">{a.icon}</span>
                    <span className="font-sans text-xs font-medium text-navy-700 leading-tight">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="font-display text-base font-semibold text-navy-900 mb-4">Account Details</h3>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "—" },
                  { label: "Email",     value: user?.email || "—" },
                  { label: "Phone",     value: user?.phone || "Not provided" },
                  { label: "Role",      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer" },
                  { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG", { month: "long", year: "numeric" }) : "—" },
                ].map((row) => (
                  <div key={row.label}>
                    <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{row.label}</p>
                    <p className="font-sans text-sm font-medium text-navy-900 mt-0.5 truncate">{row.value}</p>
                  </div>
                ))}
              </div>
              <Link to="/profile" className="btn border-2 border-gray-200 text-gray-600 hover:border-navy-300 hover:text-navy-900 text-sm w-full mt-5 justify-center">
                Edit Profile
              </Link>
            </div>

            {/* Support */}
            <div className="bg-navy-gradient rounded-2xl p-6 text-center">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-display text-base font-semibold text-white mb-2">Need Help?</h3>
              <p className="font-sans text-xs text-gray-400 mb-4 leading-relaxed">
                Our brokers are available Monday–Friday, 8am–5pm WAT.
              </p>
              <a href="tel:+2341234567890" className="btn btn-primary text-xs w-full justify-center">
                Call a Broker
              </a>
              <a href="https://wa.me/2341234567890" target="_blank" rel="noopener noreferrer"
                className="btn bg-navy-800 text-white hover:bg-navy-700 text-xs w-full justify-center mt-2">
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, ctaTo }) {
  return (
    <div className="text-center py-10">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-display font-semibold text-navy-900 text-base mb-2">{title}</h4>
      <p className="font-sans text-sm text-gray-400 mb-5">{desc}</p>
      <Link to={ctaTo} className="btn btn-primary text-sm">{cta}</Link>
    </div>
  );
}


