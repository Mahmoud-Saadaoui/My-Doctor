import React from "react";

const Button = ({
  children,
  onClick,
  type = "primary",
  disabled = false,
  className = "",
  fullWidth = false,
}) => {
  const baseStyles = "rounded-xl px-6 py-3.5 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const typeStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${typeStyles[type]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
