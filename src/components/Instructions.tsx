import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Instructions = () => {
  const [servings, setServings] = useState(1);
  const [isMetric, setIsMetric] = useState(true);

  const toggleMetricUnits = () => {
    setIsMetric(!isMetric);
  };

  return (
    <div className="flex gap-40 border-t py-20 border-t-primary">
      {/* Ingredients Section */}
      <div className="w-[400px]">
        <h2 className="text-xl font-medium text-textBlack mb-4">Ingredients</h2>
        <div className="bg-primary rounded-lg p-6 text-white/90">
          {/* Serving Controls */}
          <div className="flex mx-8 justify-between items-center mb-6">
            <div className="flex flex-col items-center gap-4">
              <span>Serving</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="bg-white/20 px-3 py-1 rounded">
                  {servings}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
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
                  <motion.span
                    className={`px-2 py-1 rounded cursor-pointer ${
                      isMetric ? "bg-white text-[#6B7B5F]" : ""
                    }`}
                    onClick={toggleMetricUnits}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Metric
                  </motion.span>
                  <motion.span
                    className={`px-2 py-1 rounded cursor-pointer ${
                      !isMetric ? "bg-white text-[#6B7B5F]" : ""
                    }`}
                    onClick={toggleMetricUnits}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Imperial
                  </motion.span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Ingredients List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/20 mt-10 pb-3">
              <span className="font-medium">100 g</span>
              <span className="text-white/70">
                firm tofu, sliced into one cm rectangles
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">3 tbsp</span>
              <span className="text-white/70">
                all-purpose flour, save 1 tsp for curry
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">1 mL</span>
              <span className="text-white/70">egg, beaten</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">30 g</span>
              <span className="text-white/70">panko bread crumbs</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">1 tbsp</span>
              <span className="text-white/70">avocado oil</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">0.5 mL</span>
              <span className="text-white/70">small onion, finely chopped</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">30 g</span>
              <span className="text-white/70">potato, finely diced</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">30 g</span>
              <span className="text-white/70">carrot, finely diced</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">1 tsp</span>
              <span className="text-white/70">garlic clove, minced</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">1 tsp</span>
              <span className="text-white/70">curry powder</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">1 tsp</span>
              <span className="text-white/70">soy sauce</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">75 g</span>
              <span className="text-white/70">cooked rice</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/20 pb-3">
              <span className="font-medium">150 mL</span>
              <span className="text-white/70">vegetable broth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="flex-1">
        <h2 className="text-xl font-medium text-textBlack mb-4">
          Instructions
        </h2>
        <div className="space-y-12">
          <div>
            <div className="text-sm text-gray-500 mt-10 mb-2">Step 1/4</div>
            <h3 className="text-lg text-textBlack font-medium mb-2">
              Prepare Tofu
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Press tofu slices between paper towels to remove excess moisture.
              Set up a breading station with three shallow dishes: one with
              flour, one with the beaten egg (or one tablespoon plant based milk
              if vegan), and one with panko breadcrumbs. Coat the tofu slice in
              flour, shaking off the excess. Dip it in the egg or plant-based
              milk, then press it into the panko breadcrumbs, ensuring it's
              evenly coated.
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Step 2/4</div>
            <h3 className="text-lg text-textBlack font-medium mb-2">
              Fry Tofu
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Heat two teaspoons avocado oil in a skillet over medium heat. Fry
              the breaded tofu slices until golden brown and crispy on both
              sides, about 3-4 minutes per side. Remove from the skillet and set
              aside.
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Step 3/4</div>
            <h3 className="text-lg text-textBlack font-medium mb-2">
              Make Curry Sauce
            </h3>
            <p className="text-gray-600 leading-relaxed">
              In the same pan, add a teaspoon of avocado oil and sauté the
              chopped onion, garlic, carrot, and potato until the vegetables are
              softened, about 5 minutes. Stir in the curry powder and flour, and
              cook for 1-2 minutes to form a roux. Gradually pour in the
              vegetable broth, stirring constantly to avoid lumps. Add the soy
              sauce and let the curry simmer for about 10-15 minutes, or until
              the vegetables are tender and the sauce has thickened. Season with
              salt and pepper if needed.
            </p>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-2">Step 4/4</div>
            <h3 className="text-lg text-textBlack font-medium mb-2">Serve</h3>
            <p className="text-gray-600 leading-relaxed">
              Place crispy tofu katsu over cooked rice, top with the thick curry
              sauce, garnish with chopped green onions and pickled ginger on the
              side, if desired.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
