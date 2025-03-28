import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Search } from 'lucide-react';
import DietTag from "./DieTag";
import Filter from "../assets/icons/Filter";
import Croissant from "../assets/icons/Croissant";
import BentoBox from "../assets/icons/Bento";
import Banana from "../assets/icons/Banana";
import IceCream from "../assets/icons/IceCream";
import MeatOnBone from "../assets/icons/Meat";
import Sushi from "../assets/icons/Sushi";
import Broccoli from "../assets/icons/Broccoli";
import GlutenFreeOutline from "../assets/icons/GluttenFree";
import Tomato from "../assets/icons/Tomato";

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
  onImmediateClear: () => void;
  onSearchSelect: (term: string) => void;
  selectedSearchTerm: string;
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
  onImmediateClear,
  onSearchSelect,
  selectedSearchTerm,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(selectedSearchTerm);

  useEffect(() => {
    setLocalSearchTerm(selectedSearchTerm);
  }, [selectedSearchTerm]);

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
      const newTerm = e.target.value;
      setLocalSearchTerm(newTerm);
      if (newTerm === "") {
        onImmediateClear();
      } else {
        onSearchInputChange(newTerm);
      }
    },
    [onSearchInputChange, onImmediateClear]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    onSearchClear();
  }, [onSearchClear]);

  const handleSearchSelect = useCallback(
    (selectedTerm: string) => {
      setLocalSearchTerm(selectedTerm);
      onSearchSelect(selectedTerm);
      setIsSearchFocused(false);
    },
    [onSearchSelect]
  );

  const handleFilterChange = (
    filterType: "types" | "categories",
    value: string
  ) => {
    if (searchTerm.length === 0) {
      onFilterChange(filterType, value);
    }
  };

  const typeIcons = {
    Vegetarian: Broccoli,
    Vegan: Tomato,
    "Gluten Free": GlutenFreeOutline,
  };

  const categoryIcons = {
    Breakfast: Croissant,
    Lunch: BentoBox,
    "Pre-workout": Banana,
    "Post-workout": MeatOnBone,
    Dinner: Sushi,
    Dessert: IceCream,
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        className="flex items-center gap-2 mt-4 p-2 bg-primary/20 text-sm text-textBlack rounded-sm"
      >
        <span>
          <Filter size="18" />
        </span>
        {isMobileFilterOpen ? "Hide Filters" : "Search / Filter"}
      </button>

      {isMobileFilterOpen && <div className="fixed inset-0 bg-black/20 z-40" />}

      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full bg-background w-80 p-6 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Filter size="22" />
            <h2 className="text-lg font-medium">Search / Filters</h2>
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="font-medium mb-3">Search</h3>
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Browse all recipes"
              className="w-[95%] pl-10 pr-10 py-2 rounded-md border overflow-auto border-gray-300 focus:outline-none placeholder:text-sm focus:ring-2 focus:ring-primary"
              value={localSearchTerm}
              onChange={handleSearchInputChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            />
            {localSearchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
          {isSearchFocused && (
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

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Types</h3>
            {["Vegetarian", "Vegan", "Gluten Free"].map((type) => {
              const IconComponent = typeIcons[type as keyof typeof typeIcons];
              return (
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
                  <IconComponent size="22" />
                  <span>{type}</span>
                  <DietTag type={type} />
                </label>
              );
            })}
          </div>

          <div>
            <h3 className="font-medium mb-3">Category</h3>
            {["Breakfast", "Lunch", "Pre-workout", "Post-workout", "Dinner", "Dessert"].map((category) => {
              const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <label
                  key={category}
                  className="flex items-center text-sm gap-2 mb-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleFilterChange("categories", category)}
                    disabled={searchTerm.length > 0}
                    className="rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <IconComponent size="22" />
                  <span>{category}</span>
                </label>
              );
            })}
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

// {/* 

// // function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
// //   let timeout: ReturnType<typeof setTimeout> | null = null;

// //   return function (this: any, ...args: Parameters<F>) {
// //     const context = this;

// //     if (timeout !== null) {
// //       clearTimeout(timeout);
// //     }
// //     timeout = setTimeout(() => func.apply(context, args), wait);
// //   };
// // } */
// */}

