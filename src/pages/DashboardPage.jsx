import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gblue-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your insurance account
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Active Policies", value: "0", icon: "📄" },
          { label: "Claims", value: "0", icon: "⚡" },
          { label: "Total Premium", value: "₦0", icon: "💰" },
          { label: "Account Status", value: "Active", icon: "✅" },
        ].map((stat, idx) => (
          <div key={idx} className="card">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gblue-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card-hover">
          <h3 className="text-lg font-semibold text-gblue-900 mb-2">
            Buy New Policy
          </h3>
          <p className="text-gray-600 mb-4">
            Get instant coverage in just a few minutes
          </p>
          <Link to="/policies/new" className="text-gblue-600 hover:text-gblue-900 font-semibold">
            Get Started →
          </Link>
        </div>

        <div className="card-hover">
          <h3 className="text-lg font-semibold text-gblue-900 mb-2">
            File a Claim
          </h3>
          <p className="text-gray-600 mb-4">
            Submit a claim and track its progress
          </p>
          <Link to="/claims/new" className="text-gblue-600 hover:text-gblue-900 font-semibold">
            Submit Claim →
          </Link>
        </div>
      </div>

      {/* Account Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gblue-900 mb-4">Account Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold text-gblue-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Phone</p>
            <p className="font-semibold text-gblue-900">{user?.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Role</p>
            <p className="font-semibold text-gblue-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">KYC Verification</p>
            <p className={`font-semibold ${user?.kycVerified ? "text-gsuccess-600" : "text-orange-600"}`}>
              {user?.kycVerified ? "Verified" : "Pending"}
            </p>
          </div>
        </div>
        <Link to="/profile" className="mt-4 btn btn-secondary inline-block">
          Complete KYC
        </Link>
      </div>
    </div>
  );
}
