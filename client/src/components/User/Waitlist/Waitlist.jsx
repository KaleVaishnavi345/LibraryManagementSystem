import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import ErrorMessage from "../../Common/ErrorMessage";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Waitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leavingIds, setLeavingIds] = useState(new Set());

  const fetchWaitlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/waiting-list/my-waitlist");
      setWaitlist(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load waitlist entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const handleLeave = async (id, bookTitle) => {
    if (leavingIds.has(id)) return;
    setLeavingIds((prev) => new Set(prev).add(id));
    try {
      await api.delete(`/waiting-list/leave/${id}`);
      toast.success(`Removed from waitlist for "${bookTitle || "Book"}"`);
      await fetchWaitlist();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to leave waitlist");
    } finally {
      setLeavingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  return (
    <DashboardLayout role="student" title="Book Waiting List">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">My Book Waiting List</h2>
        <p className="page-subtitle">
          When copies become available, notifications are generated in order of your queue position.
        </p>
      </div>

      {/* Info notice banner */}
      <div style={{
        padding: "14px 18px",
        backgroundColor: "var(--color-info-subtle)",
        border: "1px solid var(--color-info-border)",
        borderRadius: "var(--radius-md)",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "13.5px",
        color: "var(--color-info-text)"
      }}>
        <span style={{ fontSize: 20 }}>ℹ️</span>
        <div>
          <strong>Real-Time Queue Policy:</strong> Position updates automatically as preceding members borrow or leave. You will receive an immediate in-app alert when a copy is checked in.
        </div>
      </div>

      {loading && <Loading text="Fetching your waitlist positions..." />}
      {error && <ErrorMessage message={error} retry={fetchWaitlist} />}

      {!loading && !error && waitlist.length === 0 && (
        <EmptyState
          icon="⏳"
          title="No waitlist reservations"
          message="You are not currently in line for any borrowed or out-of-stock books."
        />
      )}

      {!loading && !error && waitlist.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author / Category</th>
                <th>Added On</th>
                <th>Queue Position</th>
                <th>Availability</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.map((item) => {
                const book = item.book || {};
                const isAvailable = (book.availableCopies ?? 0) > 0;
                const isLeaving = leavingIds.has(item._id);

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{book.title || "Untitled Title"}</strong>
                      {book.bookId && (
                        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                          ID: {book.bookId}
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{book.author || "Unknown"}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        {book.category || "General"}
                      </div>
                    </td>
                    <td>
                      {item.joinedDate
                        ? new Date(item.joinedDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor: "var(--color-primary)",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "12px",
                        fontWeight: 700
                      }}>
                        #{item.queuePosition || 1} in queue
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={isAvailable ? "in_stock" : "out_of_stock"}
                        label={isAvailable ? "Copy Available Now!" : "Awaiting Return"}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={isLeaving}
                        onClick={() => handleLeave(item._id, book.title)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "var(--color-error-subtle)",
                          border: "1px solid var(--color-error-border)",
                          color: "var(--color-error-text)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: isLeaving ? "not-allowed" : "pointer"
                        }}
                      >
                        {isLeaving ? "Leaving..." : "Leave Waitlist"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Waitlist;
