import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  name: string;
  calories: number | string | undefined;
  prepTime: string;
  imageUrl: string;
  id: string;
  isLoading?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  name,
  calories,
  prepTime,
  imageUrl,
  id,
  isLoading = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col rounded-md relative">
        <div className="animate-pulse">
          {/* Skeleton for image */}
          
          <div className="h-[315px] w-full bg-[#e7e9e2] rounded-lg" />

          {/* Skeleton for time and calories indicators */}
          <div className="absolute top-4 left-2 flex items-center space-x-2 z-50">
            <div className="w-20 h-6 bg-gray-400 rounded-xl" />
            <div className="w-20 h-6 bg-gray-400 rounded-xl" />
          </div>

          {/* Skeleton for like button */}
          <div className="absolute top-4 right-6 w-7 h-7 bg-gray-500 rounded-full" />

          {/* Skeleton for title */}
          <div className="mt-3 h-6 bg-[#e7e9e2] rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <Link to={`/recipes/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          scale: 1.025,
          transition: {
            duration: 0.2,
          },
        }}
        className="w-full flex flex-col rounded-md cursor-pointer relative"
      >
        <div className="absolute top-4 left-2 flex items-center space-x-2 z-30">
          <div className="flex items-center backdrop-blur-lg bg-white/30 px-1 py-1 rounded-xl text-textWhite">
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
          <div className="flex items-center backdrop-blur-3xl bg-white/30 px-1 py-1 rounded-xl text-textWhite">
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
        <motion.img
          src={imageUrl}
          alt={name}
          className="h-[315px] object-cover w-full rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.span
          className="text-base mt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </motion.span>
        <button
          className="absolute top-4 right-6 bg-transparent rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
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
