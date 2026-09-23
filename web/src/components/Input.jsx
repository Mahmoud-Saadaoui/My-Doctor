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
        <label className="mb-2 block text-right text-sm font-semibold text-brand-deep">
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
              ? "border-brand-deep/60 bg-cream focus:border-brand-deep focus:ring-2 focus:ring-brand-deep/20"
              : "border-mist bg-cream focus:border-brand focus:ring-2 focus:ring-brand/20"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""} placeholder:text-brand/60`}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand/60">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-right text-sm text-brand-deep">{error}</p>
      )}
    </div>
  );
};

export default Input;
