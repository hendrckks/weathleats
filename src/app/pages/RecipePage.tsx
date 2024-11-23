import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRecipeById } from "../../lib/firebase/firestore";
import { Recipe } from "../../types/firestore";
import RecipeInfo from "./RecipeInfo";
import { Loader2 } from "lucide-react";

const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipe = async () => {
      if (id) {
        try {
          const recipeData = await fetchRecipeById(id);
          setRecipe(recipeData);
        } catch (error) {
          console.error("Error fetching recipe:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return <RecipeInfo recipe={recipe} />;
};

export default RecipePage;
