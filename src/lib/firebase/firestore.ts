import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  // startAfter,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase/clientApp";
import {
  Recipe,
  NewRecipeData,
  recipeSchema,
  TrainingGoal,
} from "../../types/firestore";
import { z } from "zod";

// Helper function to format recipe name for use as ID
const formatRecipeId = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Helper function to check if a recipe with given ID exists
const recipeExists = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking recipe existence:", error);
    throw new Error("Failed to check if recipe exists");
  }
};

// Helper function to generate unique recipe ID
export const generateUniqueRecipeId = async (name: string): Promise<string> => {
  try {
    let baseId = formatRecipeId(name);
    let finalId = baseId;
    let counter = 1;

    while (await recipeExists(finalId)) {
      finalId = `${baseId}-${counter}`;
      counter++;
      if (counter > 100) {
        throw new Error("Unable to generate unique recipe ID");
      }
    }

    return finalId;
  } catch (error) {
    console.error("Error generating unique recipe ID:", error);
    throw error;
  }
};

// Helper function to upload recipe images with retry logic
export const uploadRecipeImages = async (
  recipeId: string,
  images: File[],
  maxRetries = 3
): Promise<string[]> => {
  const imageUrls: string[] = [];
  const failedUploads: { file: File; error: any }[] = [];

  for (const image of images) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const imageRef = ref(storage, `recipes/${recipeId}/${image.name}`);
        await uploadBytes(imageRef, image);
        const downloadUrl = await getDownloadURL(imageRef);
        imageUrls.push(downloadUrl);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          failedUploads.push({ file: image, error });
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
  }

  if (failedUploads.length > 0) {
    console.error("Failed to upload some images:", failedUploads);
    throw new Error(`Failed to upload ${failedUploads.length} images`);
  }

  return imageUrls;
};

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " "); // Normalize spaces
};

// Helper function to delete recipe images with retry logic
const deleteRecipeImages = async (
  imageUrls: string[],
  maxRetries = 3
): Promise<void> => {
  const failedDeletions: { url: string; error: any }[] = [];

  for (const url of imageUrls) {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          failedDeletions.push({ url, error });
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  if (failedDeletions.length > 0) {
    console.error("Failed to delete some images:", failedDeletions);
  }
};

export const fetchRecipesByIds = async (ids: string[]): Promise<Recipe[]> => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(recipesRef, where("id", "in", ids));
    const querySnapshot = await getDocs(q);

    const recipes: Recipe[] = [];
    querySnapshot.forEach((doc) => {
      const recipeData = doc.data();
      try {
        const validatedRecipe = recipeSchema.parse({
          id: doc.id,
          ...recipeData,
        });
        recipes.push(validatedRecipe);
      } catch (error) {
        console.error(`Error validating recipe ${doc.id}:`, error);
      }
    });

    return recipes;
  } catch (error) {
    console.error("Error fetching recipes by ids:", error);
    throw error;
  }
};

export const updateUserTrainingGoals = async (
  userId: string,
  goals: TrainingGoal[]
) => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { trainingGoals: goals }, { merge: true });
};

export const fetchUserData = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const fetchForYouRecipes = async (userId: string): Promise<Recipe[]> => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userGoals = userDoc.data().trainingGoals || [];

  if (userGoals.length === 0) {
    const { recipes } = await fetchPaginatedRecipes(1, 30); // Destructure the recipes
    return recipes; // Return only the recipes array
  }

  const recipesRef = collection(db, "recipes");
  const q = query(
    recipesRef,
    where("trainingGoals", "array-contains-any", userGoals),
    limit(30)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      searchKeywords: data.searchKeywords,
      description: data.description,
      type: data.type,
      trainingGoals: data.trainingGoals,
      imageUrls: data.imageUrls,
      mealBenefits: data.mealBenefits,
      nutritionFacts: data.nutritionFacts,
      instructions: data.instructions,
      ingredients: data.ingredients,
      category: data.category,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      totalTime: data.totalTime,
      servings: data.servings,
      difficulty: data.difficulty,
      cuisine: data.cuisine,
      dietaryRestrictions: data.dietaryRestrictions,
      calories: data.calories,
      equipment: data.equipment,
      notes: data.notes,
      tags: data.tags,
      sourceUrl: data.sourceUrl,
    } as Recipe;
  });
};

export const fetchInitial30Recipes = async () => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(recipesRef, orderBy("createdAt", "desc"), limit(30));
    const querySnapshot = await getDocs(q);

    const recipes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return recipes;
  } catch (error) {
    console.error("Error fetching initial recipes:", error);
    throw error;
  }
};

export const filterRecipesByTypeAndCategory = async (
  selectedTypes: string[],
  selectedCategories: string[]
) => {
  try {
    const recipesRef = collection(db, "recipes");
    let q = query(recipesRef);

    if (selectedTypes.length > 0) {
      q = query(q, where("type", "array-contains-any", selectedTypes));
    }

    if (selectedCategories.length > 0) {
      q = query(q, where("category", "array-contains-any", selectedCategories));
    }

    const querySnapshot = await getDocs(q);

    const filteredRecipes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return filteredRecipes;
  } catch (error) {
    console.error("Error filtering recipes:", error);
    throw error;
  }
};

