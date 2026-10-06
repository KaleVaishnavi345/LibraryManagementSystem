import React from "react";
import "./Common.css";

function Loading({ message = "Loading library records..." }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <span className="loading-text">{message}</span>
    </div>
  );
}

export default Loading;
