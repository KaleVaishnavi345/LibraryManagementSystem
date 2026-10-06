import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ReturnBook() {
  const [requestsList, setRequestsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("RETURN_REQUESTED");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/book/requests");
      setRequestsList(response.data || []);
    } catch (error) {
      console.error("Error fetching transactions for return processing:", error);
      toast.error("Failed to load return desk transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleProcessReturn = async (transactionId, bookTitle, studentName) => {
    if (processingId) return;
    setProcessingId(transactionId);
    try {
      const response = await api.put(`/book/return-process/${transactionId}`);
      if (response.status === 200) {
        toast.success(
          response.data?.message ||
            `Return processed for "${bookTitle}" from ${studentName}! Shelf stock replenished.`
        );
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process book return");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredList = requestsList.filter((item) => {
    const status = (item.status || "").toUpperCase();
    const student = item.userId || item.user || {};
    const book = item.bookId || item.book || {};

    const matchesTab =
      activeTab === "RETURN_REQUESTED"
        ? status === "RETURN_REQUESTED"
        : activeTab === "ISSUED"
        ? status === "ISSUED" || status === "OVERDUE"
        : activeTab === "RETURNED"
        ? status === "RETURNED"
        : true;

    const sName = (student.name || "").toLowerCase();
    const sId = (student.studentId || "").toLowerCase();
    const bTitle = (book.title || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = q === "" || sName.includes(q) || sId.includes(q) || bTitle.includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout role="admin" title="Book Return Desk">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Return Desk & Inventory Replenishment</h2>
        <p className="page-subtitle">
          Inspect returned titles, calculate overdue fines (₹10/day), and restock available inventory
        </p>
      </div>

      {/* Search and Tabs */}
      <div className="catalog-search-bar" style={{ marginBottom: 20 }}>
        <div className="catalog-search-inputs">
          <div className="search-input-box">
            <span className="search-icon-badge">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, ID, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "RETURN_REQUESTED", label: "Return Requests" },
            { key: "ISSUED", label: "Active Loans" },
            { key: "RETURNED", label: "Past Returned" },
            { key: "ALL", label: "All Loans" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`category-chip ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Loading text="Loading return desk records..." />}

      {!loading && filteredList.length === 0 && (
        <EmptyState
          icon="🔄"
          title="No items in this queue"
          message={`No book records found matching ${activeTab.toLowerCase().replace(/_/g, " ")} status.`}
        />
      )}

      {!loading && filteredList.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Fine Accrued</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const student = item.userId || item.user || {};
                const book = item.bookId || item.book || {};
                const status = (item.status || "").toUpperCase();
                const canCheckIn = status === "RETURN_REQUESTED" || status === "ISSUED" || status === "OVERDUE";

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{student.name || "Student"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {student.studentId || "N/A"}
                      </div>
                    </td>
                    <td>
                      <strong>{book.title || "Book"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {book.bookId || "N/A"}
                      </div>
                    </td>
                    <td>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "N/A"}
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
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      {canCheckIn ? (
                        <button
                          type="button"
                          disabled={processingId === item._id}
                          onClick={() => handleProcessReturn(item._id, book.title, student.name)}
                          style={{
                            padding: "6px 14px",
                            backgroundColor: "var(--color-secondary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: processingId === item._id ? "not-allowed" : "pointer"
                          }}
                        >
                          {processingId === item._id ? "Processing..." : "✓ Check In & Return"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-success)", fontWeight: 500 }}>
                          Returned
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

export default ReturnBook;
