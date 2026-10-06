import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import ConfirmationModal from "../../Common/Modal/ConfirmationModal";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function IssueRequests() {
  const [requestsList, setRequestsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/book/requests");
      setRequestsList(response.data || []);
    } catch (error) {
      console.error("Error fetching issue requests:", error);
      toast.error("Failed to load issue requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (requestId, bookTitle, studentName) => {
    setActionInProgress(true);
    try {
      const response = await api.put(`/book/requests/approve/${requestId}`);
      if (response.status === 200) {
        toast.success(`Approved loan request for "${bookTitle}" to ${studentName}!`);
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve request");
    } finally {
      setActionInProgress(false);
    }
  };

  const confirmReject = async () => {
    if (!rejectingItem) return;
    setActionInProgress(true);
    try {
      const response = await api.put(`/book/requests/reject/${rejectingItem._id}`, {
        reason: rejectReason || "Declined by library desk",
      });
      if (response.status === 200) {
        toast.warning(`Request for "${rejectingItem.bookTitle}" rejected. Notification sent.`);
        setRejectingItem(null);
        setRejectReason("");
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionInProgress(false);
    }
  };

  const filteredRequests = requestsList.filter((item) => {
    const status = (item.requestStatus || item.status || "PENDING").toUpperCase();
    if (activeFilter === "PENDING") return status === "PENDING";
    if (activeFilter === "APPROVED") return status === "APPROVED" || status === "ISSUED";
    if (activeFilter === "REJECTED") return status === "REJECTED";
    return true;
  });

  const counts = {
    pending: requestsList.filter((r) => (r.status || "").toUpperCase() === "PENDING").length,
    approved: requestsList.filter((r) => ["APPROVED", "ISSUED"].includes((r.status || "").toUpperCase())).length,
    rejected: requestsList.filter((r) => (r.status || "").toUpperCase() === "REJECTED").length,
    all: requestsList.length,
  };

  return (
    <DashboardLayout role="admin" title="Manage Issue Requests">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Student Book Issue Requests</h2>
        <p className="page-subtitle">
          Review, approve, or reject student requests to borrow physical library books
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
          { key: "PENDING", label: `Pending Review (${counts.pending})` },
          { key: "APPROVED", label: `Approved / Issued (${counts.approved})` },
          { key: "REJECTED", label: `Rejected (${counts.rejected})` },
          { key: "ALL", label: `All Requests (${counts.all})` },
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
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <Loading text="Fetching student issue requests..." />}

      {!loading && filteredRequests.length === 0 && (
        <EmptyState
          icon="📋"
          title={`No ${activeFilter.toLowerCase()} requests`}
          message={
            activeFilter === "PENDING"
              ? "All caught up! There are no pending requests requiring librarian review right now."
              : `No requests found in ${activeFilter.toLowerCase()} status.`
          }
        />
      )}

      {!loading && filteredRequests.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Requested Book</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const student = req.userId || req.user || {};
                const book = req.bookId || req.book || {};
                const status = (req.requestStatus || req.status || "PENDING").toUpperCase();
                const isPending = status === "PENDING";

                return (
                  <tr key={req._id}>
                    <td>
                      <strong>{student.name || "Student Member"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {student.studentId || "N/A"} | {student.email || ""}
                      </div>
                    </td>
                    <td>
                      <strong>{book.title || "Untitled Book"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        by {book.author || "Unknown"} (Available: {book.availableCopies ?? 0})
                      </div>
                    </td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      {isPending ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => handleApprove(req._id, book.title, student.name)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "var(--color-success)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: actionInProgress ? "not-allowed" : "pointer"
                            }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionInProgress}
                            onClick={() => setRejectingItem({
                              _id: req._id,
                              bookTitle: book.title || "Book",
                              studentName: student.name || "Student"
                            })}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "var(--color-error-subtle)",
                              border: "1px solid var(--color-error-border)",
                              color: "var(--color-error)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: actionInProgress ? "not-allowed" : "pointer"
                            }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                          {status === "APPROVED" && "Approved for Counter Pickup"}
                          {status === "REJECTED" && (req.rejectionReason || "Declined")}
                          {status === "ISSUED" && "Physical Copy Handed Over"}
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

      {/* Confirmation Modal for Rejection */}
      <ConfirmationModal
        isOpen={Boolean(rejectingItem)}
        title="Reject Book Issue Request"
        confirmText="Confirm Rejection"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmReject}
        onCancel={() => {
          setRejectingItem(null);
          setRejectReason("");
        }}
      >
        <p style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
          Are you sure you want to decline the issue request for{" "}
          <strong>"{rejectingItem?.bookTitle}"</strong> requested by{" "}
          <strong>{rejectingItem?.studentName}</strong>?
        </p>

        <div className="form-group">
          <label className="form-label">Reason for Rejection (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Copy reserved for examination reference / Damaged copy"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      </ConfirmationModal>
    </DashboardLayout>
  );
}

export default IssueRequests;
