import React from "react";
import "./Badge.css";

// Helper to normalize status strings to known variants
function resolveVariant(status, explicitVariant) {
  if (explicitVariant) return explicitVariant;
  if (!status) return "neutral";

  const s = String(status).toLowerCase().replace(/[\s-]/g, "_");

  switch (s) {
    case "approved":
    case "available":
    case "in_stock":
    case "paid":
    case "active":
    case "success":
      return "success";

    case "pending":
    case "waitlisted":
    case "waiting":
    case "due_soon":
    case "warning":
      return "warning";

    case "rejected":
    case "overdue":
    case "unpaid":
    case "suspended":
    case "out_of_stock":
    case "danger":
    case "error":
      return "danger";

    case "issued":
    case "returned":
    case "info":
    case "return_requested":
      return "info";

    default:
      return "neutral";
  }
}

function Badge({
  children,
  status,
  variant,
  showDot = true,
  className = ""
}) {
  const resolvedVariant = resolveVariant(status, variant);
  const label = children || (status ? String(status).replace(/_/g, " ") : "");

  return (
    <span className={`status-pill-badge variant-${resolvedVariant} ${className}`}>
      {showDot && <span className="status-pill-dot" aria-hidden="true" />}
      <span style={{ textTransform: "capitalize" }}>{label}</span>
    </span>
  );
}

export default Badge;
