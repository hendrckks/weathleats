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
  const { user } = useAuth();

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
          {!user && (
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
          {/* Search */}
          <div className="space-y-2 mb-6">
            <h2 className="text-sm text-textBlack font-medium">Search</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Browse all recipes"
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Types */}
          <div className="space-y-3 mb-6">
            <h2 className="text-sm text-textBlack font-medium">Types</h2>
            <div className="space-y-3">
              {["Vegetarian", "Vegan", "Gluten Free"].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-primary/50 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{type}</span>
                  <span
                    className={`text-xs text-white px-1.5 py-0.5 rounded ${
                      type === "Vegetarian"
                        ? "bg-[#f3ca96]"
                        : type === "Vegan"
                        ? "bg-[#6a4731]"
                        : "bg-[#6b6b71]"
                    }`}
                  >
                    {type === "Vegetarian"
                      ? "V"
                      : type === "Vegan"
                      ? "Ve"
                      : "GF"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h2 className="text-sm text-textBlack font-medium">Category</h2>
            <div className="space-y-3">
              {[
                "Breakfast",
                "Lunch",
                "Pre-workout",
                "Post-workout",
                "Dinner",
                "Dessert",
              ].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-primary/50 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSidebar;
