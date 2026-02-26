import React, { memo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = memo(({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Still checking authentication
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to signin
    return <Navigate to="/signin" replace />;
  }

  // Authenticated, render the protected component
  return children;
});

ProtectedRoute.displayName = "ProtectedRoute";

export default ProtectedRoute;
