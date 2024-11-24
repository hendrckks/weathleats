import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "./firebase/clientApp";
import { generateSearchKeywords } from "./firebase/firestore";

export const migrateRecipes = async () => {
  try {
    const recipesRef = collection(db, "recipes");
    const snapshot = await getDocs(recipesRef);

    const batch = writeBatch(db);
    let updateCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Only update if searchKeywords don't exist
      if (!data.searchKeywords) {
        const searchKeywords = generateSearchKeywords(data.name);
        batch.update(doc.ref, { searchKeywords });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Migration completed: ${updateCount} recipes updated`);
    } else {
      console.log("No recipes needed updating");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};
