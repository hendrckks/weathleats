import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import MobileSidebar from "./MobileNavbar";
// import { signOut } from "../../lib/firebase/auth";

interface NavbarProps {
  showFilters?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showFilters }) => {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  // const navigate = useNavigate();

  // Helper function to check if current route is an auth route
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/profile";

  // const handleSignOut = async () => {
  //   try {
  //     await signOut();
  //     setUser(null);
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  // };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-primary/50 bg-background shadow-sm">
      <nav className="mx-auto flex h-full items-center justify-between px-4 md:px-8">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <Link to="/" className="text-xl flex items-center ml-[-20px]">
            <img src="/weathleats.png" alt="weathleats logo" className="h-20" />
            <span className="ml-[-20px] tracking-tight text-textBlack">
              Weathleats
            </span>
            <span className="font-athauss italic text-primary text-xs mt-[6px] ml-[6px]">
              beta
            </span>
          </Link>
        </div>

        {/* Desktop Logo and Navigation */}
        <div className="hidden md:flex md:items-center md:gap-10">
          <Link to="/" className="text-xl ml-[-30px] flex items-center">
            <img src="/weathleats.png" alt="weathleats logo" className="h-20" />
            <span className="ml-[-20px] tracking-tight text-textBlack">
              Weathleats
            </span>
            <span className="font-athauss italic text-primary text-xs mt-[6px] ml-[6px]">
              beta
            </span>
          </Link>
          <div className="gap-10 flex text-sm">
            <Link
              to="/"
              className={`transition-colors duration-100 ease-in-out ${
                pathname === "/"
                  ? "text-textBlack"
                  : "text-[#637257] hover:text-textBlack"
              }`}
            >
              Recipes
            </Link>
            <Link
              to=""
              className="text-[#637257] hover:text-textBlack transition-colors duration-100 ease-in-out"
            >
              Submit a recipe
              <span className="text-[10px] px-2 py-2 ml-2 rounded-[4px] bg-[#637257] text-textWhite">
                Coming soon
              </span>
            </Link>
          </div>
        </div>

        {/* Auth Buttons and Hamburger Menu */}
        <div className="flex items-center gap-4">
          {!loading && user && !isAuthRoute && (
            <Link
              to="/profile"
              className="py-2 px-3 bg-primary text-textWhite text-sm rounded-[4px]"
            >
              Profile
            </Link>
          )}

          {!loading && !user && !isAuthRoute && (
            <>
              <Link
                to="/signup"
                className="hidden md:block p-2 text-sm text-textBlack"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="py-2 px-3 bg-[#637257] text-textWhite text-xs rounded-md"
              >
                Login
              </Link>
            </>
          )}

          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-600 block md:hidden hover:text-gray-900"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <MobileSidebar
              showFilters={showFilters}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
