import React, { memo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = memo(({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Still checking authentication
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-deep border-t-transparent"></div>
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
