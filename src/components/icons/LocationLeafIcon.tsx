
import React from 'react';

const LocationLeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
    <path d="M12 2s-4 4-4 8c0 2.5 1.5 4.5 4 4.5s4-2 4-4.5c0-4-4-8-4-8z" />
    <path d="M12 14.5a2.5 2.5 0 0 0 0-5" />
  </svg>
);

export default LocationLeafIcon;
