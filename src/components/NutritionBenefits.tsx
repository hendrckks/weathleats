import { Check } from 'lucide-react';

const BenefitsAndNutrition = () => {
  return (
    <div className="space-y-8">
      {/* Meal Benefits Section */}
      <div>
        <h3 className="text-lg text-textBlack mb-4">Meal benefits</h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-start pb-4 border-b border-gray-200">
            <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <p className="text-gray-600 text-sm">
              Source of high quality plant-based protein which helps build and repair muscles to help the body recover after exercise
            </p>
          </div>
          <div className="flex gap-3 items-start pb-4 border-b border-gray-200">
            <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <p className="text-gray-600 text-sm">
              Great source of carbohydrates, which gives your body a reliable stead source of energy when exercising
            </p>
          </div>
        </div>
      </div>

      {/* Nutrition Facts Section */}
      <div className="bg-primary rounded-lg p-6">
        <h3 className="text-lg text-textWhite mb-4">
          Nutrition facts <span className="text-sm text-textWhite/80">(per serving)</span>
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-textWhite items-center py-2">
            <span className="text-textWhite">Calories</span>
            <span className="font-medium">583</span>
          </div>
          <div className="flex justify-between text-textWhite items-center py-2">
            <span className="">Protein</span>
            <span className="font-medium">19g</span>
          </div>
          <div className="flex justify-between text-textWhite items-center py-2">
            <span className="">Fats</span>
            <span className="font-medium">21g</span>
          </div>
          <div className="flex justify-between text-textWhite items-center py-2">
            <span className="">Carbs</span>
            <span className="font-medium">76g</span>
          </div>
        </div>
        <p className='py-2 mt-2 font-semibold text-textWhite'>See more 6+</p>
      </div>
    </div>
  );
};

export default BenefitsAndNutrition;