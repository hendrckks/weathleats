import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Heart, NotebookPen, Target, X } from "lucide-react";
import Sidebar from "../../components/navigation/Sidebar";
import RecipeCard from "../../components/RecipeCard";
import { Link } from "react-router-dom";
import {
  fetchForYouRecipes,
  fetchPaginatedRecipes,
  fetchUserData,
  searchRecipes,
  getTotalRecipesCount,
} from "../../lib/firebase/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import Pagination from "../../components/navigation/Pagination";
import MobileFilters from "../../components/MobileFilters";
import { useAuth } from "../../context/AuthContext";
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
  const [totalPages, setTotalPages] = useState(1);
  const [initialRecipes, setInitialRecipes] = useState<InitialRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<InitialRecipe[]>([]);
  const [forYouRecipes, setForYouRecipes] = useState<InitialRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchWithCache } = useFirebaseCache();
  const RECIPES_PER_PAGE = 30;
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<InitialRecipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isForYou, setIsForYou] = useState(false);
  const { user } = useAuth();
  const [hasTrainingGoal, setHasTrainingGoal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [_searchError, setSearchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("");
  const [_lastVisible, setLastVisible] = useState<any>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  // Prevent multiple renders of the header section
  const headerContent = useMemo(
    () => (
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-4xl md:text-[48px] md:leading-[56px]">
            1000 Plus performance <br className="hidden md:block" />
            driven recipes for
            <span className="text-[#4b5942] ml-3">athletes.</span>
          </h1>
          <div className="mt-6 md:mt-8">
            <p className="font-medium">
              Elevate your performance with precision nutrition.{" "}
              <br className="hidden md:block" />
              Our recipes are tailored for athletes who push{" "}
              <br className="hidden md:block" /> their limits and demand the
              best fuel for optimal results.
            </p>
          </div>
        </div>
        <div className="bg-primary/90 rounded-md w-full h-full md:w-[500px] mt-6 md:mt-0 mx-auto space-y-2 p-2">
          <div className="bg-[#637257] p-4 text-textWhite rounded-md space-y-3 text-xs md:text-sm">
            <div className="flex gap-2 items-center">
              <Target className="h-5" />
              <span>
                Get recipe suggestions according to your Training goals
              </span>
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
            <div
              className="md:p-5 p-3 bg-background w-1/2 text-center md:text-sm text-xs rounded-md cursor-pointer hover:bg-background/90 transition-colors"
            >
              Get full access
            </div>
            <Link
              to="/"
              className="w-1/2 text-center md:p-4 p-3 text-textWhite md:text-sm text-xs cursor-pointer"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    ),
    []
  ); // Empty dependency array since content is static

  const [filters, setFilters] = useState({
    types: [] as string[],
    categories: [] as string[],
  });

  useEffect(() => {
    const checkUserTrainingGoal = async () => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        setHasTrainingGoal(userData?.trainingGoals?.length > 0 || false);
      }
    };
    checkUserTrainingGoal();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", debouncedCheck);

    return () => {
      window.removeEventListener("resize", debouncedCheck);
      clearTimeout(timeoutId);
    };
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

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const { recipes, lastVisible } = await fetchPaginatedRecipes(
          currentPage,
          RECIPES_PER_PAGE
        );
        const mappedRecipes = mapRecipes(recipes);
        setInitialRecipes(mappedRecipes);
        setFilteredRecipes(mappedRecipes);
        setLastVisible(lastVisible);

        // Fetch total count only on the first page load
        if (currentPage === 1) {
          const totalCount = await getTotalRecipesCount();
          setTotalPages(Math.ceil(totalCount / RECIPES_PER_PAGE));
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [currentPage, fetchWithCache]);

  useEffect(() => {
    const applyFilters = (recipes: InitialRecipe[]) => {
      if (filters.types.length > 0 || filters.categories.length > 0) {
        return recipes.filter((recipe) => {
          const typeMatch =
            filters.types.length === 0 ||
            recipe.types.some((type) => filters.types.includes(type));
          const categoryMatch =
            filters.categories.length === 0 ||
            recipe.category.some((cat) => filters.categories.includes(cat));
          return typeMatch && categoryMatch;
        });
      }
      return recipes;
    };

    const recipesToFilter = isForYou ? forYouRecipes : initialRecipes;
    const filtered = applyFilters(recipesToFilter);
    setFilteredRecipes(filtered);
  }, [filters, initialRecipes, isForYou, forYouRecipes]);

  const mapRecipes = useCallback((recipes: any[]): InitialRecipe[] => {
    return recipes.map((recipe: any) => ({
      id: recipe.id,
      name: recipe.name || "Unnamed Recipe",
      calories: recipe.nutritionFacts?.calories || "N/A",
      prepTime: recipe.prepTime?.toString() || "N/A",
      imageUrl: recipe.imageUrls?.[0] || "",
      types: recipe.type || [],
      category: recipe.category || [],
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFilterChange = useCallback(
    (filterType: "types" | "categories", value: string) => {
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
    },
    []
  );

  const handleSearch = useCallback(
    async (term: string, exact: boolean = false) => {
      if (term.length >= 3) {
        setIsLoading(true);
        setIsSearching(true);
        setSearchError(null);
        try {
          const searchResults = await searchRecipes(term, exact);
          const mappedResults = mapRecipes(searchResults);
          setSearchResults(mappedResults);
          setSearchHistory((prev) =>
            [term, ...prev.filter((item) => item !== term)].slice(0, 5)
          );
        } catch (error) {
          console.error("Error searching recipes:", error);
          setSearchError(
            "An error occurred while searching. Please try again."
          );
        } finally {
          setIsLoading(false);
          setIsSearching(false);
        }
      }
    },
    [mapRecipes]
  );

  const handleSearchSelect = useCallback(
    (term: string) => {
      setSelectedSearchTerm(term);
      setSearchTerm(term);
      handleSearch(term, true); // Use exact search when selecting a suggestion
      setIsMobileFilterOpen(false);
    },
    [handleSearch]
  );

  const handleSearchInputChange = useCallback(
    async (term: string) => {
      setSearchTerm(term);
      setSelectedSearchTerm(term);
      if (term.length >= 3) {
        setIsSearching(true);
        setIsLoading(true);
        setSearchError(null);
        try {
          const searchResults = await searchRecipes(term);
          const mappedResults = mapRecipes(searchResults);
          setSearchResults(mappedResults);
          setSearchSuggestions(
            searchResults
              .map((recipe) => recipe.name)
              .filter((name) => name.toLowerCase().includes(term.toLowerCase()))
              .slice(0, 5)
          );
        } catch (error) {
          console.error("Error searching recipes:", error);
          setSearchError(
            "An error occurred while searching. Please try again."
          );
        } finally {
          setIsLoading(false);
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchSuggestions([]);
        setIsSearching(false);
        setFilteredRecipes(isForYou ? forYouRecipes : initialRecipes);
      }
    },
    [mapRecipes, isForYou, forYouRecipes, initialRecipes]
  );

  const handleImmediateClear = useCallback(() => {
    setSearchTerm("");
    setSelectedSearchTerm("");
    setSearchResults([]);
    setSearchSuggestions([]);
    setIsSearching(false);
    setFilteredRecipes(isForYou ? forYouRecipes : initialRecipes);
  }, [isForYou, forYouRecipes, initialRecipes]);

  const handleForYouToggle = useCallback(async () => {
    setIsForYou((prev) => !prev);
    if (!isForYou && user) {
      setIsLoading(true);
      try {
        const forYouRecipes = await fetchForYouRecipes(user.uid);
        const mappedRecipes = mapRecipes(forYouRecipes);
        setForYouRecipes(mappedRecipes);
        setFilteredRecipes(mappedRecipes);
      } catch (error) {
        console.error("Error fetching 'For You' recipes:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredRecipes(initialRecipes);
    }
    // Clear filters when toggling
    setFilters({ types: [], categories: [] });
  }, [isForYou, user, initialRecipes, mapRecipes]);

  const handleSort = useCallback(
    (option: string) => {
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
    },
    [filteredRecipes]
  );

  const clearSort = useCallback(() => {
    setSortOption(null);
    setFilteredRecipes(isForYou ? forYouRecipes : initialRecipes);
  }, [initialRecipes, isForYou, forYouRecipes]);

  const clearFilters = useCallback(() => {
    setFilters({ types: [], categories: [] });
    setFilteredRecipes(isForYou ? forYouRecipes : initialRecipes);
  }, [isForYou, forYouRecipes, initialRecipes]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchSuggestions([]);
    setIsSearching(false);
    // Restore original recipes based on whether it's "For You" or not
    setFilteredRecipes(isForYou ? forYouRecipes : initialRecipes);
  }, [isForYou, forYouRecipes, initialRecipes]);

  const renderMobileFilters = useCallback(
    () => (
      <MobileFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isMobileFilterOpen={isMobileFilterOpen}
        setIsMobileFilterOpen={setIsMobileFilterOpen}
        onClearFilters={clearFilters}
        onSearch={handleSearch}
        onSearchInputChange={handleSearchInputChange}
        onImmediateClear={handleImmediateClear}
        onSearchSelect={handleSearchSelect}
        selectedSearchTerm={selectedSearchTerm}
        searchTerm={searchTerm}
        searchSuggestions={searchSuggestions}
        searchHistory={searchHistory}
        onSearchClear={handleSearchClear}
      />
    ),
    [
      filters,
      handleFilterChange,
      isMobileFilterOpen,
      clearFilters,
      handleSearch,
      handleSearchInputChange,
      handleImmediateClear,
      handleSearchSelect,
      selectedSearchTerm,
      searchTerm,
      searchSuggestions,
      searchHistory,
      handleSearchClear,
    ]
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="hidden md:block">
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onSearchInputChange={handleSearchInputChange}
          onImmediateClear={handleImmediateClear}
          onSearchSelect={handleSearchSelect}
          onClearFilters={clearFilters}
          searchTerm={searchTerm}
          searchSuggestions={searchSuggestions}
          searchHistory={searchHistory}
          selectedSearchTerm={selectedSearchTerm}
        />
      </div>
      <div className="text-textBlack md:ml-[317px] xl:ml-[280px] 2xl:ml-[317px] mb-10">
        <div className="p-4 md:p-10">
          <div className="flex flex-col gap-5">
            {headerContent}
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
            <div className="flex gap-4 items-center mt-2">
              <h2 className="text-xl">
                {isForYou ? "For You Recipes" : "Suggested Recipes"}
              </h2>
              {/* <button onClick={() => migrateRecipes()} className="text-black" >migrate</button> */}
              {hasTrainingGoal && (
                <div className="relative">
                  <button
                    onClick={handleForYouToggle}
                    className={`p-2 w-fit text-sm rounded-sm bg-primary/20 text-textBlack flex items-center cursor-pointer transition-colors ${
                      isForYou
                        ? "bg-gray-200 text-textBlack"
                        : "bg-primary text-textBlack"
                    }`}
                  >
                    {isForYou ? "All Recipes" : "For You"}
                  </button>
                </div>
              )}
            </div>
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
                    <RecipeCard
                      key={recipe.id}
                      {...recipe}
                      isLoading={false}
                      searchTerm={searchTerm}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center">
                    No search results found.
                  </div>
                )
              ) : (
                filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    isLoading={false}
                    searchTerm={searchTerm}
                  />
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
