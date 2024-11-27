import { useEffect, useRef } from "react";
import { X } from "lucide-react";
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
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  filters,
  onFilterChange,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
}) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
        className="flex items-center gap-2 mt-4 p-2 bg-primary/20 text-sm text-textBlack rounded-sm "
      >
        {isMobileFilterOpen ? "Hide Filters" : "Show Filters"}
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
                  onChange={() => onFilterChange("types", type)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
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
                  checked={filters.categories.includes(category)}
                  onChange={() => onFilterChange("categories", category)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFilters;
