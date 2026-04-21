import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady, user } = useAuthStore();

  // Wait for AuthRehydrator to finish before making any redirect decisions
  // This prevents the flash of customer content before admin redirect
  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admins must not access customer pages
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return children;
}
