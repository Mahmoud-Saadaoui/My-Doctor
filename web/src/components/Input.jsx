import React from "react";

const Input = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  icon,
  dir = "rtl",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-right text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          dir={dir}
          className={`w-full rounded-xl border-2 px-4 py-3.5 text-right outline-none transition-all ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""} placeholder:text-gray-400`}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-right text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
