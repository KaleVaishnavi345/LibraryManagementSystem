import React, { useState } from "react";
import "./Input.css";

function Input({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  autoComplete,
  showPasswordToggle = false,
  trailingIcon,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;
  const hasTrailing = isPassword || Boolean(trailingIcon);

  return (
    <div className={`input-group ${error ? "has-error" : ""} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          <span>
            {label}
            {required && <span className="input-required-star">*</span>}
          </span>
        </label>
      )}

      <div className={`input-control-wrapper ${hasTrailing ? "has-trailing" : ""}`}>
        <input
          id={inputId}
          type={actualType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className="input-field"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {isPassword ? (
          <button
            type="button"
            className="input-trailing-icon-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        ) : trailingIcon ? (
          <span className="input-trailing-icon-btn">{trailingIcon}</span>
        ) : null}
      </div>

      {error && (
        <div id={`${inputId}-error`} className="input-error-message" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default Input;