export const searchRecipes = async (searchTerm: string): Promise<Recipe[]> => {
  try {
    const normalizedSearchTerm = normalizeText(searchTerm);
    const searchWords = normalizedSearchTerm.split(" ");

    // Create a query to search for recipes where any of the searchKeywords match
    const recipesRef = collection(db, "recipes");
    const q = query(
      recipesRef,
      where("searchKeywords", "array-contains-any", searchWords),
      limit(30)
    );

    const querySnapshot = await getDocs(q);
    const searchResults: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      try {
        const recipeData = doc.data();
        // Score the match based on how many search words appear in the recipe name
        const recipeName = normalizeText(recipeData.name);
        const matchScore = searchWords.filter((word) =>
          recipeName.includes(word)
        ).length;

        const validatedRecipe = recipeSchema.parse({
          id: doc.id,
          ...recipeData,
          _matchScore: matchScore, // Add match score for sorting
        });
        searchResults.push(validatedRecipe);
      } catch (error) {
        console.error(`Error validating recipe ${doc.id}:`, error);
      }
    });

    // Sort results by match score (best matches first)
    return searchResults.sort(
      (a: any, b: any) => (b._matchScore || 0) - (a._matchScore || 0)
    );
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
};

export const updateRecipeSearchKeywords = async (
  recipeId: string
): Promise<void> => {
  try {
    const docRef = doc(db, "recipes", recipeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const recipeData = docSnap.data();
      if (recipeData.name) {
        const searchKeywords = generateSearchKeywords(recipeData.name);
        await updateDoc(docRef, { searchKeywords });
      }
    }
  } catch (error) {
    console.error(
      `Error updating search keywords for recipe ${recipeId}:`,
      error
    );
    throw error;
  }
};

export const generateSearchKeywords = (name: string): string[] => {
  const normalizedName = normalizeText(name);
  const words = normalizedName.split(" ");
  const keywords = new Set<string>();

  // Add individual words
  words.forEach((word) => {
    if (word.length >= 2) {
      keywords.add(word);
    }
  });

  // Add pairs of consecutive words
  for (let i = 0; i < words.length - 1; i++) {
    keywords.add(`${words[i]} ${words[i + 1]}`);
  }

  // Add triplets of consecutive words
  for (let i = 0; i < words.length - 2; i++) {
    keywords.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  // Add complete name
  keywords.add(normalizedName);

  // Add partial matches (substrings of 2 or more characters)
  words.forEach((word) => {
    for (let i = 0; i < word.length - 1; i++) {
      for (let j = i + 2; j <= word.length; j++) {
        keywords.add(word.slice(i, j));
      }
    }
  });

  return Array.from(keywords);
};

export const getTotalRecipesCount = async (): Promise<number> => {
  try {
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(recipesRef);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting total recipes count:", error);
    throw error;
  }
};

export const fetchPaginatedRecipes = async (
  page: number,
  recipesPerPage: number = 30
): Promise<{
  recipes: Recipe[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  const recipesRef = collection(db, "recipes");
  let q = query(
    recipesRef,
    orderBy("createdAt", "desc"),
    limit(recipesPerPage)
  );

  if (page > 1) {
    const lastVisibleSnapshot = await getLastVisibleDoc(
      page - 1,
      recipesPerPage
    );
    if (lastVisibleSnapshot) {
      q = query(q, startAfter(lastVisibleSnapshot));
    }
  }

  const querySnapshot = await getDocs(q);
  const recipes: Recipe[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    try {
      const validatedRecipe = recipeSchema.parse({
        id: doc.id,
        ...data,
        // Ensure all optional fields are present
        trainingGoals: data.trainingGoals || [],
        category: data.category || [],
        type: data.type || [],
        imageUrls: data.imageUrls || [],
        mealBenefits: data.mealBenefits || [],
        instructions: data.instructions || [],
        ingredients: data.ingredients || [],
        dietaryRestrictions: data.dietaryRestrictions || [],
        equipment: data.equipment || [],
        tags: data.tags || [],
        searchKeywords:
          data.searchKeywords || generateSearchKeywords(data.name),
      });
      recipes.push(validatedRecipe);
    } catch (error) {
      console.error(`Error validating recipe ${doc.id}:`, error);
    }
  });

  const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { recipes, lastVisible };
};

const getLastVisibleDoc = async (
  page: number,
  recipesPerPage: number
): Promise<QueryDocumentSnapshot<DocumentData> | null> => {
  const recipesRef = collection(db, "recipes");
  const q = query(
    recipesRef,
    orderBy("createdAt", "desc"),
    limit(page * recipesPerPage)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[querySnapshot.docs.length - 1] || null;
};

export const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const recipeData = docSnap.data();

      // If searchKeywords is missing, generate them from the recipe name
      if (!recipeData.searchKeywords && recipeData.name) {
        recipeData.searchKeywords = generateSearchKeywords(recipeData.name);

        // Update the document with the generated searchKeywords
        try {
          await updateDoc(docRef, {
            searchKeywords: recipeData.searchKeywords,
          });
        } catch (updateError) {
          console.warn("Failed to update searchKeywords:", updateError);
          // Continue execution even if update fails
        }
      }

      // Try to validate the complete recipe
      try {
        const validatedRecipe = recipeSchema.parse({
          id: docSnap.id,
          ...recipeData,
        });
        return validatedRecipe;
      } catch (validationError) {
        // If validation fails, try with partial schema
        if (validationError instanceof z.ZodError) {
          console.warn(`Validation error for recipe ${id}:`, validationError);

          // Create a partial schema that makes searchKeywords optional
          const partialRecipeSchema = recipeSchema.partial({
            searchKeywords: true,
          });

          // Validate with partial schema
          const partiallyValidatedRecipe = partialRecipeSchema.parse({
            id: docSnap.id,
            ...recipeData,
          });

          // Return the recipe with empty searchKeywords if all else fails
          return {
            ...partiallyValidatedRecipe,
            searchKeywords: recipeData.searchKeywords || [],
          } as Recipe;
        }
        throw validationError;
      }
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }
};

