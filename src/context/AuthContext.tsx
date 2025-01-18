// AuthContext.tsx
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
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  isRefreshing: false,
  refreshToken: async () => {},
  isAuthenticated: () => false,
  isAuthReady: () => false,
  isInitialized: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshToken = useCallback(async () => {
    if (auth.currentUser) {
      setIsRefreshing(true);
      try {
        await auth.currentUser.getIdToken(true);
        const isSessionValid = await checkSession();
        if (!isSessionValid) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          const isSessionValid = await checkSession();
          if (isSessionValid) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.data();

            if (mounted) {
              const userWithMetadata: User = {
                ...firebaseUser,
                createdAt: userData?.createdAt?.toDate().toISOString(),
              };
              setUser(userWithMetadata);
              localStorage.setItem("user", JSON.stringify(userWithMetadata));
            }
          } else {
            if (mounted) {
              setUser(null);
              localStorage.removeItem("user");
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        if (mounted) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Add session refresh logic
  useEffect(() => {
    if (user) {
      const sessionRefreshInterval = setInterval(async () => {
        try {
          const isSessionValid = await checkSession();
          if (!isSessionValid) {
            setUser(null);
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error refreshing session:", error);
        }
      }, 60000); // Check every minute

      return () => clearInterval(sessionRefreshInterval);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        isRefreshing,
        refreshToken,
        isAuthenticated: () => !!user && !loading && !isRefreshing,
        isAuthReady: () => !loading && !isRefreshing,
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
