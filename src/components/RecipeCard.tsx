import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

const RecipeCard = () => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsLiked(!isLiked);
  };

  return (
    <Link to="/s">
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
        <div className="absolute top-3 left-2 flex items-center space-x-2 z-30">
          <div className="flex items-center backdrop-blur-lg bg-white/30 px-1 py-1 rounded-xl text-background">
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
            <span className="text-xs">30min</span>
          </div>
          <div className="flex items-center backdrop-blur-3xl bg-white/30 px-1 py-1 rounded-xl text-background">
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
            <span className="text-xs">338 cal</span>
          </div>
        </div>
        <img
          src="/recipes/recipe1.jfif"
          className="h-[315px] object-cover w-full rounded-md"
        />
        <span className="text-base mt-3">Tofu Katsu Curry</span>
        <button
          className={`absolute top-4 right-4 bg-transparent p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105`}
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
