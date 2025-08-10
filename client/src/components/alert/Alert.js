// src/components/ui/Alert.jsx
import React from "react";

const Alert = ({ type = "success", message }) => {
  const colors = {
    success: "bg-green-600 text-white",
    warning: "bg-yellow-500 text-black",
    error: "bg-red-600 text-white",
  };

  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={`flex items-center p-4 rounded-md shadow-md text-sm ${colors[type]} mb-4`}>
      <span className="mr-2">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
