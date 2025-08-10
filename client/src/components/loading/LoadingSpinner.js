// src/components/ui/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex items-center space-x-2 p-4 rounded-md bg-gray-800 text-white text-sm shadow-md">
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
        ></path>
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
