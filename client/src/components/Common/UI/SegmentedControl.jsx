import React from "react";
import "./SegmentedControl.css";

function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = true,
  className = ""
}) {
  return (
    <div
      className={`segmented-control-track ${fullWidth ? "full-width" : ""} ${className}`}
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`segmented-control-option ${isActive ? "active" : ""}`}
            onClick={() => onChange && onChange(option.value)}
          >
            {option.icon && (
              <span className="segmented-control-icon">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
