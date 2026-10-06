import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./StudentNavbar.css";

function StudentNavbar() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartLength, setCartLength] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studentName = localStorage.getItem("name") || "Student";

  const fetchNavbarBadges = async () => {
    try {
      // Fetch unread notifications count
      const notifRes = await api.get("/notifications");
      if (notifRes.data && typeof notifRes.data.unreadCount === "number") {
        setUnreadCount(notifRes.data.unreadCount);
      }

      // Fetch cart count
      const cartRes = await api.get("/book/cart/length");
      if (cartRes.data && typeof cartRes.data.cartLength === "number") {
        setCartLength(cartRes.data.cartLength);
      }
    } catch (error) {
      // Non-fatal badge update failure
    }
  };

  useEffect(() => {
    fetchNavbarBadges();
    // Poll badges periodically every 15 seconds
    const interval = setInterval(fetchNavbarBadges, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("studentId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  return (
    <nav className="student-nav" aria-label="Student Library Navigation">
      <div className="student-nav-container">
        {/* Brand */}
        <NavLink to="/welcome" className="student-nav-brand">
          <span className="student-nav-logo-icon" aria-hidden="true">
            🏛️
          </span>
          <div>
            <span className="student-nav-brand-title">Archy</span>
            <span className="student-nav-brand-sub">Library Portal</span>
          </div>
        </NavLink>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="student-nav-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation links */}
        <ul className={`student-nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <li>
            <NavLink
              to="/welcome"
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Catalog
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/my-issued"
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Loans & Fines
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/my-requests"
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Issue Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/waitlist"
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Waitlist
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/library-requests"
              className={({ isActive }) =>
                `student-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              Inquiries & Requests
            </NavLink>
          </li>
        </ul>

        {/* Action icons & Profile */}
        <div className="student-nav-actions">
          {/* Notifications bell */}
          <NavLink
            to="/notifications"
            className="student-nav-icon-link"
            aria-label={`Notifications, ${unreadCount} unread`}
            title="Notifications"
          >
            <span className="student-nav-icon" aria-hidden="true">
              🔔
            </span>
            {unreadCount > 0 && (
              <span className="student-nav-badge alert">{unreadCount}</span>
            )}
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className="student-nav-icon-link"
            aria-label={`Cart, ${cartLength} items`}
            title="My Cart"
          >
            <span className="student-nav-icon" aria-hidden="true">
              🛒
            </span>
            {cartLength > 0 && (
              <span className="student-nav-badge">{cartLength}</span>
            )}
          </NavLink>

          {/* User & Logout */}
          <div className="student-nav-user">
            <span className="student-nav-greeting">
              Hello, <strong>{studentName}</strong>
            </span>
            <button
              type="button"
              className="student-nav-logout-btn"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default StudentNavbar;
