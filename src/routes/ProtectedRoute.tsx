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
    let mounted = true;
    let timeout: NodeJS.Timeout;

    if (!loading && !isRefreshing && isInitialized) {
      timeout = setTimeout(() => {
        if (mounted) {
          setIsReady(true);
        }
      }, 300); // Slightly increased delay for better stability
    }

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
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
