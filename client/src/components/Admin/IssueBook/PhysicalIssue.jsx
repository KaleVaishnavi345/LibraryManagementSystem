import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PhysicalIssue() {
  const [requestsList, setRequestsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("APPROVED");
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/book/requests");
      setRequestsList(response.data || []);
    } catch (error) {
      console.error("Error fetching transactions for physical issue:", error);
      toast.error("Failed to load counter requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleIssuePhysicalBook = async (transactionId, bookTitle, studentName) => {
    if (issuingId) return;
    setIssuingId(transactionId);
    try {
      const response = await api.put(`/book/issue-physical/${transactionId}`);
      if (response.status === 200) {
        toast.success(
          response.data?.message ||
            `Physical copy of "${bookTitle}" issued to ${studentName}! Due date assigned.`
        );
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to issue physical book");
    } finally {
      setIssuingId(null);
    }
  };

  const filteredList = requestsList.filter((item) => {
    const status = (item.status || item.requestStatus || "").toUpperCase();
    const student = item.userId || item.user || {};
    const book = item.bookId || item.book || {};

    const matchesTab =
      activeTab === "APPROVED"
        ? status === "APPROVED"
        : activeTab === "ISSUED"
        ? status === "ISSUED"
        : true;

    const sName = (student.name || "").toLowerCase();
    const sId = (student.studentId || "").toLowerCase();
    const bTitle = (book.title || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = q === "" || sName.includes(q) || sId.includes(q) || bTitle.includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <DashboardLayout role="admin" title="Physical Issue Desk">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Physical Issue Counter & Due Date Assignment</h2>
        <p className="page-subtitle">
          Verify approved student requests, hand over shelf copies, and register the 14-day borrowing loan
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
            { key: "APPROVED", label: "Ready for Pickup" },
            { key: "ISSUED", label: "Currently Issued" },
            { key: "ALL", label: "All Records" },
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

      {loading && <Loading text="Loading counter queue..." />}

      {!loading && filteredList.length === 0 && (
        <EmptyState
          icon="📥"
          title="No counter transactions"
          message={`No records found in ${activeTab.toLowerCase()} status matching your search.`}
        />
      )}

      {!loading && filteredList.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Member</th>
                <th>Requested Book</th>
                <th>Available Copies</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const student = item.userId || item.user || {};
                const book = item.bookId || item.book || {};
                const status = (item.status || item.requestStatus || "").toUpperCase();
                const isApproved = status === "APPROVED";

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{student.name || "Student"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {student.studentId || "N/A"} | {student.email || ""}
                      </div>
                    </td>
                    <td>
                      <strong>{book.title || "Book"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {book.bookId || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {book.availableCopies ?? 0} on shelf
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      {isApproved ? (
                        <button
                          type="button"
                          disabled={issuingId === item._id}
                          onClick={() => handleIssuePhysicalBook(item._id, book.title, student.name)}
                          style={{
                            padding: "7px 14px",
                            backgroundColor: "var(--color-secondary)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: issuingId === item._id ? "not-allowed" : "pointer"
                          }}
                        >
                          {issuingId === item._id ? "Processing..." : "📥 Hand Over & Issue"}
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                          {status === "ISSUED" ? `Issued (Due: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "14 Days"})` : status}
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

export default PhysicalIssue;
