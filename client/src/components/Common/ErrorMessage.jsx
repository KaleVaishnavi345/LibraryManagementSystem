import React from "react";
import "./Common.css";

function ErrorMessage({
  title = "Unable to complete request",
  message = "An unexpected error occurred while communicating with the library system.",
  onRetry,
}) {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon" aria-hidden="true">
        ⚠️
      </div>
      <div className="error-content">
        <h4 className="error-title">{title}</h4>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button
            type="button"
            className="error-retry-btn"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
