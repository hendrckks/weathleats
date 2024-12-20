import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavouritesContext";
import { toast } from "../hooks/useToast";
import { useState, useCallback, useRef } from "react";
import { useFirebaseCache } from "../lib/cache/cacheUtils";
import { fetchRecipeById } from "../lib/firebase/firestore";
import HighlightedText from "./HighlightedTex";
import DietTag from "./DieTag";

interface RecipeCardProps {
  name: string;
  calories: number | undefined | string;
  prepTime: string;
  imageUrl: string;
  id: string;
  isLoading?: boolean;
  searchTerm?: string;
  types: string[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  name,
  calories,
  prepTime,
  imageUrl,
  id,
  isLoading = false,
  searchTerm = "",
  types,
}) => {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [imageError, setImageError] = useState(false);
  const { fetchWithCache } = useFirebaseCache();
  const [isLiked, setIsLiked] = useState(isFavorite(id));
  const [isDissolving, setIsDissolving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dissolveAnimRef = useRef<SVGAnimateElement>(null);

  const navigate = useNavigate();

  const handleLikeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        toast({
          title: "",
          variant: "warning",
          description: "Sign In to get full access",
          duration: 5000,
        });
        navigate("/login");
      } else {
        if (isLiked) {
          // Start dissolve animation before removing from favorites
          setIsDissolving(true);

          // Trigger the SVG animation
          if (dissolveAnimRef.current) {
            dissolveAnimRef.current.beginElement();
          }

          // Wait for animation to complete before updating state
          setTimeout(() => {
            setIsLiked(false);
            removeFavorite(id);
            setIsDissolving(false);
          }, 1500);
        } else {
          setIsLiked(true);
          addFavorite(id);
          toast({
            title: "",
            variant: "success",
            description: "Recipe added to favourites",
            duration: 5000,
          });
        }
      }
    },
    [user, id, isLiked, addFavorite, removeFavorite, navigate]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const prefetchRecipe = useCallback(() => {
    fetchWithCache(`recipe_${id}`, () => fetchRecipeById(id), 1000 * 60 * 30);
  }, [fetchWithCache, id]);

  if (isLoading) {
    return (
      <div className="w-full flex flex-col rounded-md relative">
        <div className="animate-pulse">
          <div className="h-[315px] w-full bg-[#e7e9e2] rounded-lg" />
          <div className="absolute top-4 left-2 flex items-center space-x-2 z-50">
            <div className="w-20 h-6 bg-gray-300 rounded-xl" />
            <div className="w-20 h-6 bg-gray-300 rounded-xl" />
          </div>
          <div className="absolute top-4 right-6 w-7 h-7 bg-gray-300 rounded-full" />
          <div className="mt-3 h-6 bg-[#e7e9e2] rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/recipes/${id}`}
      className="block w-full"
      onMouseEnter={prefetchRecipe}
    >
      <motion.div
        ref={cardRef}
        style={{
          filter: isDissolving ? `url(#dissolve-filter-${id})` : "none",
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: isDissolving ? 0 : 1,
          y: 0,
          scale: isDissolving ? 1.2 : 1,
        }}
        transition={{
          duration: isDissolving ? 1.5 : 0.5,
          ease: "easeIn",
        }}
        className={`w-full flex flex-col rounded-md cursor-pointer relative`}
      >
        <svg
          className="absolute"
          viewBox="0 0 1 1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              id={`dissolve-filter-${id}`}
              x="-200%"
              y="-200%"
              width="400%"
              height="400%"
              color-interpolation-filters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
                seed="1"
              ></feTurbulence>
              <feComponentTransfer in="noise" result="adjustedNoise">
                <feFuncR type="linear" slope="2.5" intercept="-0.5"></feFuncR>
                <feFuncG type="linear" slope="2.5" intercept="-0.5"></feFuncG>
              </feComponentTransfer>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="4"
                result="fineNoise"
              ></feTurbulence>
              <feMerge result="mergedNoise">
                <feMergeNode in="adjustedNoise"></feMergeNode>
                <feMergeNode in="fineNoise"></feMergeNode>
              </feMerge>
              <feDisplacementMap
                in="SourceGraphic"
                in2="mergedNoise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
              >
                <animate
                  ref={dissolveAnimRef}
                  attributeName="scale"
                  from="0"
                  to="100"
                  dur="1.5s"
                  // Add these timing attributes for a more explosive feel
                  calcMode="spline"
                  keyTimes="0; 0.2; 1"
                  keySplines="0.4 0 1 1; 0.3 0.1 0.1 1"
                  begin="indefinite"
                  fill="freeze"
                />
              </feDisplacementMap>
            </filter>
          </defs>
        </svg>
        <div className="absolute top-2 left-4 flex items-center space-x-2 z-30">
          <div className="flex items-center backdrop-blur-lg bg-white/30 px-1 py-1 rounded-xl text-textBlack">
            <svg
              className="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="text-xs">{prepTime} Mins</span>
          </div>
          <div className="flex items-center backdrop-blur-3xl bg-white/30 px-1 py-1 rounded-xl text-textBlack">
            <svg
              className="w-4 h-4 mr-1"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 9H4a2 2 0 00-2 2v2a2 2 0 002 2h16a2 2 0 002-2v-2a2 2 0 00-2-2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 6v12M8 6v12M16 6v12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span className="text-xs">{calories ?? "N/A"} Cal</span>
          </div>
        </div>
        <div className="relative w-full h-[315px] rounded-lg overflow-hidden">
          {imageError ? (
            <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              Image not available
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={name}
              className="absolute hover:scale-105 transition-transform duration-150 ease-linear inset-0 w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>
        <motion.span className="text-base mt-3 text-gray-800">
          <div className="flex text- items-center tracking-tight gap-2">
            {types?.map((type) => (
              <DietTag key={type} type={type} />
            ))}
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </div>
        </motion.span>
        <h3 className="font-semibold hidden text-lg mb-2">
          <HighlightedText text={name} highlight={searchTerm} />
        </h3>
        <button
          className="absolute top-2 right-4 bg-transparent rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={handleLikeClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-7 w-7 transition-colors duration-300 ease-in-out ${
              isLiked
                ? "fill-current text-primary stroke-white stroke-2"
                : "text-white stroke-white stroke-2"
            }`}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </motion.div>
    </Link>
  );
};

export default RecipeCard;
