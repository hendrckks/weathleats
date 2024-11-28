import { Search, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  filters: {
    types: string[];
    categories: string[];
  };
  onFilterChange: (filterType: "types" | "categories", value: string) => void;
  onSearch: (searchTerm: string) => void;
  onSearchInputChange: (term: string) => void;
  onImmediateClear: () => void;
  onClearFilters: () => void;
  searchTerm: string;
  searchSuggestions: string[];
  searchHistory: string[];
  selectedSearchTerm: string;
  onSearchSelect: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onSearchInputChange,
  onImmediateClear,
  searchSuggestions,
  searchHistory,
  selectedSearchTerm,
  onSearchSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState(selectedSearchTerm);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(selectedSearchTerm);
  }, [selectedSearchTerm]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.length >= 3) {
        onSearch(searchTerm);
        navigate("/");
      }
    },
    [searchTerm, onSearch, navigate]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    if (newTerm === "") {
      onImmediateClear();
    } else {
      onSearchInputChange(newTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onImmediateClear();
  };

  const handleSearchItemSelect = (term: string) => {
    setSearchTerm(term);
    onSearchSelect(term);
    setIsSearchFocused(false);
  };

  return (
    <div className="fixed left-0 top-0 flex h-[100vh] w-72 flex-col bg-background border-r border-r-primary/50 p-6 space-y-6">
      {/* Search Section */}
      <div className="space-y-2 mt-24">
        <h2 className="text-sm font-medium">Search</h2>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Browse all recipes"
            className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none placeholder:text-sm focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>
        {isSearchFocused &&
          (searchSuggestions.length > 0 || searchHistory.length > 0) && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-[350px] overflow-auto">
              {searchSuggestions.length > 0 && (
                <div>
                  <h3 className="px-4 py-2 text-sm font-medium text-textBlack underline">
                    Suggestions
                  </h3>
                  <ul>
                    {searchSuggestions.map((suggestion, index) => (
                      <li
                        key={`suggestion-${index}`}
                        className="px-4 py-2 hover:bg-gray-100 text-sm text-gray-600 cursor-pointer"
                        onClick={() => handleSearchItemSelect(suggestion)}
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
                        onClick={() => handleSearchItemSelect(historyItem)}
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

      {/* Types Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Types</h2>
        <div className="space-y-3 text-sm text-textBlack">
          {["Vegetarian", "Vegan", "Gluten Free"].map((type) => (
            <label key={type} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-primary/50 text-primary focus:ring-primary"
                checked={filters.types.includes(type)}
                onChange={() => onFilterChange("types", type)}
              />
              <span>{type}</span>
              <span
                className={`text-xs ${
                  type === "Vegetarian"
                    ? "bg-[#f3ca96]"
                    : type === "Vegan"
                    ? "bg-[#6a4731]"
                    : "bg-[#6b6b71]"
                } text-white px-1.5 py-0.5 rounded`}
              >
                {type === "Vegetarian" ? "V" : type === "Vegan" ? "Ve" : "GF"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Category</h2>
        <div className="space-y-3 text-textBlack text-sm">
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
                checked={filters.categories.includes(category)}
                onChange={() => onFilterChange("categories", category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* newsletter - Updated positioning */}
      <div className="fixed bottom-8 left-6 w-60 hidden 2xl:block">
        <div className="p-5 space-y-3 bg-primary/20 rounded-md">
          <p className="text-textBlack text-base">Subscribe to newsletter</p>
          <div className="p-4 bg-[#637257] space-y-5 rounded-md">
            <p className="text-sm text-textWhite">
              Get new recipe alerts and tips to your inbox daily
            </p>
            <div className="bg-white p-3 text-sm text-center rounded-md text-textBlack hover:bg-background/90 transition-colors cursor-pointer font-medium">
              Subscribe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
