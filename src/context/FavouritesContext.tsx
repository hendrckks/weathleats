import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase/clientApp";
import {
  doc,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import debounce from "lodash/debounce";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (recipeId: string) => void;
  removeFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setFavorites(userDoc.data().favorites || []);
        } else {
          await setDoc(userRef, { favorites: [] });
        }
      } else {
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [user]);

  const updateFavorites = useMemo(
    () =>
      debounce(async () => {
        if (user && pendingUpdates.size > 0) {
          const batch = writeBatch(db);
          const userRef = doc(db, "users", user.uid);

          pendingUpdates.forEach((recipeId) => {
            if (favorites.includes(recipeId)) {
              batch.update(userRef, {
                favorites: arrayUnion(recipeId),
              });
            } else {
              batch.update(userRef, {
                favorites: arrayRemove(recipeId),
              });
            }
          });

          await batch.commit();
          setPendingUpdates(new Set());
        }
      }, 2000),
    [user, favorites, pendingUpdates]
  );

  useEffect(() => {
    if (pendingUpdates.size > 0) {
      updateFavorites();
    }
    return () => {
      updateFavorites.cancel();
    };
  }, [pendingUpdates, updateFavorites]);

  const addFavorite = (recipeId: string) => {
    if (!favorites.includes(recipeId)) {
      setFavorites((prev) => [...prev, recipeId]);
      setPendingUpdates((prev) => new Set(prev).add(recipeId));
    }
  };

  const removeFavorite = (recipeId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== recipeId));
    setPendingUpdates((prev) => new Set(prev).add(recipeId));
  };

  const isFavorite = (recipeId: string) => favorites.includes(recipeId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
