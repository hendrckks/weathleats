import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  NotebookPen,
  // ShoppingBasket,
  Target,
  X,
} from "lucide-react";
import Sidebar from "../../components/navigation/Sidebar";
import RecipeCard from "../../components/RecipeCard";
import { Link } from "react-router-dom";
import {
  fetchPaginatedRecipes,
  // getTotalRecipesCount,
  searchRecipes,
} from "../../lib/firebase/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import Pagination from "../../components/navigation/Pagination";
import MobileFilters from "../../components/MobileFilters";
// import { migrateRecipes } from "../../lib/migrate";

interface InitialRecipe {
  id: string;
  name: string;
  calories: number | undefined;
  prepTime: string;
  imageUrl: string;
  types: string[];
  category: string[];
}

const Home = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, _setTotalPages] = useState(1);
  const [initialRecipes, setInitialRecipes] = useState<InitialRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<InitialRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWithCache } = useFirebaseCache();
  const RECIPES_PER_PAGE = 30;
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<InitialRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const recipes = await fetchWithCache(
          `recipes-page-${currentPage}`,
          () => fetchPaginatedRecipes(currentPage, RECIPES_PER_PAGE),
          1000 * 60 * 60 // 1 hour
        );
        const mappedRecipes = mapRecipes(recipes);
        setInitialRecipes(mappedRecipes);
        setFilteredRecipes(mappedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [currentPage]);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const recipes = await fetchWithCache(
          `recipes-page-${currentPage}`,
          () => fetchPaginatedRecipes(currentPage, RECIPES_PER_PAGE),
          1000 * 60 * 60 // 1 hour
        );
        const mappedRecipes = mapRecipes(recipes);
        setInitialRecipes(mappedRecipes);
        setFilteredRecipes(mappedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [currentPage]);

  useEffect(() => {
    if (filters.types.length > 0 || filters.categories.length > 0) {
      const filtered = initialRecipes.filter((recipe) => {
        const typeMatch =
          filters.types.length === 0 ||
          recipe.types.some((type) => filters.types.includes(type));
        const categoryMatch =
          filters.categories.length === 0 ||
          recipe.category.some((cat) => filters.categories.includes(cat));
        return typeMatch && categoryMatch;
      });
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(initialRecipes);
    }
  }, [filters, initialRecipes]);

  const mapRecipes = (recipes: any[]): InitialRecipe[] => {
    return recipes.map((recipe: any) => ({
      id: recipe.id,
      name: recipe.name || "Unnamed Recipe",
      calories: recipe.nutritionFacts?.calories || "N/A",
      prepTime: recipe.prepTime?.toString() || "N/A",
      imageUrl: recipe.imageUrls?.[0] || "",
      types: recipe.type || [],
      category: recipe.category || [],
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleSearch = useCallback(async (searchTerm: string) => {
    setIsLoading(true);
    setIsSearching(true);
    try {
      const searchResults = await searchRecipes(searchTerm);
      const mappedResults = mapRecipes(searchResults);
      setSearchResults(mappedResults);
    } catch (error) {
      console.error("Error searching recipes:", error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  const handleSearchInputChange = useCallback(async (searchTerm: string) => {
    if (searchTerm.length >= 4) {
      setIsSearching(true);
      setIsLoading(true);
      try {
        const searchResults = await searchRecipes(searchTerm);
        const mappedResults = mapRecipes(searchResults);
        setSearchResults(mappedResults);
      } catch (error) {
        console.error("Error searching recipes:", error);
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, []);

  const handleSort = (option: string) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    let sortedRecipes = [...filteredRecipes];
    switch (option) {
      case "calories-high-low":
        sortedRecipes.sort((a, b) => (b.calories || 0) - (a.calories || 0));
        break;
      case "calories-low-high":
        sortedRecipes.sort((a, b) => (a.calories || 0) - (b.calories || 0));
        break;
      case "prep-time-low-high":
        sortedRecipes.sort(
          (a, b) => parseInt(a.prepTime) - parseInt(b.prepTime)
        );
        break;
      case "prep-time-high-low":
        sortedRecipes.sort(
          (a, b) => parseInt(b.prepTime) - parseInt(a.prepTime)
        );
        break;
      default:
        break;
    }
    setFilteredRecipes(sortedRecipes);
  };

  const clearSort = () => {
    setSortOption(null);
    setFilteredRecipes([...initialRecipes]);
  };

  const renderMobileFilters = () => (
    <MobileFilters
      filters={filters}
      onFilterChange={handleFilterChange}
      isMobileFilterOpen={isMobileFilterOpen}
      setIsMobileFilterOpen={setIsMobileFilterOpen}
    />
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="hidden md:block">
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onSearchInputChange={handleSearchInputChange}
        />
      </div>
      <div className="text-textBlack md:ml-[317px] xl:ml-[280px] 2xl:ml-[317px] mb-10">
        <div className="p-4 md:p-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <div>
                  <h1 className="text-4xl md:text-5xl">
                    1000 Plus performance <br className="hidden md:block" />
                    driven recipes for
                    <span className="text-[#4b5942] ml-3">athletes.</span>
                  </h1>
                </div>
                <div className="mt-6 md:mt-8">
                  <p className="font-medium">
                    Elevate your performance with precision nutrition.{" "}
                    <br className="hidden md:block" />
                    Our recipes are tailored for athletes who push{" "}
                    <br className="hidden md:block" /> their limits and demand
                    the best fuel for optimal results.
                  </p>
                </div>
              </div>
              <div className="bg-primary/90 rounded-md w-full h-full md:w-[500px] mt-6 md:mt-0 mx-auto space-y-2 p-2">
                <div className="bg-[#637257] p-4 text-textWhite rounded-md space-y-3 text-xs md:text-sm">
                  <div className="flex gap-2 items-center">
                    <Target className="h-5" />
                    <span>Get recipe suggestions according to your goals</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Heart className="h-5" />
                    <span>Save favourite recipes to your profile</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <NotebookPen className="h-5" />
                    <span>Submit your own recipe</span>
                  </div>
                </div>
                <div className="flex">
                  <Link
                    to="/profile"
                    className="md:p-5 p-3 bg-background w-1/2 text-center md:text-sm text-xs rounded-md cursor-pointer hover:bg-background/90 transition-colors"
                  >
                    Get full access
                  </Link>
                  <Link
                    to="/"
                    className="w-1/2 text-center md:p-4 p-3 text-textWhite md:text-sm text-xs cursor-pointer"
                  >
                    Subscribe
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative sort-dropdown flex gap-2 items-center">
              <div
                className={`p-2 w-fit text-sm rounded-sm mt-4 bg-primary/20 text-textBlack flex items-center gap-2 cursor-pointer transition-colors ${
                  isMobile ? "" : "hover:bg-primary/30"
                }`}
                onClick={() => isMobile && setIsDropdownOpen(!isDropdownOpen)}
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
                  className="absolute left-0 top-full text-sm mt-[2px] bg-background border border-primary/40 shadow-lg rounded-sm w-56 py-1 px-1 z-50"
                  onMouseLeave={() => !isMobile && setIsDropdownOpen(false)}
                >
                  <div
                    className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer p-2 ${
                      sortOption === "calories-high-low" ? "bg-primary/20" : ""
                    }`}
                    onClick={() => handleSort("calories-high-low")}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Calories: High - Low
                  </div>
                  <div
                    className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
                      sortOption === "calories-low-high" ? "bg-primary/20" : ""
                    }`}
                    onClick={() => handleSort("calories-low-high")}
                  >
                    <ChevronDown className="h-4 w-4 rotate-180" />
                    Calories: Low - High
                  </div>
                  <div
                    className={`px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
                      sortOption === "prep-time-low-high" ? "bg-primary/20" : ""
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
                      sortOption === "prep-time-high-low" ? "bg-primary/20" : ""
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
              {renderMobileFilters()}
            </div>

            <h2 className="text-xl mt-2">
              {isSearching || searchResults.length > 0
                ? "Search Results"
                : filters.types.length > 0 || filters.categories.length > 0
                ? "Filtered Recipes"
                : "Suggested Recipes"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <RecipeCard
                      key={`skeleton-${index}`}
                      isLoading={true}
                      id=""
                      name=""
                      calories=""
                      prepTime=""
                      imageUrl=""
                    />
                  ))
              ) : isSearching || searchResults.length > 0 ? (
                searchResults.length > 0 ? (
                  searchResults.map((recipe) => (
                    <RecipeCard key={recipe.id} {...recipe} isLoading={false} />
                  ))
                ) : (
                  <div className="col-span-full text-center">
                    No search results found.
                  </div>
                )
              ) : (
                filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} {...recipe} isLoading={false} />
                ))
              )}
            </div>
            {!isSearching && searchResults.length === 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
