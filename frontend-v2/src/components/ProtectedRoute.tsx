import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getStoredAccessToken } from "@/services/auth.api";

interface Props {
  children: ReactNode;
  requiredRole?: "ADMIN";
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const token = getStoredAccessToken();
  const { user, loading } = useCurrentUser();

  if (!token) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
