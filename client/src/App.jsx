import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout          from "./layouts/MainLayout";
import AdminLayout         from "./layouts/AdminLayout";
import HomePage            from "./pages/HomePage";
import AboutPage           from "./pages/AboutPage";
import ServicesPage        from "./pages/ServicesPage";
import ContactPage         from "./pages/ContactPage";
import PrivacyPage         from "./pages/PrivacyPage";
import TermsPage           from "./pages/TermsPage";
import LoginPage           from "./pages/auth/LoginPage";
import RegisterPage        from "./pages/auth/RegisterPage";
import VerifyOTPPage       from "./pages/auth/VerifyOTPPage";
import DashboardPage       from "./pages/DashboardPage";
import ProfilePage         from "./pages/ProfilePage";
import BuyPolicyPage       from "./pages/BuyPolicyPage";
import PaymentCheckoutPage from "./pages/PaymentCheckoutPage";
import PaymentVerifyPage   from "./pages/PaymentVerifyPage";
import PaymentHistoryPage  from "./pages/PaymentHistoryPage";
import FileClaimPage       from "./pages/FileClaimPage";
import NotFoundPage        from "./pages/NotFoundPage";
import AdminLoginPage      from "./pages/admin/AdminLoginPage";
import AdminDashboard      from "./pages/admin/AdminDashboard";
import AdminUsers          from "./pages/admin/AdminUsers";
import AdminPolicies       from "./pages/admin/AdminPolicies";
import AdminClaims         from "./pages/admin/AdminClaims";
import AdminPayments       from "./pages/admin/AdminPayments";
import AdminKYC            from "./pages/admin/AdminKYC";
import ProtectedRoute      from "./components/ProtectedRoute";
import AdminRoute          from "./components/AdminRoute";
import { useAuthStore }    from "./store/authStore";
import apiClient           from "./services/apiClient";
import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AuthRehydrator() {
  const { token, user, updateUser, logout, setReady, sessionType } = useAuthStore();

  useEffect(() => {
    // No token — nothing to do, immediately ready
    if (!token) {
      setReady(true);
      return;
    }

    // We already have the user cached from localStorage — ready immediately
    // Still fetch in background to refresh data, but don't block rendering
    if (user) {
      setReady(true);
      // Background refresh (non-blocking — failures are silent)
      apiClient.get("/users/me")
        .then((res) => {
          const fresh = res.data.data;
          // Only update if role matches — don't logout on mismatch here
          // since we already set isReady=true and rendered the page
          if (fresh.role === user.role) updateUser(fresh);
        })
        .catch(() => {}); // silent — cached user is still valid
      return;
    }

    // Token exists but no cached user — must fetch before rendering
    const fetchUser = (retryCount = 0) => {
      apiClient.get("/users/me")
        .then((res) => {
          const freshUser = res.data.data;
          if (sessionType === 'admin' && freshUser.role !== 'admin') {
            logout();
          } else {
            updateUser(freshUser);
          }
          setReady(true);
        })
        .catch((err) => {
          const status = err?.response?.status;
          if (status === 401) {
            logout();
            setReady(true);
          } else if (status === 429 && retryCount < 3) {
            setTimeout(() => fetchUser(retryCount + 1), 1500);
          } else {
            // Unknown error — set ready without user, routes will redirect to login
            setReady(true);
          }
        });
    };
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <AuthRehydrator />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<MainLayout><HomePage     /></MainLayout>} />
        <Route path="/about"    element={<MainLayout><AboutPage    /></MainLayout>} />
        <Route path="/services" element={<MainLayout><ServicesPage /></MainLayout>} />
        <Route path="/contact"  element={<MainLayout><ContactPage  /></MainLayout>} />
        <Route path="/privacy"  element={<MainLayout><PrivacyPage  /></MainLayout>} />
        <Route path="/terms"    element={<MainLayout><TermsPage    /></MainLayout>} />

        {/* Customer Auth */}
        <Route path="/login"       element={<MainLayout><LoginPage     /></MainLayout>} />
        <Route path="/register"    element={<MainLayout><RegisterPage  /></MainLayout>} />
        <Route path="/verify-otp"  element={<MainLayout><VerifyOTPPage /></MainLayout>} />

        {/* Customer Protected */}
        <Route path="/dashboard"        element={<ProtectedRoute><MainLayout><DashboardPage       /></MainLayout></ProtectedRoute>} />
        <Route path="/profile"          element={<ProtectedRoute><MainLayout><ProfilePage         /></MainLayout></ProtectedRoute>} />
        <Route path="/policies/buy"     element={<ProtectedRoute><MainLayout><BuyPolicyPage       /></MainLayout></ProtectedRoute>} />
        <Route path="/payment/checkout" element={<ProtectedRoute><MainLayout><PaymentCheckoutPage /></MainLayout></ProtectedRoute>} />
        <Route path="/payment/verify"   element={<ProtectedRoute><MainLayout><PaymentVerifyPage   /></MainLayout></ProtectedRoute>} />
        <Route path="/payments"         element={<ProtectedRoute><MainLayout><PaymentHistoryPage  /></MainLayout></ProtectedRoute>} />
        <Route path="/claims/new"       element={<ProtectedRoute><MainLayout><FileClaimPage       /></MainLayout></ProtectedRoute>} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Panel */}
        <Route path="/admin"          element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users"    element={<AdminRoute><AdminLayout><AdminUsers     /></AdminLayout></AdminRoute>} />
        <Route path="/admin/policies" element={<AdminRoute><AdminLayout><AdminPolicies  /></AdminLayout></AdminRoute>} />
        <Route path="/admin/claims"   element={<AdminRoute><AdminLayout><AdminClaims    /></AdminLayout></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminLayout><AdminPayments  /></AdminLayout></AdminRoute>} />
        <Route path="/admin/kyc"      element={<AdminRoute><AdminLayout><AdminKYC       /></AdminLayout></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
