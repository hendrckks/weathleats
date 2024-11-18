import React from "react";

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const Target:React.FC<SVGProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 14 14"
    {...props}
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.48 7.516a6.5 6.5 0 1 1-6.93-7"></path>
      <path d="M9.79 8.09A3 3 0 1 1 5.9 4.21M7 7l2.5-2.5m2 .5l-2-.5l-.5-2l2-2l.5 2l2 .5z"></path>
    </g>
  </svg>
);
