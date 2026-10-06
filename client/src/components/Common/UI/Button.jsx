import React from "react";
import "./Button.css";

function Button({
  children,
  variant = "primary", // "primary" | "secondary" | "danger"
  size = "md", // "sm" | "md" | "lg"
  fullWidth = false,
  loading = false,
  disabled = false,
  arrow = false,
  icon,
  type = "button",
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`btn-pill btn-${variant} btn-${size} ${fullWidth ? "full-width" : ""} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span>{children}</span>
          {arrow && <span className="btn-arrow" aria-hidden="true">→</span>}
        </>
      )}
    </button>
  );
}

export default Button;
