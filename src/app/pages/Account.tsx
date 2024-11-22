// components/Account.tsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../lib/firebase/auth";
// import RecipeCard from "../../components/RecipeCard";
import { ChevronDown } from "lucide-react";

const Account: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Calculate joined date
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto">
      <div className="flex flex-col gap-20 mx-1 mt-20">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <h1 className="text-5xl font-medium text-gray-800">Your profile</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="font-medium">
                  {user?.displayName || user?.email}
                </h2>
                <p className="text-sm text-gray-600">Joined {joinedDate}</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors">
              Edit Account
            </button>
          </div>
        </div>

        {/* Filters and Content Section */}
        <div className="flex justify-between">
          {/* Left Sidebar - Filters */}
          <div className="space-y-6 p-5">
            {/* Types Section */}
            <div className="space-y-2">
              <h3 className="text-gray-600">Types</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Vegetarian</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Vegan</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Gluten Free</span>
                </label>
              </div>
            </div>

            {/* Category Section */}
            <div className="space-y-2">
              <h3 className="text-gray-600">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Breakfast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Lunch</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Dinner</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span>Dessert</span>
                </label>
                <div className="p-3 bg-primary text-textWhite mt-10 rounded-sm text-sm">
                  Generate grocery list
                </div>
              </div>
              {/* <div className="p-3 bg-primary text-textWhite mt-10 rounded-sm text-sm">
                Generate grocery list
              </div> */}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex flex-col flex-1 ml-10 p-5">
            {/* Recipe Count and Sort */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">You have ❤️ 1 saved recipe(s)</p>
              <div className="relative">
                <div
                  className="p-2 w-fit text-sm rounded-sm bg-primary/20 text-textBlack flex items-center gap-2 cursor-pointer hover:bg-primary/30 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  Sort by
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-[2px] bg-background border border-primary/40 shadow-lg rounded-sm w-56 py-1 px-1 z-50">
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer p-2">
                        <ChevronDown className="h-4 w-4" />
                        Calories: High - Low
                      </div>
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                        <ChevronDown className="h-4 w-4 rotate-180" />
                        Calories: Low - High
                      </div>
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                        <svg
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        Prep Time: Low - High
                      </div>
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                        <svg
                          className="w-4 h-4 mr-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        Prep Time: High - Low
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* <RecipeCard /> */}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="">
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-sm hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;
