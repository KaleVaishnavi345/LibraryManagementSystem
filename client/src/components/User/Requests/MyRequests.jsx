import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import ErrorMessage from "../../Common/ErrorMessage";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchMyRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/book/my-requests");
      setRequests(response.data || []);
    } catch (err) {
      console.error("Error fetching my requests:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your issue requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const filteredRequests = requests.filter((r) => {
    const s = (r.requestStatus || r.status || "PENDING").toUpperCase();
    if (activeFilter === "PENDING") return s === "PENDING";
    if (activeFilter === "APPROVED") return s === "APPROVED" || s === "ISSUED";
    if (activeFilter === "REJECTED") return s === "REJECTED";
    return true;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => (r.status || "").toUpperCase() === "PENDING").length,
    approved: requests.filter((r) => ["APPROVED", "ISSUED"].includes((r.status || "").toUpperCase())).length,
    rejected: requests.filter((r) => (r.status || "").toUpperCase() === "REJECTED").length,
  };

  return (
    <DashboardLayout role="student" title="My Book Requests">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">My Book Requests</h2>
        <p className="page-subtitle">
          Track the status of your requested books and librarian approvals
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "20px",
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "12px",
        overflowX: "auto"
      }}>
        {[
          { key: "ALL", label: `All Requests (${counts.all})` },
          { key: "PENDING", label: `Pending (${counts.pending})` },
          { key: "APPROVED", label: `Approved (${counts.approved})` },
          { key: "REJECTED", label: `Rejected (${counts.rejected})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: activeFilter === tab.key ? "var(--color-primary)" : "var(--color-surface)",
              color: activeFilter === tab.key ? "#ffffff" : "var(--color-text-muted)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeFilter === tab.key ? "var(--shadow-xs)" : "none"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && <Loading text="Loading your requests..." />}
      {error && <ErrorMessage message={error} retry={fetchMyRequests} />}

      {!loading && !error && filteredRequests.length === 0 && (
        <EmptyState
          icon="📋"
          title={`No ${activeFilter.toLowerCase()} requests`}
          message={
            activeFilter === "ALL"
              ? "You have not submitted any book issue requests yet."
              : `There are currently no requests in ${activeFilter.toLowerCase()} status.`
          }
        />
      )}

      {!loading && !error && filteredRequests.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Pickup / Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const book = req.bookId || req.book || {};
                const status = (req.requestStatus || req.status || "PENDING").toUpperCase();

                return (
                  <tr key={req._id}>
                    <td>
                      <strong>{book.title || "Untitled Title"}</strong>
                      {book.category && (
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                          {book.category}
                        </div>
                      )}
                    </td>
                    <td>{book.author || "Unknown"}</td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      {status === "APPROVED" && (
                        <span style={{ color: "var(--color-success)", fontSize: 13, fontWeight: 600 }}>
                          Ready for Counter Pickup
                        </span>
                      )}
                      {status === "REJECTED" && (
                        <span style={{ color: "var(--color-error)", fontSize: 12 }}>
                          {req.rejectionReason || "Unavailable at desk"}
                        </span>
                      )}
                      {status === "PENDING" && (
                        <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                          Awaiting librarian review
                        </span>
                      )}
                      {status === "ISSUED" && (
                        <span style={{ color: "var(--color-info)", fontSize: 12, fontWeight: 500 }}>
                          Physical Book Handed Over
                        </span>
                      )}
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

export default MyRequests;
