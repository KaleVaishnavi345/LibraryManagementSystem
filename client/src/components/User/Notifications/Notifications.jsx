import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import ErrorMessage from "../../Common/ErrorMessage";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load notifications. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedNotifications = async () => {
    setActionLoading(true);
    try {
      await api.post("/notifications/seed");
      toast.success("Test notifications seeded!");
      await fetchNotifications();
    } catch (err) {
      toast.error("Failed to generate test notifications");
    } finally {
      setActionLoading(false);
    }
  };

  // Group notifications into Today, Yesterday, Earlier
  const groupNotifications = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    notifications.forEach((item) => {
      const itemDate = new Date(item.createdAt || Date.now());
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        groups.today.push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groups.yesterday.push(item);
      } else {
        groups.earlier.push(item);
      }
    });

    return groups;
  };

  const groups = groupNotifications();

  const renderNotificationCard = (item) => {
    const isUnread = !item.isRead;
    const timeStr = item.createdAt
      ? new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

    return (
      <div
        key={item._id}
        onClick={() => isUnread && handleMarkAsRead(item._id)}
        style={{
          display: "flex",
          gap: "16px",
          padding: "16px 20px",
          backgroundColor: isUnread ? "#EFF6FF" : "var(--color-surface)",
          border: isUnread ? "1px solid var(--color-info-border)" : "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-xs)",
          cursor: isUnread ? "pointer" : "default",
          transition: "all 0.15s ease",
          position: "relative"
        }}
      >
        <div style={{
          width: "42px",
          height: "42px",
          borderRadius: "var(--radius-md)",
          backgroundColor: isUnread ? "rgba(37, 99, 235, 0.12)" : "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          flexShrink: 0
        }}>
          {getNotificationIcon(item.type)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h4 style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--color-text-main)",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              {item.title}
              {isUnread && (
                <span style={{
                  fontSize: 10,
                  backgroundColor: "var(--color-secondary)",
                  color: "#fff",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700
                }}>
                  NEW
                </span>
              )}
            </h4>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
              {timeStr}
            </span>
          </div>

          <p style={{ margin: "0 0 6px 0", fontSize: "13.5px", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
            {item.message}
          </p>

          {isUnread && (
            <span style={{ fontSize: "11px", color: "var(--color-secondary)", fontWeight: 600 }}>
              Click to mark as read
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout role="student" title="Notifications Center">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 24
      }}>
        <div>
          <h2 className="page-title">Notifications & Library Alerts</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Stay updated on book request approvals, overdue notices, and waitlist openings
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleMarkAllAsRead}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-secondary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Mark All as Read ({unreadCount})
            </button>
          )}

          <button
            type="button"
            disabled={actionLoading}
            onClick={handleSeedNotifications}
            style={{
              padding: "8px 14px",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-main)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            ➕ Generate Test Alerts
          </button>
        </div>
      </div>

      {loading && <Loading text="Loading your notifications..." />}
      {error && <ErrorMessage message={error} retry={fetchNotifications} />}

      {!loading && !error && notifications.length === 0 && (
        <EmptyState
          icon="🔔"
          title="No notifications"
          message="You have no notifications or library alerts at this time."
        />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 840 }}>
          {/* Today Group */}
          {groups.today.length > 0 && (
            <div>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.06em", margin: "0 0 12px 0" }}>
                Today ({groups.today.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groups.today.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {/* Yesterday Group */}
          {groups.yesterday.length > 0 && (
            <div>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.06em", margin: "0 0 12px 0" }}>
                Yesterday ({groups.yesterday.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groups.yesterday.map(renderNotificationCard)}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {groups.earlier.length > 0 && (
            <div>
              <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--color-text-muted)", letterSpacing: "0.06em", margin: "0 0 12px 0" }}>
                Earlier ({groups.earlier.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groups.earlier.map(renderNotificationCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Notifications;
