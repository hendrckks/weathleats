import { useState } from "react";
import {
  ChevronDown,
  Heart,
  NotebookPen,
  ShoppingBasket,
  Target,
} from "lucide-react";
// import IngredientsCard from "../../components/IngredientsCard";
import Sidebar from "../../components/navigation/Sidebar";
import RecipeCard from "../../components/RecipeCard";
import { Link } from "react-router-dom";

const Home = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen pt-20">
      <Sidebar />
      <div className="text-textBlack ml-[317px] mb-10">
        <div className="p-10">
          <div className="flex flex-col gap-5">
            <div className="flex justify-between">
              <div>
                <div>
                  <h1 className="text-5xl">
                    1000 Plus performance <br /> driven recipes for <span className="text-[#4b5942]">athletes.</span>
                  </h1>
                </div>
                <div className="mt-8">
                  <p className="font-medium">
                    Elevate your performance with precision nutrition. <br />
                    Our recipes are tailored for athletes who push <br /> their
                    limits and demand the best fuel for optimal results.
                  </p>
                </div>
              </div>
              <div className="bg-primary/90 rounded-md w-[500px] h-full mx-auto space-y-2 p-2">
                <div className="bg-[#637257] p-5 text-textWhite rounded-md space-y-3 text-sm">
                  <div className="flex gap-2 items-center">
                    <ShoppingBasket className="h-5"/>
                    <span>Generate grocery lists</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Target className="h-5"/>
                    <span>Get recipe suggestions according to your goals</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Heart className="h-5"/>
                    <span>Save favourite recipes to your profile</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <NotebookPen className="h-5"/>
                    <span>Submit your own recipe</span>
                  </div>
                </div>
                <div className="flex">
                  <Link
                    to="/profile"
                    className="p-4 bg-background w-1/2 text-center text-sm rounded-md cursor-pointer hover:bg-background/90 transition-colors"
                  >
                    Get full access
                  </Link>
                  <div className="w-1/2 text-center p-4 text-textWhite text-sm cursor-pointer">
                    Subscribe
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div
                className="p-2 w-fit text-sm rounded-sm mt-4 bg-primary/20 text-textBlack flex items-center gap-2 cursor-pointer hover:bg-primary/30 transition-colors"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                Sort by
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 top-full mt-[2px] bg-background border border-primary/40 shadow-lg rounded-sm w-56 py-1 px-1 z-50">
                    <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer p-2">
                      <ChevronDown className="h-4 w-4" />
                      Calories: High - Low
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                      <ChevronDown className="h-4 w-4 rotate-180" />
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

            <h2 className="text-2xl mt-4">Suggested Recipes</h2>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-10">
            <RecipeCard />
            <RecipeCard />
            <RecipeCard />
            <RecipeCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
