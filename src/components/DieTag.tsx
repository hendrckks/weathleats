import { FC } from "react";

interface DietTagProps {
  type: string;
}

const DietTag: FC<DietTagProps> = ({ type }) => {
  const getTagStyles = (dietType: string): string => {
    switch (dietType) {
      case "Vegetarian":
        return "bg-[#f3ca96] text-white";
      case "Vegan":
        return "bg-[#6a4731] text-white";
      case "Gluten Free":
        return "bg-[#6b6b71] text-white";
      default:
        return "bg-[#6b6b71] text-white";
    }
  };

  const getAbbreviation = (dietType: string): string => {
    switch (dietType) {
      case "Vegetarian":
        return "V";
      case "Vegan":
        return "Ve";
      case "Gluten Free":
        return "GF";
      default:
        return type;
    }
  };

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${getTagStyles(type)}`}>
      {getAbbreviation(type)}
    </span>
  );
};

export default DietTag;
