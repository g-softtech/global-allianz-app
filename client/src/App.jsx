import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout    from "./layouts/MainLayout";
import HomePage      from "./pages/HomePage";
import AboutPage     from "./pages/AboutPage";
import ServicesPage  from "./pages/ServicesPage";
import ContactPage   from "./pages/ContactPage";
import PrivacyPage   from "./pages/PrivacyPage";
import TermsPage     from "./pages/TermsPage";
import LoginPage     from "./pages/auth/LoginPage";
import RegisterPage  from "./pages/auth/RegisterPage";
import VerifyOTPPage from "./pages/auth/VerifyOTPPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage   from "./pages/ProfilePage";
import NotFoundPage  from "./pages/NotFoundPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
import apiClient from "./services/apiClient";
import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// If the user has a token but no user object (e.g. after hard refresh),
// fetch /users/me to rehydrate the store
function AuthRehydrator() {
  const { token, user, updateUser, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      apiClient.get("/users/me")
        .then((res) => updateUser(res.data.data))
        .catch(() => logout()); // token invalid — log out cleanly
    }
  }, [token, user, updateUser, logout]);

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

        {/* Auth */}
        <Route path="/login"      element={<MainLayout><LoginPage     /></MainLayout>} />
        <Route path="/register"   element={<MainLayout><RegisterPage  /></MainLayout>} />
        <Route path="/verify-otp" element={<MainLayout><VerifyOTPPage /></MainLayout>} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><MainLayout><ProfilePage   /></MainLayout></ProtectedRoute>} />

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
