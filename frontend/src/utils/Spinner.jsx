import React from "react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

export default function Spinner({
  size = "medium",
  color = "light",
  showText = true,
}) {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  const colorClasses = {
    light: "text-white",
    dark: "text-gray-800",
    primary: "text-blue-500",
    danger: "text-red-500",
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Spinner Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className={`${sizeClasses[size]} ${
          colorClasses[color] || "text-white"
        }`}
      >
        <FaSpinner />
      </motion.div>

  
      {showText && (
        <span
          className={`${
            colorClasses[color] || "text-white"
          } text-base font-medium `}
        >
          Loading...
        </span>
      )}
    </div>
  );
}
