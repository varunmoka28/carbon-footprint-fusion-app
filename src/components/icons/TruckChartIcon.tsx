
import React from 'react';

const TruckChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M15 17V9h4v8" />
    <path d="M11 17V12h4v5" />
    <path d="M7 17v-3h4v3" />
    <path d="M22 17h-2" />
    <path d="M2 17h1" />
    <path d="M19.99 17H7V6.5l2-3.5h6l2 3.5V17" />
    <circle cx="5" cy="17" r="2" />
    <circle cx="19" cy="17" r="2" />
  </svg>
);

export default TruckChartIcon;
