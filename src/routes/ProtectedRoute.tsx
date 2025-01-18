import React, { useState, useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireUnauth = false,
}) => {
  const { loading, isAuthenticated, isRefreshing, isInitialized } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!loading && !isRefreshing && isInitialized) {
      // Add a small delay to ensure all auth states are synchronized
      timeout = setTimeout(() => {
        setIsReady(true);
      }, 200);
    }
    return () => clearTimeout(timeout);
  }, [loading, isRefreshing, isInitialized]);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireUnauth && isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
