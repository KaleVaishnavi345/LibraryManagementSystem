import React from "react";
import "./StatCard.css";

function StatCard({ icon, label, value, subtext, color = "blue", onClick }) {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`stat-card-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
        {subtext && <span className="stat-card-subtext">{subtext}</span>}
      </div>
    </div>
  );
}

export default StatCard;
