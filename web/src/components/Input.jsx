import React from "react";
import { useTranslation } from "react-i18next";

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
  dir,
}) => {
  const { i18n } = useTranslation();
  const inputDirection = dir || i18n.dir();
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-start text-sm font-semibold text-brand-deep">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          placeholder={placeholder}
          dir={inputDirection}
          className={`w-full rounded-xl border-2 px-4 py-3.5 text-start outline-none transition-all ${
            error
              ? "border-brand-deep/60 bg-cream focus:border-brand-deep focus:ring-2 focus:ring-brand-deep/20"
              : "border-mist bg-cream focus:border-brand focus:ring-2 focus:ring-brand/20"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""} placeholder:text-brand/60`}
        />
        {icon && (
          <div className="absolute start-4 top-1/2 -translate-y-1/2 text-brand/60">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-start text-sm text-brand-deep" role="alert">{error}</p>
      )}
    </div>
  );
};

export default Input;
