import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isReady, user } = useAuthStore();

  // Always wait for rehydration — never redirect prematurely
  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
          <p className="font-sans text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  // Logged in but not admin
  if (user && user.role !== "admin") return <Navigate to="/login" replace />;

  // User fetch still in flight (token exists, user object not yet loaded)
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy-950">
        <div className="w-12 h-12 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
