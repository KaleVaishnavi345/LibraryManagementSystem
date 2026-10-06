import React from "react";
import "./Tabs.css";

function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = ""
}) {
  return (
    <div className={`tabs-container ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab-button ${isActive ? "active" : ""}`}
            onClick={() => onChange && onChange(tab.value)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-badge">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
