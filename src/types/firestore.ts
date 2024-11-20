// types.ts
import { z } from 'zod';

// Meal Benefits
const mealBenefitSchema = z.array(z.string());

// Nutrition Facts
const nutritionFactsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  fats: z.number(),
  carbs: z.number(),
});

// Ingredients
const ingredientSchema = z.object({
  measurement: z.number(),
  unit: z.string(),
  item: z.string(),
});

// Instructions
const instructionSchema = z.object({
  step: z.number(),
  description: z.string(),
});

// Recipe
const recipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  prepTime: z.number(),
  imageUrls: z.array(z.string()),
  mealBenefits: mealBenefitSchema,
  nutritionFacts: nutritionFactsSchema,
  instructions: z.array(instructionSchema),
  ingredients: z.array(ingredientSchema),
  category: z.array(z.string()),
  type: z.array(z.string()),
  calories: z.number(),
});

export type MealBenefit = z.infer<typeof mealBenefitSchema>;
export type NutritionFacts = z.infer<typeof nutritionFactsSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Instruction = z.infer<typeof instructionSchema>;
export type Recipe = z.infer<typeof recipeSchema>;