import React from "react";
import "./Common.css";

function EmptyState({
  icon = "📖",
  title = "No records found",
  message = "There are currently no items to display in this section.",
  actionText,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionText && onAction && (
        <button
          type="button"
          className="empty-state-action"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
