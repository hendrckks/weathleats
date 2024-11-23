import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavouritesContext";
import RecipeCard from "../../components/RecipeCard";
import { signOut } from "../../lib/firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchRecipesByIds } from "../../lib/firebase/firestore";
import { Recipe } from "../../types/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import Pagination from "../../components/navigation/Pagination";
import { Loader2 } from "lucide-react";

const RECIPES_PER_PAGE = 8;

const Account: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const { favorites } = useFavorites();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchWithCache } = useFirebaseCache();

  const navigate = useNavigate();

  const totalPages = Math.ceil(favorites.length / RECIPES_PER_PAGE);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      if (user && favorites.length > 0) {
        setIsLoading(true);
        const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
        const endIndex = startIndex + RECIPES_PER_PAGE;
        const pageIds = favorites.slice(startIndex, endIndex);

        try {
          const recipes = await fetchWithCache(
            `favorite-recipes-${pageIds.join("-")}`,
            () => fetchRecipesByIds(pageIds),
            1000 * 60 * 5 // 5 minutes cache
          );
          setFavoriteRecipes(recipes);
        } catch (error) {
          console.error("Error fetching favorite recipes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavoriteRecipes([]);
        setIsLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, [user, favorites, currentPage]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

        <div className="flex justify-between">
          <div className="space-y-6 mt-2">
            <div className="space-y-2">
              <h3 className="text-gray-600">Types</h3>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2 mt-6">
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

            <div className="space-y-2">
              <h3 className="text-gray-600">Category</h3>
              <div className="text-sm space-y-3">
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
                {/* <div className="p-3 bg-primary text-textWhite mt-10 rounded-sm text-sm">
                  Generate grocery list
                </div> */}
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 ml-10">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 flex items-center">
                You have
                <span className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 transition-colors duration-300 ease-in-out fill-current text-primary stroke-textBlack stroke-2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </span>{" "}
                {favorites.length} saved recipe(s)
              </p>
              <div className="relative">
                <div
                  className="p-2 w-fit text-sm rounded-sm bg-primary/20 text-textBlack flex items-center gap-2 cursor-pointer hover:bg-primary/30 transition-colors"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  Sort by
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isDropdownOpen && (
                    <div className="absolute left-0 top-full mt-[2px] bg-background border border-primary/40 shadow-lg rounded-sm w-56 py-1 px-1 z-50">
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Calories: High - Low
                      </div>
                      <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 rotate-180"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {isLoading ? (
                // Show skeleton loading for recipes
                Array(RECIPES_PER_PAGE)
                  .fill(0)
                  .map((_, index) => (
                    <RecipeCard
                      key={`skeleton-${index}`}
                      id=""
                      name=""
                      calories={0}
                      prepTime=""
                      imageUrl=""
                      isLoading={true}
                    />
                  ))
              ) : favoriteRecipes.length > 0 ? (
                favoriteRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    name={recipe.name}
                    calories={recipe.nutritionFacts?.calories}
                    prepTime={recipe.prepTime?.toString() || "N/A"}
                    imageUrl={recipe.imageUrls?.[0] || ""}
                  />
                ))
              ) : (
                <p>No favorite recipes found.</p>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>

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
