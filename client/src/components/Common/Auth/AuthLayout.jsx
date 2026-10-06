import React from "react";
import "./AuthLayout.css";

const DEFAULT_BENEFITS = [
  { icon: "📖", text: "Browse 1000+ books across all departments" },
  { icon: "🔔", text: "Get reminders before books are due" },
  { icon: "📋", text: "Join waiting lists for popular titles" },
  { icon: "💳", text: "Track and manage your fines easily" }
];

function AuthLayout({
  children,
  heading = "Your gateway to knowledge",
  description = "Access thousands of books, manage your borrowing history, track due dates and fines — all in one place.",
  benefits = DEFAULT_BENEFITS
}) {
  return (
    <div className="auth-layout-wrapper">
      <div className="auth-layout-card">
        {/* Left Information Panel */}
        <aside className="auth-info-panel">
          <div className="auth-brand-header">
            <div className="auth-app-icon" aria-hidden="true">
              <div className="auth-icon-layers">
                <span className="layer-box layer-1" />
                <span className="layer-box layer-2" />
                <span className="layer-box layer-3" />
              </div>
            </div>
            <div className="auth-brand-text">
              <span className="auth-brand-name">LibraryMS</span>
              <span className="auth-brand-tagline">College Library System</span>
            </div>
          </div>

          <h1 className="auth-info-heading">{heading}</h1>
          <p className="auth-info-desc">{description}</p>

          <div className="auth-benefits-list">
            {benefits.map((benefit, index) => (
              <div key={index} className="auth-benefit-item">
                <span className="auth-benefit-icon">{benefit.icon}</span>
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="auth-content-panel">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;
