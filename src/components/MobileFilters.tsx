import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Search } from "lucide-react";
import DietTag from "./DieTag";

interface MobileFiltersProps {
  filters: {
    types: string[];
    categories: string[];
  };
  onFilterChange: (filterType: "types" | "categories", value: string) => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (isOpen: boolean) => void;
  onClearFilters: () => void;
  onSearch: (searchTerm: string) => void;
  onSearchInputChange: (searchTerm: string) => void;
  searchTerm: string;
  searchSuggestions: string[];
  searchHistory: string[];
  onSearchClear: () => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  filters,
  onFilterChange,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  onClearFilters,
  onSearch,
  onSearchInputChange,
  searchTerm,
  searchSuggestions,
  searchHistory,
  onSearchClear,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsMobileFilterOpen(false);
      }
    };

    if (isMobileFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileFilterOpen, setIsMobileFilterOpen]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (localSearchTerm.length >= 3) {
        onSearch(localSearchTerm);
        setIsMobileFilterOpen(false);
      }
    },
    [localSearchTerm, onSearch, setIsMobileFilterOpen]
  );

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setLocalSearchTerm(term);
      onSearchInputChange(term);
    },
    [onSearchInputChange]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    onSearchClear();
  }, [onSearchClear]);

  const handleSearchSelect = useCallback(
    (selectedTerm: string) => {
      setLocalSearchTerm(selectedTerm); // This line sets the input value
      onSearchInputChange(selectedTerm);
      onSearch(selectedTerm);
      setIsMobileFilterOpen(false);
    },
    [onSearchInputChange, onSearch, setIsMobileFilterOpen]
  );

  const handleFilterChange = (
    filterType: "types" | "categories",
    value: string
  ) => {
    if (searchTerm.length === 0) {
      onFilterChange(filterType, value);
    }
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        className="flex items-center gap-2 mt-4 p-2 bg-primary/20 text-sm text-textBlack rounded-sm"
      >
        {isMobileFilterOpen ? "Hide Filters" : "Search / Filter"}
      </button>

      {/* Overlay */}
      {isMobileFilterOpen && <div className="fixed inset-0 bg-black/20 z-40" />}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full bg-background w-80 p-6 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Filters</h2>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Section */}
        <div className="space-y-2 mb-6">
          <h3 className="font-medium mb-3">Search</h3>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Browse all recipes"
              className="w-[95%] pl-10 pr-4 py-2 rounded-md border overflow-auto border-gray-300 focus:outline-none placeholder:text-sm focus:ring-2 focus:ring-primary"
              value={localSearchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {localSearchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="h-6 w-6 relative left-6 text-textBlack" />
              </button>
            )}
          </form>
          {isSearchFocused &&
            (searchSuggestions.length > 0 || searchHistory.length > 0) && (
              <div className="absolute right-1 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                {searchSuggestions.length > 0 && (
                  <div>
                    <h3 className="px-4 py-2 text-sm font-medium text-gray-500 underline">
                      Suggestions
                    </h3>
                    <ul>
                      {searchSuggestions.map((suggestion, index) => (
                        <li
                          key={`suggestion-${index}`}
                          className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-600 cursor-pointer"
                          onClick={() => handleSearchSelect(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchHistory.length > 0 && (
                  <div>
                    <h3 className="px-4 py-2 text-sm font-medium text-textBlack underline">
                      Recent Searches
                    </h3>
                    <ul>
                      {searchHistory.map((historyItem, index) => (
                        <li
                          key={`history-${index}`}
                          className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-600 cursor-pointer"
                          onClick={() => handleSearchSelect(historyItem)}
                        >
                          {historyItem}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
        </div>

        {/* Rest of the component remains the same */}
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Types</h3>
            {["Vegetarian", "Vegan", "Gluten Free"].map((type) => (
              <label
                key={type}
                className="flex items-center text-sm gap-2 mb-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => handleFilterChange("types", type)}
                  disabled={searchTerm.length > 0}
                  className="rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span>{type}</span>
                <DietTag type={type} />
              </label>
            ))}
          </div>

          <div>
            <h3 className="font-medium mb-3">Category</h3>
            {["Breakfast", "Lunch", "Dinner", "Dessert"].map((category) => (
              <label
                key={category}
                className="flex items-center text-sm gap-2 mb-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.types.includes(category)}
                  onChange={() => handleFilterChange("types", category)}
                  disabled={searchTerm.length > 0}
                  className="rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={onClearFilters}
          className="mt-6 w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default MobileFilters;

// function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
//   let timeout: ReturnType<typeof setTimeout> | null = null;

//   return function (this: any, ...args: Parameters<F>) {
//     const context = this;

//     if (timeout !== null) {
//       clearTimeout(timeout);
//     }
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
// }
