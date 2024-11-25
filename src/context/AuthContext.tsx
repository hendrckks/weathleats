import React, { createContext, useState, useEffect, useContext } from "react";
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if there's a valid session on initial load
    const sessionExpiration = localStorage.getItem("sessionExpiration");
    return sessionExpiration && Date.now() < parseInt(sessionExpiration)
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isSessionValid = await checkSession();
        if (isSessionValid) {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            const userData = userDoc.data();
            const userWithMetadata: User = {
              ...firebaseUser,
              createdAt: userData?.createdAt?.toDate().toISOString(),
            };
            setUser(userWithMetadata);
            // Persist user in localStorage
            localStorage.setItem("user", JSON.stringify(userWithMetadata));
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser(null);
            localStorage.removeItem("user");
          }
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