// Add a new recipe with validation and error handling
export const addRecipe = async (
  recipeData: NewRecipeData,
  images: File[]
): Promise<string> => {
  try {
    // Validate recipe data before processing
    const validatedData = z
      .object({
        name: z.string().min(1, "Recipe name is required"),
        prepTime: z.number().optional(),
        description: z.string().optional(),
        mealBenefits: z.array(z.string()).optional(),
        nutritionFacts: z
          .object({
            calories: z.number(),
            protein: z.number(),
            fats: z.number(),
            carbs: z.number(),
            sugar: z.number().optional(),
            fiber: z.number().optional(),
            cholesterol: z.number().optional(),
            sodium: z.number().optional(),
          })
          .optional(),
        ingredients: z
          .array(
            z.object({
              measurement: z.number(),
              unit: z.string(),
              item: z.string(),
            })
          )
          .min(1, "At least one ingredient is required"),
        instructions: z
          .array(
            z.object({
              step: z.number(),
              description: z.string(),
            })
          )
          .min(1, "At least one instruction is required"),
        category: z.array(z.string()).optional(),
        type: z.array(z.string()).optional(),
      })
      .parse(recipeData);

    const recipeId = await generateUniqueRecipeId(validatedData.name);
    const imageUrls =
      images.length > 0 ? await uploadRecipeImages(recipeId, images) : [];

    const searchKeywords = generateSearchKeywords(validatedData.name);

    const newRecipe: Recipe = {
      ...validatedData,
      id: recipeId,
      imageUrls,
      searchKeywords,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const validatedRecipe = recipeSchema.parse(newRecipe);
    await setDoc(doc(db, "recipes", recipeId), validatedRecipe);
    return recipeId;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessage}`);
    }
    console.error("Error adding recipe:", error);
    throw error;
  }
};

// Update an existing recipe with validation and error handling
export const updateRecipe = async (
  currentId: string,
  recipeData: Partial<NewRecipeData>,
  newImages?: File[],
  deletedImageUrls?: string[]
): Promise<string> => {
  try {
    let updateData: Partial<Recipe> = {
      ...recipeData,
      updatedAt: Timestamp.now(),
    };

    // Validate update data
    const validatedUpdate = recipeSchema.partial().parse(updateData);

    // If name is being updated, generate new ID
    let newId = currentId;
    if (recipeData.name) {
      updateData.searchKeywords = generateSearchKeywords(recipeData.name);
    }

    // Handle image updates if provided
    if (newImages?.length || deletedImageUrls?.length) {
      // Delete specified images
      if (deletedImageUrls?.length) {
        await deleteRecipeImages(deletedImageUrls);
      }
      const existingRecipe = await getDoc(doc(db, "recipes", currentId));
      if (existingRecipe.exists()) {
        const existingName = existingRecipe.data().name;
        updateData.searchKeywords = generateSearchKeywords(existingName);
      }

      // Upload new images
      if (newImages?.length) {
        const newImageUrls = await uploadRecipeImages(newId, newImages);
        updateData.imageUrls = newImageUrls;
      }
    }

    if (newId !== currentId) {
      // If ID changed, create new document and delete old one
      const currentDoc = await getDoc(doc(db, "recipes", currentId));
      if (!currentDoc.exists()) {
        throw new Error("Recipe not found");
      }
      await setDoc(doc(db, "recipes", newId), {
        ...currentDoc.data(),
        ...validatedUpdate,
      });
      await deleteDoc(doc(db, "recipes", currentId));
    } else {
      // Otherwise, update existing document
      await updateDoc(doc(db, "recipes", currentId), validatedUpdate);
    }

    return newId;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => err.message).join(", ");
      throw new Error(`Validation error: ${errorMessage}`);
    }
    console.error("Error updating recipe:", error);
    throw error;
  }
};
