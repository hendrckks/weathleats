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
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase/clientApp";
import { Recipe, NewRecipeData, recipeSchema } from "../../types/firestore";
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
const generateUniqueRecipeId = async (name: string): Promise<string> => {
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
const uploadRecipeImages = async (
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

export const searchRecipes = async (searchTerm: string) => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(
      recipesRef,
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);

    const searchedRecipes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return searchedRecipes;
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
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
) => {
  try {
    const recipesRef = collection(db, "recipes");
    const q = query(
      recipesRef,
      orderBy("createdAt", "desc"),
      limit(recipesPerPage)
    );

    // Get the snapshot of the first page
    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    // If not the first page, use startAfter
    if (page > 1) {
      const nextQuery = query(
        recipesRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(recipesPerPage)
      );
      const nextSnapshot = await getDocs(nextQuery);
      return nextSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching paginated recipes:", error);
    throw error;
  }
};

export const fetchRecipeById = async (id: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const recipeData = docSnap.data();
      // Use Zod to validate and parse the data
      const validatedRecipe = recipeSchema.parse({
        id: docSnap.id,
        ...recipeData,
      });
      return validatedRecipe;
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

    const newRecipe: Recipe = {
      ...validatedData,
      id: recipeId,
      imageUrls,
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
      newId = await generateUniqueRecipeId(recipeData.name);
      updateData.id = newId;
    }

    // Handle image updates if provided
    if (newImages?.length || deletedImageUrls?.length) {
      // Delete specified images
      if (deletedImageUrls?.length) {
        await deleteRecipeImages(deletedImageUrls);
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
