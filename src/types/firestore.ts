import { Timestamp } from "firebase/firestore";
import { z } from "zod";

// Existing schemas with some modifications

// Meal Benefits (unchanged)
export const mealBenefitSchema = z.array(z.string());

// Nutrition Facts (expanded)
export const nutritionFactsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number(),
  // Optional additional nutrition details
  sugar: z.number().optional(),
  fiber: z.number().optional(),
  cholesterol: z.number().optional(),
  sodium: z.number().optional(),
});

// Ingredients (unchanged)
export const ingredientSchema = z.object({
  measurement: z.number(),
  unit: z.string(),
  item: z.string(),
});

// Instructions (unchanged)
export const instructionSchema = z.object({
  step: z.number(),
  description: z.string(),
  // Optional: add time estimation or additional notes
  timeEstimate: z.number().optional(),
  notes: z.string().optional(),
});

// Base Recipe Schema (expanded)
const baseRecipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  

  // Expanded recipe metadata
  prepTime: z.number().optional(),
  cookTime: z.number().optional(),
  totalTime: z.number().optional(),
  servings: z.number().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),

  // Existing fields
  imageUrls: z.array(z.string()).optional(),
  mealBenefits: mealBenefitSchema.optional(),
  nutritionFacts: nutritionFactsSchema.optional(),
  instructions: z.array(instructionSchema).optional(),
  ingredients: z.array(ingredientSchema).optional(),

  // Expanded categorization
  category: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  cuisine: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(), // e.g., ['Vegetarian', 'Gluten-Free']

  // Additional optional metadata
  calories: z.number().optional(),
  equipment: z.array(z.string()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceUrl: z.string().url().optional(),
});

// Full Recipe Schema (including system fields)
export const recipeSchema = baseRecipeSchema.extend({
  id: z.string(),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  searchKeywords: z.array(z.string()),
});

// Type Exports
export type MealBenefit = z.infer<typeof mealBenefitSchema>;
export type NutritionFacts = z.infer<typeof nutritionFactsSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Instruction = z.infer<typeof instructionSchema>;
export type NewRecipeData = z.infer<typeof baseRecipeSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
