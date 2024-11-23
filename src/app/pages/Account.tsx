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
import { Loader2, Heart } from "lucide-react";

const RECIPES_PER_PAGE = 8;

const Account: React.FC = () => {
  const { user, loading, setUser } = useAuth();
  const { favorites } = useFavorites();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchWithCache } = useFirebaseCache();

  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    types: [] as string[],
    categories: [] as string[],
  });

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      if (user && favorites.length > 0) {
        setIsLoading(true);
        try {
          const recipes = await fetchWithCache(
            `favorite-recipes-${favorites.join("-")}`,
            () => fetchRecipesByIds(favorites),
            1000 * 60 * 5 // 5 minutes cache
          );
          setFavoriteRecipes(recipes);
          setFilteredRecipes(recipes);
        } catch (error) {
          console.error("Error fetching favorite recipes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFavoriteRecipes([]);
        setFilteredRecipes([]);
        setIsLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, [user, favorites]);

  useEffect(() => {
    const applyFilters = () => {
      if (filters.types.length === 0 && filters.categories.length === 0) {
        setFilteredRecipes(favoriteRecipes);
      } else {
        const filtered = favoriteRecipes.filter((recipe) => {
          const typeMatch =
            filters.types.length === 0 ||
            (recipe.type &&
              filters.types.some((type) => recipe.type?.includes(type)));
          const categoryMatch =
            filters.categories.length === 0 ||
            (recipe.category &&
              filters.categories.some((category) =>
                recipe.category?.includes(category)
              ));
          return typeMatch && categoryMatch;
        });
        setFilteredRecipes(filtered);
      }
      setCurrentPage(1);
    };

    applyFilters();
  }, [filters, favoriteRecipes]);

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

  const handleFilterChange = (
    filterType: "types" | "categories",
    value: string
  ) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[filterType].includes(value)) {
        updatedFilters[filterType] = updatedFilters[filterType].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[filterType] = [...updatedFilters[filterType], value];
      }
      return updatedFilters;
    });
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

  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const renderContent = () => {
    if (isLoading) {
      return Array(RECIPES_PER_PAGE)
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
        ));
    }

    if (favorites.length === 0) {
      return (
        <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No Favorite Recipes Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start exploring and add recipes to your favorites!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Explore Recipes
          </button>
        </div>
      );
    }

    if (paginatedRecipes.length === 0) {
      return <p>No recipes found matching the selected filters.</p>;
    }

    return paginatedRecipes.map((recipe) => (
      <RecipeCard
        key={recipe.id}
        id={recipe.id}
        name={recipe.name}
        calories={recipe.nutritionFacts?.calories}
        prepTime={recipe.prepTime?.toString() || "N/A"}
        imageUrl={recipe.imageUrls?.[0] || ""}
      />
    ));
  };

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
                {["Vegetarian", "Vegan", "Gluten Free"].map((type) => (
                  <label key={type} className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.types.includes(type)}
                      onChange={() => handleFilterChange("types", type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-gray-600">Category</h3>
              <div className="text-sm space-y-3">
                {["Breakfast", "Lunch", "Dinner", "Dessert"].map((category) => (
                  <label key={category} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={filters.categories.includes(category)}
                      onChange={() =>
                        handleFilterChange("categories", category)
                      }
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 ml-10">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 flex items-center">
                Showing
                <span className="mx-2">
                  <Heart className="h-5 w-5 text-primary" />
                </span>{" "}
                {filteredRecipes.length} of {favoriteRecipes.length} saved
                recipe(s)
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
              {renderContent()}
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
