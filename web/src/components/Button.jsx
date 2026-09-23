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
    primary: "bg-brand text-brand-deep hover:bg-brand-deep hover:text-white shadow-lg shadow-brand/20",
    secondary: "bg-white text-brand-deep border-2 border-mist hover:bg-cream hover:border-brand/40",
    danger: "bg-brand text-brand-deep hover:bg-brand-deep hover:text-white shadow-lg shadow-brand/20",
    ghost: "bg-transparent text-brand-deep hover:bg-mist",
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
