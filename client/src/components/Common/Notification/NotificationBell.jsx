import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./NotificationBell.css";

// Helper function to format relative timestamps cleanly
function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type) {
  switch (type) {
    case "REQUEST_APPROVED":
    case "REQUEST_STATUS":
      return "📚";
    case "DUE_ALERT":
      return "⏰";
    case "FINE_ALERT":
      return "💰";
    case "WAITLIST_ALERT":
      return "⏳";
    default:
      return "🔔";
  }
}

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/notifications");
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(typeof res.data.unreadCount === "number" ? res.data.unreadCount : 0);
      }
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`notification-bell-btn ${isOpen ? "active" : ""}`}
        onClick={handleToggle}
        aria-label={`Notifications, ${unreadCount} unread`}
        title="Notifications"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel" role="region" aria-label="Notifications Panel">
          <div className="notification-panel-header">
            <h4 className="notification-panel-title">
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  fontSize: 11,
                  backgroundColor: "var(--color-secondary-subtle)",
                  color: "var(--color-secondary)",
                  padding: "2px 6px",
                  borderRadius: "var(--radius-full)"
                }}>
                  {unreadCount} new
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <ul className="notification-panel-list">
            {loading && (
              <li style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <div className="loading-spinner" style={{ width: 24, height: 24, margin: "0 auto 8px" }} />
                <span style={{ fontSize: 13 }}>Loading notifications...</span>
              </li>
            )}

            {error && (
              <li style={{ padding: "16px", textAlign: "center", color: "var(--color-error-text)" }}>
                <span style={{ fontSize: 13 }}>{error}</span>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  style={{
                    display: "block",
                    margin: "8px auto 0",
                    border: "none",
                    background: "none",
                    color: "var(--color-secondary)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600
                  }}
                >
                  Try Again
                </button>
              </li>
            )}

            {!loading && !error && notifications.length === 0 && (
              <li style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔕</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-main)" }}>No notifications</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>You're all caught up!</div>
              </li>
            )}

            {!loading &&
              notifications.slice(0, 5).map((item) => {
                const isUnread = !item.isRead;
                return (
                  <li
                    key={item._id}
                    className={`notification-item ${isUnread ? "unread" : ""}`}
                    onClick={(e) => isUnread && handleMarkAsRead(item._id, e)}
                  >
                    <div className="notification-item-icon">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div className="notification-item-content">
                      <div className="notification-item-title">
                        <span>{item.title}</span>
                        {isUnread && (
                          <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "var(--color-secondary)",
                            display: "inline-block"
                          }} />
                        )}
                      </div>
                      <p className="notification-item-msg">{item.message}</p>
                      <span className="notification-item-time">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
          </ul>

          <div className="notification-panel-footer">
            <Link
              to="/notifications"
              className="notification-view-all-link"
              onClick={() => setIsOpen(false)}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
