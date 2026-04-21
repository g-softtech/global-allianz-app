import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isReady, user } = useAuthStore();

  // Wait for AuthRehydrator before deciding
  if (!isReady) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-navy-950">
        <div className="w-10 h-10 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated)         return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin')   return <Navigate to="/login" replace />;

  return children;
}
