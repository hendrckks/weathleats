import { Search } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="fixed left-0 top-0 flex h-[100vh] w-72 flex-col bg-background border-r border-r-primary/50 p-6 space-y-6">
      {/* Search Section */}
      <div className="space-y-2 mt-24">
        <h2 className="text-sm font-medium">Search</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Browse all recipes"
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none placeholder:text-sm focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Types Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Types</h2>
        <div className="space-y-3 text-sm text-textBlack">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Vegetarian</span>
            <span className="text-xs bg-[#f3ca96] text-white px-1.5 py-0.5 rounded">
              V
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Vegan</span>
            <span className="text-xs bg-[#6a4731] text-white px-1.5 py-0.5 rounded">
              Ve
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Gluten Free</span>
            <span className="text-xs bg-[#6b6b71] text-white px-1.5 py-0.5 rounded">
              GF
            </span>
          </label>
        </div>
      </div>

      {/* Category Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium">Category</h2>
        <div className="space-y-3 text-textBlack text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Breakfast</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Lunch</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Pre-workout</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Post-workout</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Dinner</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-primary/50 text-primary focus:ring-primary"
            />
            <span>Dessert</span>
          </label>
        </div>
      </div>

      {/* newsletter - Updated positioning */}
      <div className="fixed bottom-10 left-6 w-60">
        <div className="p-5 space-y-3 bg-primary/20 rounded-md">
          <p className="text-textBlack text-base">Subscribe to newsletter</p>
          <div className="p-4 bg-[#667259] space-y-5 rounded-md">
            <p className="text-sm text-white/90">
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