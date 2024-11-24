import { useState } from "react";
import { Minus, Plus, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Recipe } from "../../types/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import DietTag from "../../components/DieTag";

interface RecipeInfoProps {
  recipe: Recipe;
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({ recipe }) => {
  const [servings, setServings] = useState(1);
  const [isMetric, setIsMetric] = useState(true);
  const { isValidCache } = useFirebaseCache();
  const navigate = useNavigate();

  const isCached = isValidCache(recipe.id);

  const toggleMetricUnits = () => {
    setIsMetric(!isMetric);
  };

  const formatMeasurementAndUnit = (measurement: number, unit: string) => {
    let formattedMeasurement = measurement * servings;
    let formattedUnit = unit;

    if (!isMetric) {
      switch (unit.toLowerCase()) {
        case "g":
          formattedMeasurement = formattedMeasurement / 28.34952;
          formattedUnit = "oz";
          break;
        case "ml":
          formattedMeasurement = formattedMeasurement / 29.5735;
          formattedUnit = "fl oz";
          break;
        case "kg":
          formattedMeasurement = formattedMeasurement * 2.20462;
          formattedUnit = "lb";
          break;
        case "l":
          formattedMeasurement = formattedMeasurement * 4.22675;
          formattedUnit = "cups";
          break;
      }
    }

    return {
      value: formattedMeasurement.toFixed(1),
      unit: formattedUnit,
    };
  };

  return (
    <div className="py-14 mx-auto text-sm rounded-sm md:max-w-7xl max-w-full min-h-screen px-4 md:px-8 lg:px-16">
      {isCached && (
        <div className="bg-transparent text-transparent hidden px-4 py-2 rounded-md mb-4">
          This recipe information is cached for faster loading.
        </div>
      )}
      <div className="space-y-5 pt-4 md:pt-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-base text-textBlack ound hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          back
        </button>
        <div className="p-2 bg-primary/20 w-fit text-xs text-textBlack">
          {recipe.category?.[0] || "Uncategorized"}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-3xl md:text-5xl mb-4 md:mb-0">
            {recipe.name.charAt(0).toUpperCase() + recipe.name.slice(1)}
          </h1>

          {/* <div className="group flex items-center">
            <Share className="text-textBlack text-xl md:text-2xl cursor-pointer" />
            <p className="relative group-hover:text-textBlack/60 font-semibold ml-2 transition-colors ease-in-out">
              Share
            </p>
          </div> */}
        </div>
        <div className="w-full md:w-1/3">
          <p className="text-base text-textBlack">{recipe.description}</p>
        </div>
        <div>
          <div className="flex flex-wrap gap-4 items-center">
            {recipe.type?.map((type: string) => (
              <DietTag key={type} type={type} />
            ))}
            <div className="flex items-center text-textBlack">
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
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
              <span className="ml-1">{recipe.prepTime} mins</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 md:gap-24 mt-5">
        <div className="h-[300px] md:h-[480px] mt-5 w-full md:w-[750px]">
          <img
            src={recipe.imageUrls?.[0] || "/placeholder.svg"}
            className="h-full w-full object-cover rounded-md"
            alt={recipe.name}
          />
        </div>
        <div className="w-full md:w-1/2">
          <div className="space-y-8">
            {/* Meal Benefits Section */}
            <div>
              <h3 className="text-lg text-textBlack mb-4">Meal benefits</h3>
              <div className="space-y-4">
                {recipe.mealBenefits?.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start pb-4 border-b border-gray-200"
                  >
                    <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Facts Section */}
            <div className="bg-primary rounded-lg p-6">
              <h3 className="text-lg text-textWhite mb-4">
                Nutrition facts{" "}
                <span className="text-sm text-textWhite/80">(per serving)</span>
              </h3>
              <div className="space-y-3">
                {recipe.nutritionFacts &&
                  Object.entries(recipe.nutritionFacts)
                    .filter(([_, value]) => value !== 0)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-textWhite items-center py-2"
                      >
                        <span className="capitalize">{key}</span>
                        <span className="font-medium">
                          {value}
                          {key === "calories" ? "" : "g"}
                        </span>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 md:mt-28">
        <div className="flex flex-col md:flex-row gap-8 md:gap-40 border-t py-8 md:py-20 border-t-primary">
          <div className="w-full md:w-[400px]">
            <h2 className="text-xl font-medium text-textBlack mb-4">
              Ingredients
            </h2>
            <div className="bg-primary rounded-lg p-6 text-white/90">
              {/* Serving Controls */}
              <div className="flex flex-col md:flex-row md:mx-8 justify-between items-center mb-6">
                <div className="flex flex-col items-center gap-4 mb-4 md:mb-0">
                  <span>Serving</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="hover:bg-white/20 rounded p-1 transition-colors"
                      aria-label="Decrease servings"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="bg-white/20 px-3 py-1 rounded">
                      {servings}
                    </span>
                    <button
                      onClick={() => setServings(servings + 1)}
                      className="hover:bg-white/20 rounded p-1 transition-colors"
                      aria-label="Increase servings"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  <motion.div
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>Unit</span>
                    <div className="flex items-center gap-1 bg-white/20 p-1 rounded">
                      <motion.button
                        className={`px-2 py-1 rounded cursor-pointer ${
                          isMetric ? "bg-white text-[#6B7B5F]" : ""
                        }`}
                        onClick={toggleMetricUnits}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={isMetric}
                      >
                        Metric
                      </motion.button>
                      <motion.button
                        className={`px-2 py-1 rounded cursor-pointer ${
                          !isMetric ? "bg-white text-[#6B7B5F]" : ""
                        }`}
                        onClick={toggleMetricUnits}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={!isMetric}
                      >
                        Imperial
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Ingredients List */}
              <div className="space-y-4">
                {recipe.ingredients?.map((ingredient, index) => {
                  const { value, unit } = formatMeasurementAndUnit(
                    ingredient.measurement,
                    ingredient.unit
                  );
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-white/20 pb-3"
                    >
                      <span className="font-medium">
                        {value} {unit}
                      </span>
                      <span className="text-white/70">{ingredient.item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="flex-1">
            <h2 className="text-xl font-medium text-textBlack mb-4">
              Instructions
            </h2>
            <div className="space-y-12">
              {recipe.instructions?.map((instruction, index) => (
                <div key={index}>
                  <div className="text-base text-gray-500 mb-2">
                    Step {instruction.step}/{recipe.instructions?.length}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {instruction.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-8 items-center text-lg mt-8">
        <div className="">
          <Link to="/login" className="text-primary underline">
            Login
          </Link>
          <span className="ml-2">to join the conversation</span>
        </div>
        <div className="text-textBlack">0 Comments</div>
        <div className="py-12 px-4 md:px-20 bg-primary/15 text-textBlack md:w-1/3 w-2/3 md:text-base text-sm rounded-md text-center">
          Be the first to comment
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;
