import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ role, isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const studentLinks = [
    { to: "/welcome", label: "Dashboard", icon: "📊" },
    { to: "/my-requests", label: "My Requests", icon: "📋" },
    { to: "/my-issued", label: "Issued Books & Fines", icon: "📖" },
    { to: "/waitlist", label: "Waitlist", icon: "⏳" },
    { to: "/library-requests", label: "Inquiries & Suggestions", icon: "💡" },
    { to: "/cart", label: "Book Cart", icon: "🛒" },
    { to: "/notifications", label: "Notifications", icon: "🔔" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Analytics Overview", icon: "📊" },
    { to: "/admin/view-book", label: "Manage Books", icon: "📚" },
    { to: "/admin/add-new-book", label: "Add New Book", icon: "➕" },
    { to: "/admin/view-user", label: "Student Directory", icon: "👥" },
    { to: "/admin/requests", label: "Issue Requests", icon: "📋" },
    { to: "/admin/physical-issue", label: "Physical Issue Desk", icon: "📥" },
    { to: "/admin/return-book", label: "Return Processing Desk", icon: "🔄" },
    { to: "/admin/fines", label: "Fine Management", icon: "💰" },
  ];

  const links = role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
        <div className="dashboard-sidebar-header">
          <div className="sidebar-brand-icon">🏛️</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Archy</span>
            <span className="sidebar-brand-sub">
              {role === "admin" ? "Staff Portal" : "Library Portal"}
            </span>
          </div>
        </div>

        <nav className="dashboard-sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/welcome" || link.to === "/admin"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
