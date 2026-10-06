import React from "react";
import "../Common.css";

function StatusBadge({ status, label }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase().replace(/[\s-]/g, "_");

  // Format human-readable text if label not explicitly passed
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span className={`status-badge ${normalized}`}>
      <span className="status-badge-dot" style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: "currentColor",
        display: "inline-block"
      }} />
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
