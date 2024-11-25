import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface MobileSidebarProps {
  showFilters?: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  showFilters,
  onClose,
}) => {
  const { user, loading } = useAuth();

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="border-b border-primary/50 p-4">
        <div className="space-y-4">
          <Link
            to="/"
            className="block text-[#637257] hover:text-textBlack transition-colors"
            onClick={onClose}
          >
            Recipes
          </Link>
          <Link
            to=""
            className="flex items-center text-[#637257] hover:text-textBlack transition-colors"
            onClick={onClose}
          >
            Submit a recipe
            <span className="text-[10px] px-2 py-2 ml-2 rounded-[4px] bg-[#637257] text-textWhite">
              Coming soon
            </span>
          </Link>
          {!loading && !user && (
            <Link
              to="/signup"
              className="block text-[#637257] hover:text-textBlack transition-colors"
              onClick={onClose}
            >
              Sign up
            </Link>
          )}
        </div>
      </div>

      {/* Filters - Only shown on home and profile routes */}
      {showFilters && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add your filter components here */}
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;
