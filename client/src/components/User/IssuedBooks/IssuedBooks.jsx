import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatCard from "../../Common/StatCard/StatCard";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import ErrorMessage from "../../Common/ErrorMessage";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function IssuedBooks() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [finesSummary, setFinesSummary] = useState({
    totalUnpaidFine: 0,
    totalIssuedCount: 0,
    overdueCount: 0,
    fineDetails: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingReturnId, setSubmittingReturnId] = useState(null);

  const fetchLoansAndFines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [issuedRes, finesRes] = await Promise.all([
        api.get("/book/my-issued"),
        api.get("/book/my-fines"),
      ]);
      setIssuedBooks(issuedRes.data || []);
      setFinesSummary(
        finesRes.data || {
          totalUnpaidFine: 0,
          totalIssuedCount: 0,
          overdueCount: 0,
          fineDetails: [],
        }
      );
    } catch (err) {
      console.error("Error fetching issued books and fines:", err);
      setError(
        err.response?.data?.message ||
          "Could not retrieve your issued loans or fine details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoansAndFines();
  }, [fetchLoansAndFines]);

  const handleReturnRequest = async (transactionId, bookTitle) => {
    if (submittingReturnId) return;
    setSubmittingReturnId(transactionId);
    try {
      const response = await api.put(`/book/return-request/${transactionId}`);
      toast.success(
        response.data?.message ||
          `Return request for "${bookTitle}" submitted to the library counter.`
      );
      await fetchLoansAndFines();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to request return. Please verify with library staff."
      );
    } finally {
      setSubmittingReturnId(null);
    }
  };

  const getDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return { text: "N/A", isOverdue: false, isDueSoon: false };
    const due = new Date(dueDateStr);
    const today = new Date();
    // Zero out time
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} OVERDUE`,
        isOverdue: true,
        isDueSoon: false,
      };
    } else if (diffDays === 0) {
      return { text: "Due Today", isOverdue: false, isDueSoon: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, isOverdue: false, isDueSoon: true };
    } else {
      return { text: `${diffDays} days left`, isOverdue: false, isDueSoon: false };
    }
  };

  return (
    <DashboardLayout role="student" title="Issued Books & Fines">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Issued Books & Fine Summary</h2>
        <p className="page-subtitle">
          Monitor your active book loans, upcoming due dates, and fine accounts
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard
          icon="📖"
          label="Active Loans"
          value={issuedBooks.length}
          subtext="Books currently borrowed"
          color="blue"
        />
        <StatCard
          icon="⏰"
          label="Overdue Titles"
          value={finesSummary.overdueCount || 0}
          subtext={finesSummary.overdueCount > 0 ? "Requires urgent return" : "All books on time"}
          color={finesSummary.overdueCount > 0 ? "red" : "green"}
        />
        <StatCard
          icon="💰"
          label="Unpaid Fine"
          value={`₹${finesSummary.totalUnpaidFine || 0}`}
          subtext="Standard ₹10/day overdue rate"
          color={finesSummary.totalUnpaidFine > 0 ? "red" : "green"}
        />
      </div>

      {loading && <Loading text="Fetching your loans and fines records..." />}
      {error && <ErrorMessage message={error} retry={fetchLoansAndFines} />}

      {!loading && !error && (
        <>
          {/* Active Loans Section */}
          <div style={{ marginBottom: 36 }}>
            <div className="dashboard-section-header">
              <h3>Currently Borrowed Books ({issuedBooks.length})</h3>
            </div>

            {issuedBooks.length === 0 ? (
              <EmptyState
                icon="📖"
                title="No active book loans"
                message="You currently do not have any borrowed books in your possession."
              />
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Remaining Time</th>
                      <th>Status</th>
                      <th>Fine</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedBooks.map((item) => {
                      const book = item.bookId || item.book || {};
                      const { text: remainingText, isOverdue, isDueSoon } = getDaysRemaining(item.dueDate);
                      const isReturnPending = item.status === "RETURN_REQUESTED";

                      let badgeStatus = "active";
                      if (isOverdue) badgeStatus = "overdue";
                      else if (isDueSoon) badgeStatus = "due_soon";
                      else if (isReturnPending) badgeStatus = "pending";

                      return (
                        <tr key={item._id}>
                          <td>
                            <strong>{book.title || "Untitled Book"}</strong>
                            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                              by {book.author || "Unknown"}
                            </div>
                          </td>
                          <td>
                            {item.issueDate
                              ? new Date(item.issueDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <span style={{
                              fontWeight: isOverdue ? 700 : 500,
                              color: isOverdue ? "var(--color-error)" : isDueSoon ? "var(--color-warning)" : "inherit"
                            }}>
                              {item.dueDate
                                ? new Date(item.dueDate).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: isOverdue ? "var(--color-error)" : isDueSoon ? "var(--color-warning)" : "var(--color-text-muted)"
                            }}>
                              {remainingText}
                            </span>
                          </td>
                          <td>
                            <StatusBadge
                              status={badgeStatus}
                              label={isReturnPending ? "Return Pending" : isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Active Loan"}
                            />
                          </td>
                          <td>
                            {item.fineAmount > 0 ? (
                              <span style={{ color: "var(--color-error)", fontWeight: 700 }}>
                                ₹{item.fineAmount}
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-success)", fontSize: 13 }}>
                                None
                              </span>
                            )}
                          </td>
                          <td>
                            {isReturnPending ? (
                              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                Under Review
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={submittingReturnId === item._id}
                                onClick={() => handleReturnRequest(item._id, book.title)}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "var(--color-surface-hover)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: submittingReturnId === item._id ? "not-allowed" : "pointer"
                                }}
                              >
                                {submittingReturnId === item._id ? "Submitting..." : "Return Book"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Fines Breakdown Section */}
          <div>
            <div className="dashboard-section-header">
              <h3>Fines & Settlement Records</h3>
            </div>

            {(finesSummary.fineDetails || []).length === 0 ? (
              <EmptyState
                icon="💰"
                title="No fine records on file"
                message="Great job! You have no recorded overdue charges or unpaid fines."
              />
            ) : (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Reason</th>
                      <th>Fine Amount</th>
                      <th>Recorded Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finesSummary.fineDetails.map((f, idx) => {
                      const book = f.bookId || f.book || {};
                      const isPaid = (f.status || "").toUpperCase() === "PAID";
                      return (
                        <tr key={f._id || idx}>
                          <td><strong>{book.title || "Library Loan"}</strong></td>
                          <td>{f.reason || "Overdue Book Return"}</td>
                          <td><strong>₹{f.amount}</strong></td>
                          <td>{f.date ? new Date(f.date).toLocaleDateString() : "Recent"}</td>
                          <td>
                            <StatusBadge
                              status={isPaid ? "paid" : "unpaid"}
                              label={isPaid ? "Paid" : "Pending Payment"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default IssuedBooks;
