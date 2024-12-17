type FilterProps = {
  size: string;
};

const Filter = ({ size }: FilterProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M10 19h4v-2h-4v2zm-4-6h12v-2H6v2zM3 5v2h18V5H3z"
    />
  </svg>
);

export default Filter;
