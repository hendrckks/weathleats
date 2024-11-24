import { useState } from "react";
import { Share, Minus, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../../components/Container";
import { Recipe } from "../../types/firestore";
import { useFirebaseCache } from "../../lib/cache/cacheUtils";
import DietTag from "../../components/DieTag";

interface RecipeInfoProps {
  recipe: Recipe;
}

// Define unit conversion thresholds and relationships
const UNIT_CONVERSIONS = {
  ml: { threshold: 1000, convertTo: "l", ratio: 1000 },
  g: { threshold: 1000, convertTo: "kg", ratio: 1000 },
  l: { threshold: 0.001, convertTo: "ml", ratio: 1000 },
  kg: { threshold: 0.001, convertTo: "g", ratio: 1000 },
};

// Define metric to imperial conversion ratios
const METRIC_TO_IMPERIAL = {
  g: { unit: "oz", ratio: 0.03527396 }, // 1g = 0.03527396 oz
  kg: { unit: "lb", ratio: 2.20462 }, // 1kg = 2.20462 lbs
  ml: { unit: "fl oz", ratio: 0.033814 }, // 1ml = 0.033814 fl oz
  l: { unit: "fl oz", ratio: 33.814 }, // 1l = 33.814 fl oz
};

// const IMPERIAL_TO_METRIC = {
//   oz: { unit: "g", ratio: 28.3495 }, // 1oz = 28.3495g
//   lb: { unit: "kg", ratio: 0.453592 }, // 1lb = 0.453592kg
//   "fl oz": { unit: "ml", ratio: 29.5735 }, // 1 fl oz = 29.5735ml
// };

const RecipeInfo: React.FC<RecipeInfoProps> = ({ recipe }) => {
  const [servings, setServings] = useState(1);
  const [isMetric, setIsMetric] = useState(true);
  const { isValidCache } = useFirebaseCache();

  const toggleMetricUnits = () => {
    setIsMetric(!isMetric);
  };

  // const dietTypeAbbreviations: Record<string, string> = {
  //   Vegetarian: "V",
  //   Vegan: "Ve",
  //   "Gluten Free": "GF",
  // };

  const isCached = isValidCache(`recipe_${recipe.id}`);

  // Function to convert units based on measurement system
  const convertUnit = (
    measurement: number,
    unit: string
  ): { value: number; unit: string } => {
    const normalizedUnit = unit.toLowerCase();

    // If we're using metric units
    if (isMetric) {
      const conversion =
        UNIT_CONVERSIONS[normalizedUnit as keyof typeof UNIT_CONVERSIONS];

      if (!conversion) {
        return { value: measurement, unit };
      }

      // Convert to larger metric unit if threshold met
      if (measurement >= conversion.threshold) {
        return {
          value: measurement / conversion.ratio,
          unit: conversion.convertTo,
        };
      }
    }
    // If we're using imperial units
    else {
      const metricToImperial =
        METRIC_TO_IMPERIAL[normalizedUnit as keyof typeof METRIC_TO_IMPERIAL];

      if (metricToImperial) {
        // Convert from metric to imperial
        return {
          value: measurement * metricToImperial.ratio,
          unit: metricToImperial.unit,
        };
      }
    }

    return { value: measurement, unit };
  };

  // Calculate adjusted measurements based on servings and handle unit conversion
  const calculateAdjustedMeasurement = (
    measurement: number,
    unit: string,
    servings: number
  ) => {
    const totalAmount = measurement * servings;
    const converted = convertUnit(totalAmount, unit);

    return {
      value: Number(converted.value.toFixed(2)),
      unit: converted.unit,
    };
  };

  // Format the measurement and unit for display
  const formatMeasurementAndUnit = (
    measurement: string | number,
    unit: string
  ) => {
    const numericMeasurement = Number(measurement);

    if (isNaN(numericMeasurement)) {
      return { value: measurement, unit };
    }

    return calculateAdjustedMeasurement(numericMeasurement, unit, servings);
  };

  return (
    <Container className="py-14 mx-auto text-sm rounded-sm min-h-screen">
      {isCached && (
        <div className="bg-transparent text-transparent hidden px-4 py-2 rounded-md mb-4">
          This recipe information is cached for faster loading.
        </div>
      )}
      <div className="space-y-5 pt-16">
        <div className="p-2 bg-primary/20 w-fit text-xs text-textBlack">
          {recipe.category?.[0] || "Uncategorized"}
        </div>
        <div className="justify-between flex">
          <h1 className="text-5xl">
            {recipe.name.charAt(0).toUpperCase() + recipe.name.slice(1)}
          </h1>

          <div className="group flex">
            <Share className="text-textBlack text-2xl cursor-pointer" />
            <p className="relative group-hover:text-textBlack/60 font-semibold left-2 bottom-4 transition-colors ease-in-out text-transparent">
              Share
            </p>
          </div>
        </div>
        <div className="w-1/3">
          <p className="text-base text-textBlack">{recipe.description}</p>
        </div>
        <div>
          <div className="flex gap-4 items-center">
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
      <div className="flex gap-24 mt-5">
        <div className="h-[480px] mt-5">
          <img
            src={recipe.imageUrls?.[0] || "/placeholder.svg"}
            className="h-full object-cover w-[750px] rounded-md"
            alt={recipe.name}
          />
        </div>
        <div className="w-1/2">
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
      <div className="mt-28">
        <div className="flex gap-40 border-t py-20 border-t-primary">
          <div className="w-[400px]">
            <h2 className="text-xl font-medium text-textBlack mb-4">
              Ingredients
            </h2>
            <div className="bg-primary rounded-lg p-6 text-white/90">
              {/* Serving Controls */}
              <div className="flex mx-8 justify-between items-center mb-6">
                <div className="flex flex-col items-center gap-4">
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
      <div className="flex flex-col space-y-8 items-center text-lg">
        <div className="">
          <Link to="/login" className="text-primary underline">
            Login
          </Link>
          <span className="ml-2">to join the conversation</span>
        </div>
        <div className="text-textBlack">0 Comments</div>
        <div className="py-12 px-20 bg-primary/15 text-textBlack">
          Be the first to comment
        </div>
      </div>
    </Container>
  );
};

export default RecipeInfo;
