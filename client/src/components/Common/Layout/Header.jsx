import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../Notification/NotificationBell";
import api from "../../../services/api";
import "./Header.css";

function Header({ title, role, onToggleSidebar, onOpenProfileModal }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartLength, setCartLength] = useState(0);
  const dropdownRef = useRef(null);

  const name = localStorage.getItem("name") || (role === "admin" ? "Administrator" : "Student");
  const email = localStorage.getItem("email") || "";
  const initial = name.charAt(0).toUpperCase();

  // Fetch cart length for student
  useEffect(() => {
    if (role === "admin") return;

    const fetchCartLength = async () => {
      try {
        const res = await api.get("/book/cart/length");
        if (res.data && typeof res.data.cartLength === "number") {
          setCartLength(res.data.cartLength);
        }
      } catch (err) {
        // Non-critical
      }
    };

    fetchCartLength();
    const interval = setInterval(fetchCartLength, 15000);
    return () => clearInterval(interval);
  }, [role]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1 className="header-page-title">{title}</h1>
      </div>

      <div className="dashboard-header-right">
        {/* Student actions: Notification Bell & Cart */}
        {role !== "admin" && (
          <>
            <NotificationBell />

            <Link
              to="/cart"
              className="header-icon-link"
              title="View Book Cart"
              aria-label={`Cart, ${cartLength} items`}
            >
              <span>🛒</span>
              {cartLength > 0 && (
                <span className="header-badge">{cartLength}</span>
              )}
            </Link>
          </>
        )}

        {/* User profile dropdown */}
        <div className="header-user-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`header-user-btn ${dropdownOpen ? "active" : ""}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="header-avatar">{initial}</div>
            <div className="header-user-info">
              <span className="header-user-name">{name}</span>
              <span className="header-user-role">
                {role === "admin" ? "Staff Admin" : "Student"}
              </span>
            </div>
            <span className="header-caret">▼</span>
          </button>

          {dropdownOpen && (
            <div className="header-dropdown-menu">
              <div className="dropdown-user-details">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                {email && <div className="dropdown-user-email">{email}</div>}
              </div>

              {onOpenProfileModal && (
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfileModal();
                  }}
                >
                  <span>👤</span>
                  <span>View Profile</span>
                </button>
              )}

              <button
                type="button"
                className="dropdown-item danger"
                onClick={handleLogout}
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
