//migrate training goals


// import { db } from "./firebase/clientApp";
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
// import { Recipe, TrainingGoal } from "../types/firestore";

// export const migrateRecipes = async () => {
//   const recipesRef = collection(db, "recipes");
//   const snapshot = await getDocs(recipesRef);

//   const updatePromises = snapshot.docs.map(async (recipeDoc) => {
//     const recipeData = recipeDoc.data() as Recipe;

//     // Logic to assign training goals based on existing recipe data
//     const trainingGoals = assignTrainingGoals(recipeData);

//     // Update the recipe document with the new training goals
//     await updateDoc(doc(db, "recipes", recipeDoc.id), { trainingGoals });

//     console.log(`Updated recipe: ${recipeDoc.id}`);
//   });

//   await Promise.all(updatePromises);
//   console.log("Migration completed");
// };

// const assignTrainingGoals = (recipe: Recipe): TrainingGoal[] => {
//   const goals: TrainingGoal[] = [];

//   // Safely access nutritionFacts properties with optional chaining and default values
//   const protein = recipe.nutritionFacts?.protein ?? 0;
//   const carbs = recipe.nutritionFacts?.carbs ?? 0;
//   const calories = recipe.nutritionFacts?.calories ?? 0;
//   const fats = recipe.nutritionFacts?.fats ?? 0;

//   // 1. Muscle Building (Bodybuilding/Strength Training)
//   if (protein > 30 && calories > 400 && carbs > 40) {
//     goals.push(TrainingGoal.MuscleBuildingStrengthTraining);
//   }

//   // 2. Endurance Training
//   if (carbs > 50 && calories > 300 && calories <= 500) {
//     goals.push(TrainingGoal.Endurance);
//   }

//   // 3. Fat Loss/Cutting
//   if (calories < 400 && protein > 25 && fats < 15) {
//     goals.push(TrainingGoal.FatLoss);
//   }

//   // 4. Weight Gain (Bulking)
//   if (calories > 500 && protein > 30 && carbs > 60) {
//     goals.push(TrainingGoal.Bulking);
//   }

//   // 5. Weight-Class Sports
//   if (protein > 25 && calories >= 300 && calories <= 500) {
//     goals.push(TrainingGoal.WeightClassSport);
//   }

//   // 6. Body Recomposition
//   if (protein >= 25 && carbs >= 30 && fats >= 15 && fats <= 30) {
//     goals.push(TrainingGoal.BodyRecomposition);
//   }

//   // 7. Sports Specific (Soccer, Basketball, Football)
//   if (
//     carbs > 50 &&
//     protein > 20 &&
//     (recipe.tags?.some((tag) =>
//       ["high-energy", "quick-recovery", "hydration"].includes(tag.toLowerCase())
//     ) ||
//       recipe.category?.some((cat) =>
//         ["Pre-workout", "Post-workout", "Energy-sustaining"].includes(cat)
//       ))
//   ) {
//     goals.push(TrainingGoal.SportsSpecific);
//   }

//   // Additional checks for sports-specific recipes
//   const sportSpecificKeywords = [
//     "electrolyte",
//     "energy",
//     "recovery",
//     "hydration",
//     "quick",
//   ];
//   if (
//     recipe.name &&
//     sportSpecificKeywords.some((keyword) =>
//       recipe.name.toLowerCase().includes(keyword)
//     )
//   ) {
//     goals.push(TrainingGoal.SportsSpecific);
//   }

//   return goals;
// };

// // Run the migration
// migrateRecipes().catch(console.error);




//migrate search key words

import { db } from "../lib/firebase/clientApp";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { generateSearchKeywords } from "./firebase/firestore";

export const migrateSearchKeywords = async () => {
  const recipesRef = collection(db, "recipes");
  const snapshot = await getDocs(recipesRef);

  const batchSize = 500;
  let batch = [];
  let updatedCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const recipeData = docSnapshot.data();
    const newKeywords = generateSearchKeywords(recipeData.name);

    batch.push(updateDoc(doc(db, "recipes", docSnapshot.id), {
      searchKeywords: newKeywords
    }));

    if (batch.length >= batchSize) {
      await Promise.all(batch);
      updatedCount += batch.length;
      console.log(`Updated ${updatedCount} recipes`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await Promise.all(batch);
    updatedCount += batch.length;
  }

  console.log(`Migration complete. Updated ${updatedCount} recipes in total.`);
};

// Run the migration
migrateSearchKeywords().catch(console.error);

