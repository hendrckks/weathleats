import React, { useState } from "react";
import { addRecipe } from "../../lib/firebase/firestore";
import type {
  NewRecipeData,
  Ingredient,
  Instruction,
  NutritionFacts,
} from "../../types/firestore";

// Updated predefined options
const RECIPE_CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Pre-workout",
  "Post-workout",
  "Dinner",
  "Dessert",
];

const RECIPE_TYPES = [
  { label: "Vegetarian", code: "V" },
  { label: "Vegan", code: "Ve" },
  { label: "Gluten Free", code: "GF" },
];

const AddRecipeForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [prepTime, setPrepTime] = useState<number>(0);

  // Categories and types
  const [mealBenefits, setMealBenefits] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Rest of the states remain the same
  const [nutritionFacts, setNutritionFacts] = useState<NutritionFacts>({
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
    sugar: 0,
    fiber: 0,
    cholesterol: 0,
    sodium: 0,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { measurement: 0, unit: "", item: "" },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step: 1, description: "" },
  ]);

  // Existing handlers remain the same
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(
          file.type
        );
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        return isValidType && isValidSize;
      });

      if (validFiles.length !== files.length) {
        setError(
          "Some files were not added. Images must be JPEG, PNG, or WebP and under 5MB."
        );
      }

      setImages(validFiles);
    }
  };

  // Modified toggle handler for categories and types
  // @ts-ignore: TS6133 - Variable 'array' is declared but its value is never read.
  const toggleArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setArray((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Rest of the handlers remain the same
  const handleNutritionChange = (
    field: keyof NutritionFacts,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setNutritionFacts((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]:
        field === "measurement" ? parseFloat(value as string) || 0 : value,
    };
    setIngredients(newIngredients);
  };

  // Existing add/remove handlers remain the same
  const addIngredient = () => {
    setIngredients([...ingredients, { measurement: 0, unit: "", item: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = { step: index + 1, description: value };
    setInstructions(newInstructions);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step: instructions.length + 1, description: "" },
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updatedInstructions = instructions
        .filter((_, i) => i !== index)
        .map((instruction, i) => ({ ...instruction, step: i + 1 }));
      setInstructions(updatedInstructions);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImages([]);
    setMealBenefits("");
    setCategories([]);
    setTypes([]);
    setPrepTime(0);
    setNutritionFacts({
      calories: 0,
      protein: 0,
      fats: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      cholesterol: 0,
      sodium: 0,
    });
    setIngredients([{ measurement: 0, unit: "", item: "" }]);
    setInstructions([{ step: 1, description: "" }]);
    setError(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!name.trim()) {
        throw new Error("Recipe name is required");
      }

      if (!ingredients[0].item || !instructions[0].description) {
        throw new Error("At least one ingredient and instruction is required");
      }

      const recipeData: NewRecipeData = {
        name: name.trim(),
        description: description.trim() || undefined,
        prepTime: prepTime || undefined,
        mealBenefits:
          mealBenefits
            .split("|")
            .map((b) => b.trim())
            .filter((b) => b) || undefined,
        nutritionFacts: Object.values(nutritionFacts).some((value) => value > 0)
          ? nutritionFacts
          : undefined,
        ingredients: ingredients.filter((ing) => ing.item.trim()),
        instructions: instructions.filter((inst) => inst.description.trim()),
        category: categories.length > 0 ? categories : undefined,
        type: types.length > 0 ? types : undefined,
      };

      await addRecipe(recipeData, images);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background py-28">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto bg-secondaryBackground p-8 rounded-lg shadow-lg"
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Recipe added successfully!
          </div>
        )}

        {/* Basic Information */}
        <div className="mb-6">
          <label className="block mb-2 text-textGrey font-medium">
            Recipe Name*
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border-2 border-primary rounded-md focus:outline-none focus:ring focus:ring-secondary"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-textGrey font-medium">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border-2 border-primary rounded-md focus:outline-none focus:ring focus:ring-secondary"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Prep Time (minutes)
          </label>
          <input
            type="number"
            value={prepTime}
            onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
            className="w-full p-3 border-2 border-primary rounded-md"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">Images</label>
          <input
            type="file"
            onChange={handleImageChange}
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="w-full p-3 border-2 border-primary rounded-md"
          />
          <small className="text-gray-500">
            Max 5MB per image. JPEG, PNG, or WebP only.
          </small>
        </div>

        {/* Meal Benefits */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Meal Benefits (separate with |)
          </label>
          <input
            type="text"
            value={mealBenefits}
            onChange={(e) => setMealBenefits(e.target.value)}
            className="w-full p-3 border-2 border-primary rounded-md"
            placeholder="e.g. High Protein | Low Carb | Weight Loss"
          />
        </div>

        {/* Categories */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {RECIPE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  toggleArrayItem(categories, setCategories, category)
                }
                className={`px-3 py-1 rounded text-textBlack ${
                  categories.includes(category)
                    ? "bg-gradient-to-b from-[#637257] to-[#4b5942] text-white"
                    : "bg-gray-200 text-textBlack"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Types */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">Types</label>
          <div className="flex flex-wrap gap-2">
            {RECIPE_TYPES.map((type) => (
              <button
                key={type.label}
                type="button"
                onClick={() => toggleArrayItem(types, setTypes, type.label)}
                className={`px-3 py-1 rounded ${
                  types.includes(type.label)
                    ? "bg-gradient-to-b from-[#637257] to-[#4b5942] text-white"
                    : "bg-gray-200 text-textBlack"
                }`}
              >
                {type.label} ({type.code})
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Nutrition Facts (per serving)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(nutritionFacts).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm mb-1 capitalize">
                  {key === "fats" ? "Fat" : key} {key !== "calories" && "(g)"}
                </label>
                <input
                  type="number"
                  value={value || ""}
                  onChange={(e) =>
                    handleNutritionChange(
                      key as keyof NutritionFacts,
                      e.target.value
                    )
                  }
                  className="w-full p-3 border-2 border-primary rounded-md"
                  min="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Ingredients*
          </label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="number"
                value={ingredient.measurement || ""}
                onChange={(e) =>
                  handleIngredientChange(index, "measurement", e.target.value)
                }
                className="w-full p-3 border-2 border-primary rounded-md"
                placeholder="Amount"
                min="0"
                step="0.1"
                required
              />
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(index, "unit", e.target.value)
                }
                className="w-full p-3 border-2 border-primary rounded-md"
                placeholder="Unit"
                required
              />
              <input
                type="text"
                value={ingredient.item}
                onChange={(e) =>
                  handleIngredientChange(index, "item", e.target.value)
                }
                className="w-full p-3 border-2 border-primary rounded-md"
                placeholder="Ingredient"
                required
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="px-3 py-1 bg-[#f27777] text-textBlack rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 px-4 py-2 bg-textBlack text-white rounded"
          >
            Add Ingredient
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-4">
          <label className="block mb-2 text-textGrey font-medium">
            Instructions*
          </label>
          {instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <span className="w-8 pt-2">{instruction.step}.</span>
              <textarea
                value={instruction.description}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="w-full p-3 border-2 border-primary rounded-md"
                placeholder="Instruction step"
                required
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="px-3 py-1 bg-[#f27777] text-textBlack rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="mt-2 px-4 py-2 bg-textBlack text-white rounded"
          >
            Add Instruction
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 text-white rounded ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-b from-[#637257] to-[#4b5942] hover:from-[#4b5942] hover:to-[#3c4735]"
          }`}
        >
          {loading ? "Adding Recipe..." : "Add Recipe"}
        </button>
      </form>
    </div>
  );
};

export default AddRecipeForm;
