import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuthStore } from "../store/authStore";

// Pages admins are NOT allowed to see
const CUSTOMER_ONLY_PATHS = [
  "/dashboard", "/profile", "/policies",
  "/payment", "/payments", "/claims",
];

export default function MainLayout({ children }) {
  const { user, isAuthenticated, isReady } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) return;
    if (user?.role !== "admin") return;

    // Admin trying to access a customer-only page
    const isCustomerPage = CUSTOMER_ONLY_PATHS.some(p =>
      location.pathname.startsWith(p)
    );

    if (isCustomerPage) {
      navigate("/admin", { replace: true });
    }
  }, [isReady, isAuthenticated, user, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
