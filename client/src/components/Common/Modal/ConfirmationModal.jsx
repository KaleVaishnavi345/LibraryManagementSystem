import React from "react";
import "../Common.css";

function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  children
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
      >
        <div className="modal-header">
          <h3 id="modal-dialog-title" className="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {message && <p style={{ margin: "0 0 12px 0" }}>{message}</p>}
          {children}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-main)",
              fontSize: "13.5px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: isDestructive
                ? "var(--color-error)"
                : "var(--color-secondary)",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
