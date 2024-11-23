import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "./components/toast/Toaster";
import { FavoritesProvider } from "./context/FavouritesContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <div className={`antialiased min-h-screen bg-background font-athauss`}>
          <RouterProvider router={router} />
          <Toaster />
        </div>
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>
);
