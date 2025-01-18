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
  refreshToken: () => Promise.resolve(),
  isAuthenticated: () => false,
  isAuthReady: () => false,
  isInitialized: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const sessionExpiration = localStorage.getItem("sessionExpiration");
    return sessionExpiration && Date.now() < parseInt(sessionExpiration)
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
  });

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

  const isAuthenticated = useCallback(() => {
    return !!user && !loading && !isRefreshing;
  }, [user, loading, isRefreshing]);

  const isAuthReady = useCallback(() => {
    return !loading && !isRefreshing;
  }, [loading, isRefreshing]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const isSessionValid = await checkSession();
          if (isSessionValid) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.data();
            const userWithMetadata: User = {
              ...firebaseUser,
              createdAt: userData?.createdAt?.toDate().toISOString(),
            };
            setUser(userWithMetadata);
            localStorage.setItem("user", JSON.stringify(userWithMetadata));
          } else {
            setUser(null);
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
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
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
