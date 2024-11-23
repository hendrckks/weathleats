import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase/clientApp";
import {
  doc,
  setDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (recipeId: string) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
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

  const addFavorite = async (recipeId: string) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { favorites: arrayUnion(recipeId) },
        { merge: true }
      );
      setFavorites([...favorites, recipeId]);
    }
  };

  const removeFavorite = async (recipeId: string) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        { favorites: arrayRemove(recipeId) },
        { merge: true }
      );
      setFavorites(favorites.filter((id) => id !== recipeId));
    }
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
