import { createBrowserRouter } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "../app/MainLayout";
import Home from "../app/pages/Home";
import Articles from "../app/pages/Articles";
import SignUp from "../app/auth/SignUp";
import SignIn from "../app/auth/SignIn";
import RecipeInfo from "../app/pages/RecipeInfo";
import ResetPassword from "../app/auth/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import Account from "../app/pages/Account";
// import ProtectedRoute from "./ProtectedRoute";

// import ProfilePage from "../app/pages/ProfilePage";
// import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AnimatePresence mode="sync">
        <MainLayout />
      </AnimatePresence>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/articles",
        element: <Articles />,
      },
      {
        path: "/login",
        element: <SignIn />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/s",
        element: <RecipeInfo />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);