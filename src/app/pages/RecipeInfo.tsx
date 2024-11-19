import { Link } from "react-router-dom";
import { Share } from "../../assets/icons/Share";
import Container from "../../components/Container";
import Instructions from "../../components/Instructions";
import BenefitsAndNutrition from "../../components/NutritionBenefits";

const RecipeInfo = () => {
  return (
    <Container className="py-14 mx-auto text-sm rounded-sm min-h-screen">
      <div className="space-y-5 pt-24">
        <div className="p-2 bg-primary/20 w-fit text-xs text-textBlack">
          Breakfast
        </div>
        <div className="justify-between flex">
          <p className="text-5xl">Tofu Katsu Curry</p>
          <div className="group flex">
            <Share className="text-textBlack text-2xl cursor-pointer" />
            <p className="relative group-hover:text-textBlack/60 font-semibold left-2 bottom-4 transition-colors ease-in-out text-transparent">
              Share
            </p>
          </div>
        </div>
        <div className="w-1/3">
          <p className="text-base text-textBlack">
            Tofu cutlets coated in breadcrumbs, served with a fragrant Japanese
            curry sauce and rice.
          </p>
        </div>
        <div>
          <div className="flex gap-4 items-center">
            <span className="text-xs bg-[#6b6b71] text-white px-1.5 py-1 rounded">
              GF
            </span>
            <div className="flex items-center text-textBlack">
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
              <span className="ml-1">30 mins</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-24 mt-4">
        <div className="h-[480px] mt-10">
          <img
            src="/recipes/recipe1.jfif"
            className="h-full object-cover w-[736px] rounded-md"
          />
        </div>
        <div className="w-1/2 mt-[-4px]">
          <BenefitsAndNutrition />
        </div>
      </div>
      <div className="mt-28">
        <Instructions />
      </div>
      <div className="flex flex-col space-y-8 items-center text-lg">
        <div className="">
          <Link to="/login" className="text-primary underline">
            Login
          </Link>
          <span className="ml-2">to join the conversation</span>
        </div>
        <div className="text-textBlack">0 Comments</div>
        <div className="py-12 px-20 bg-primary/15 text-textBlack">
          Be the first to comment
        </div>
      </div>
    </Container>
  );
};

export default RecipeInfo;
