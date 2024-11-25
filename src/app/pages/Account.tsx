import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavouritesContext";
import RecipeCard from "../../components/RecipeCard";
import { signOut } from "../../lib/firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { fetchRecipesByIds } from "../../lib/firebase/firestore";
import { Recipe } from "../../types/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import Pagination from "../../components/navigation/Pagination";
import { Loader2, Heart, ChevronDown, X } from "lucide-react";
import ErrorBoundary from "../../components/ErrorBoundary";
import DietTag from "../../components/DieTag";

const RECIPES_PER_PAGE = 8;

const Account: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites } = useFavorites();
  const memoizedFavorites = useMemo(() => favorites, [favorites]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { fetchWithCache } = useFirebaseCache();
  const [sortOption, setSortOption] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && event.target instanceof Node) {
        const dropdownElement = document.querySelector(".sort-dropdown");
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const [filters, setFilters] = useState({
    types: [] as string[],
    categories: [] as string[],
  });

  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

  const fetchFavoriteRecipes = useCallback(async () => {
    if (user && memoizedFavorites.length > 0) {
      try {
        const recipes = await fetchWithCache(
          `favorite-recipes-${memoizedFavorites.join("-")}`,
          () => fetchRecipesByIds(memoizedFavorites),
          1000 * 60 * 5 // 5 minutes cache
        );
        setFavoriteRecipes(recipes);
        setFilteredRecipes(recipes);
      } catch (error) {
        console.error("Error fetching favorite recipes:", error);
      }
    } else {
      setFavoriteRecipes([]);
      setFilteredRecipes([]);
    }
  }, [user, memoizedFavorites, fetchWithCache]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchFavoriteRecipes();
    }
  }, [authLoading, user, fetchFavoriteRecipes]);

  const applyFilters = useCallback(() => {
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
  }, [filters, favoriteRecipes]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSignOut = async () => {
    try {
      await signOut();
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
    if (favorites.length === 0) {
      return (
        <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-textBlack mb-2">
            No Favorite Recipes Yet
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Start exploring and add recipes to your favorites!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-sm text-white rounded-md hover:bg-primary/90 transition-colors"
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

  const handleSort = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    let sortedRecipes = [...filteredRecipes];
    switch (option) {
      case "calories-high-low":
        sortedRecipes.sort(
          (a, b) =>
            (b.nutritionFacts?.calories || 0) -
            (a.nutritionFacts?.calories || 0)
        );
        break;
      case "calories-low-high":
        sortedRecipes.sort(
          (a, b) =>
            (a.nutritionFacts?.calories || 0) -
            (b.nutritionFacts?.calories || 0)
        );
        break;
      case "prep-time-low-high":
        sortedRecipes.sort((a, b) => (a.prepTime || 0) - (b.prepTime || 0));
        break;
      case "prep-time-high-low":
        sortedRecipes.sort((a, b) => (b.prepTime || 0) - (a.prepTime || 0));
        break;
      default:
        break;
    }
    setFilteredRecipes(sortedRecipes);
  };

  const clearSort = () => {
    setSortOption(null);
    setFilteredRecipes([...favoriteRecipes]);
  };

  const renderMobileFilters = () => (
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        className="flex items-center gap-2 p-2 bg-primary/30 text-sm text-textBlack rounded-sm mb-4"
      >
        {isMobileFilterOpen ? "Hide Filters" : "Show Filters"}
      </button>
      {isMobileFilterOpen && (
        <div className="bg-background p-4 rounded-md shadow-md mb-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Types</h3>
              {["Vegetarian", "Vegan", "Gluten Free"].map((type) => (
                <label
                  key={type}
                  className="flex items-center text-sm gap-2 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => handleFilterChange("types", type)}
                  />
                  <span>{type}</span>
                  <DietTag type={type} />
                </label>
              ))}
            </div>
            <div>
              <h3 className="font-medium mb-2">Category</h3>
              {["Breakfast", "Lunch", "Dinner", "Dessert"].map((category) => (
                <label
                  key={category}
                  className="flex items-center text-sm gap-2 mb-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleFilterChange("categories", category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8 lg:p-16 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 md:gap-20 mx-1 mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <h1 className="text-3xl md:text-5xl font-medium text-gray-800 mb-4 md:mb-0">
              Your Profile
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                    {user?.displayName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </div>
                )}
                <div>
                  <h2 className="font-medium">
                    {user?.displayName || user?.email}
                  </h2>
                  <p className="text-sm text-gray-600">Joined {joinedDate}</p>
                </div>
              </div>
              <Link
                to="/account"
                className="px-4 py-2 bg-gray-100 rounded-[4px] text-sm hover:bg-gray-200 transition-colors"
              >
                Edit Account
              </Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between">
            {renderMobileFilters()}
            <div className="hidden md:block space-y-6 mt-2">
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
                      <DietTag type={type} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-gray-600">Category</h3>
                <div className="text-sm space-y-3">
                  {["Breakfast", "Lunch", "Dinner", "Dessert"].map(
                    (category) => (
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
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 md:ml-10">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 md:text-base text-xs flex items-center">
                  Showing
                  <span className="mx-2">
                    <Heart className="h-5 w-5 text-primary" />
                  </span>
                  {filteredRecipes.length} of {favoriteRecipes.length} saved
                  recipe(s)
                </p>
                <div className="relative sort-dropdown">
                  <div
                    className={`p-2 w-fit text-sm rounded-sm bg-primary/20 text-textBlack flex items-center gap-2 cursor-pointer transition-colors ${
                      isMobile ? "" : "hover:bg-primary/30"
                    }`}
                    onClick={() =>
                      isMobile && setIsDropdownOpen(!isDropdownOpen)
                    }
                    onMouseEnter={() => !isMobile && setIsDropdownOpen(true)}
                  >
                    {sortOption ? (
                      <>
                        <span>{sortOption}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSort();
                            setIsDropdownOpen(false);
                          }}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        Sort by
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </div>
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-[2px] bg-background border text-sm border-primary/40 shadow-lg rounded-sm w-56 py-1 px-1 z-50"
                      onMouseLeave={() => !isMobile && setIsDropdownOpen(false)}
                    >
                      <div
                        className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer p-2 ${
                          sortOption === "calories-high-low"
                            ? "bg-primary/20"
                            : ""
                        }`}
                        onClick={() => handleSort("calories-high-low")}
                      >
                        <ChevronDown className="h-4 w-4" />
                        Calories: High - Low
                      </div>
                      <div
                        className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
                          sortOption === "calories-low-high"
                            ? "bg-primary/20"
                            : ""
                        }`}
                        onClick={() => handleSort("calories-low-high")}
                      >
                        <ChevronDown className="h-4 w-4 rotate-180" />
                        Calories: Low - High
                      </div>
                      <div
                        className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
                          sortOption === "prep-time-low-high"
                            ? "bg-primary/20"
                            : ""
                        }`}
                        onClick={() => handleSort("prep-time-low-high")}
                      >
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
                      <div
                        className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
                          sortOption === "prep-time-high-low"
                            ? "bg-primary/20"
                            : ""
                        }`}
                        onClick={() => handleSort("prep-time-high-low")}
                      >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
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
    </ErrorBoundary>
  );
};

export default React.memo(Account);
