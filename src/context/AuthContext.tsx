import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase/clientApp";
import { checkSession } from "../lib/firebase/auth";

interface User extends FirebaseUser {
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isRefreshing: boolean;
  refreshToken: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAuthReady: () => boolean;
  authStateComplete: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authStateComplete, setAuthStateComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced token refresh with retries and validation
  const refreshToken = useCallback(async () => {
    if (!auth.currentUser) return;

    setIsRefreshing(true);
    let retries = 3;

    while (retries > 0) {
      try {
        await auth.currentUser.getIdToken(true);
        const isSessionValid = await checkSession();

        if (!isSessionValid) {
          setUser(null);
          localStorage.removeItem("user");
          break;
        }
        return; // Success
      } catch (error) {
        retries--;
        if (retries === 0) {
          setUser(null);
          localStorage.removeItem("user");
          console.error("Token refresh failed after retries:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
      }
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    return Boolean(
      user && !loading && !isRefreshing && authStateComplete && isInitialized
    );
  }, [user, loading, isRefreshing, authStateComplete, isInitialized]);

  const isAuthReady = useCallback(() => {
    return !loading && !isRefreshing && authStateComplete;
  }, [loading, isRefreshing, authStateComplete]);

  useEffect(() => {
    let mounted = true;
    let authStateUnsubscribe: (() => void) | null = null;

    const initializeAuth = async () => {
      try {
        authStateUnsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            if (!mounted) return;

            if (firebaseUser) {
              try {
                const isSessionValid = await checkSession();

                if (isSessionValid) {
                  const userDoc = await getDoc(
                    doc(db, "users", firebaseUser.uid)
                  );
                  const userData = userDoc.data();

                  if (mounted) {
                    const userWithMetadata: User = {
                      ...firebaseUser,
                      createdAt: userData?.createdAt?.toDate().toISOString(),
                    };
                    setUser(userWithMetadata);
                  }
                } else {
                  if (mounted) setUser(null);
                }
              } catch (error) {
                console.error("Auth state sync error:", error);
                if (mounted) setUser(null);
              }
            } else {
              if (mounted) setUser(null);
            }

            if (mounted) {
              setLoading(false);
              setAuthStateComplete(true);
              setIsInitialized(true);
            }
          }
        );
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setLoading(false);
          setAuthStateComplete(true);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authStateUnsubscribe) authStateUnsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        isRefreshing,
        refreshToken,
        isAuthenticated,
        isAuthReady,
        authStateComplete,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
