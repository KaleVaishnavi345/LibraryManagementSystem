import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatCard from "../../Common/StatCard/StatCard";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import ConfirmationModal from "../../Common/Modal/ConfirmationModal";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageFines() {
  const [requestsList, setRequestsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("UNPAID");
  const [loading, setLoading] = useState(true);

  // Date Range Filtering state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Settle fine modal
  const [settlingItem, setSettlingItem] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/book/requests");
      setRequestsList(response.data || []);
    } catch (error) {
      console.error("Error fetching fine transactions:", error);
      toast.error("Failed to load fine records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const confirmSettleFine = async () => {
    if (!settlingItem) return;
    setActionInProgress(true);
    try {
      const response = await api.put(`/book/settle-fine/${settlingItem._id}`);
      if (response.status === 200) {
        toast.success(
          response.data?.message ||
            `Fine of ₹${settlingItem.amount} for "${settlingItem.bookTitle}" marked as settled!`
        );
        setSettlingItem(null);
        await fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to settle fine");
    } finally {
      setActionInProgress(false);
    }
  };

  // Filter transactions with fine information
  const fineTransactions = requestsList.filter((item) => {
    const fineAmt = item.fineAmount || 0;
    const fineSt = (item.fineStatus || "None").toUpperCase();
    return fineAmt > 0 || fineSt === "PAID" || fineSt === "UNPAID";
  });

  // Calculate totals
  let totalRevenue = 0;
  let pendingRevenue = 0;
  fineTransactions.forEach((tx) => {
    const amt = tx.fineAmount || 0;
    if ((tx.fineStatus || "").toUpperCase() === "PAID") {
      totalRevenue += amt;
    } else {
      pendingRevenue += amt;
    }
  });

  // Filter transactions by tab, search query, and Date Range
  const filteredList = fineTransactions.filter((item) => {
    const fineSt = (item.fineStatus || "None").toUpperCase();
    const student = item.userId || item.user || {};
    const book = item.bookId || item.book || {};

    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "UNPAID" && fineSt !== "PAID") ||
      (activeTab === "PAID" && fineSt === "PAID");

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      (student.name || "").toLowerCase().includes(q) ||
      (student.studentId || "").toLowerCase().includes(q) ||
      (book.title || "").toLowerCase().includes(q);

    // Date Range Filtering check (checking returnDate, dueDate, issueDate, or requestDate)
    let matchesDate = true;
    const targetDateStr = item.returnDate || item.dueDate || item.issueDate || item.requestDate;
    if (targetDateStr && (fromDate || toDate)) {
      const itemDate = new Date(targetDateStr);
      itemDate.setHours(0, 0, 0, 0);

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) matchesDate = false;
      }
      if (toDate && matchesDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) matchesDate = false;
      }
    }

    return matchesTab && matchesSearch && matchesDate;
  });

  // Validate date inputs
  const handleDateFilterChange = (newFrom, newTo) => {
    if (newFrom && newTo && new Date(newFrom) > new Date(newTo)) {
      toast.error("From Date cannot be after To Date");
      return;
    }
    setFromDate(newFrom);
    setToDate(newTo);
  };

  // CSV Export Function (Exports currently filtered data)
  const exportCSV = () => {
    if (filteredList.length === 0) {
      toast.warn("No data available to export.");
      return;
    }

    const headers = ["Student Name", "Student ID", "Book Title", "Book ID", "Fine Amount (INR)", "Payment Status", "Transaction Date"];
    const rows = filteredList.map((item) => {
      const student = item.userId || item.user || {};
      const book = item.bookId || item.book || {};
      const dateStr = item.returnDate
        ? new Date(item.returnDate).toLocaleDateString()
        : item.dueDate
        ? new Date(item.dueDate).toLocaleDateString()
        : "N/A";

      return [
        `"${(student.name || "Student").replace(/"/g, '""')}"`,
        `"${(student.studentId || "N/A").replace(/"/g, '""')}"`,
        `"${(book.title || "Book").replace(/"/g, '""')}"`,
        `"${(book.bookId || "N/A").replace(/"/g, '""')}"`,
        item.fineAmount || 0,
        `"${(item.fineStatus || "Pending").replace(/"/g, '""')}"`,
        `"${dateStr}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `library_fine_report_${new Date().toISOString().slice(0, 10)}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Report exported successfully as ${fileName}`);
  };

  // PDF Printable Export Function (Exports currently filtered data)
  const exportPDF = () => {
    if (filteredList.length === 0) {
      toast.warn("No data available to export.");
      return;
    }

    const printWindow = window.open("", "_blank");
    const dateRangeInfo = fromDate || toDate ? `Filter Date Range: ${fromDate || 'Beginning'} to ${toDate || 'Today'}` : 'Date Range: All Records';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Library Fine Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #1e293b; }
            h2 { color: #1e1b4b; margin-bottom: 4px; }
            p { color: #64748b; font-size: 13px; margin-top: 0; }
            .meta-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background-color: #4338ca; color: #ffffff; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge-paid { color: #166534; font-weight: bold; }
            .badge-unpaid { color: #991b1b; font-weight: bold; }
            .footer { margin-top: 30px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <h2>📚 Library Management System - Official Report</h2>
          <p>Fine Management & Overdue Settlement Ledger</p>
          <div class="meta-box">
            <strong>Generated Date:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Active Filter Tab:</strong> ${activeTab}<br/>
            <strong>Date Filter:</strong> ${dateRangeInfo}<br/>
            <strong>Total Records Exported:</strong> ${filteredList.length}
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Member</th>
                <th>Student ID</th>
                <th>Overdue Book Title</th>
                <th>Fine Amount</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredList.map((item, idx) => {
                const student = item.userId || item.user || {};
                const book = item.bookId || item.book || {};
                const isPaid = (item.fineStatus || "").toUpperCase() === "PAID";
                const dateStr = item.returnDate
                  ? new Date(item.returnDate).toLocaleDateString()
                  : item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString()
                  : "N/A";
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${student.name || "Student"}</td>
                    <td>${student.studentId || "N/A"}</td>
                    <td>${book.title || "Book"}</td>
                    <td>₹${item.fineAmount || 0}</td>
                    <td class="${isPaid ? 'badge-paid' : 'badge-unpaid'}">${isPaid ? 'PAID & CLEARED' : 'UNPAID PENDING'}</td>
                    <td>${dateStr}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
          <div class="footer">
            Library Management System • Generated for Administrator Audit
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <DashboardLayout role="admin" title="Fine Management">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="page-title">Library Fine Management & Settlement</h2>
          <p className="page-subtitle">
            Audit overdue penalties, record cash or counter receipts, and export audit reports
          </p>
        </div>

        {/* Report Export Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={exportCSV}
            style={{
              padding: "9px 16px",
              backgroundColor: "#059669",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            title="Export currently filtered report as CSV file"
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            type="button"
            onClick={exportPDF}
            style={{
              padding: "9px 16px",
              backgroundColor: "#4338ca",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            title="Export currently filtered report as printable PDF document"
          >
            <span>📄 Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard
          icon="💰"
          label="Total Overdue Fines"
          value={`₹${totalRevenue + pendingRevenue}`}
          subtext="Total fine records generated"
          color="blue"
        />
        <StatCard
          icon="⏳"
          label="Pending Unpaid"
          value={`₹${pendingRevenue}`}
          subtext="Awaiting student payment"
          color={pendingRevenue > 0 ? "red" : "green"}
        />
        <StatCard
          icon="✓"
          label="Settled & Paid"
          value={`₹${totalRevenue}`}
          subtext="Cleared penalty receipts"
          color="green"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="catalog-search-bar" style={{ marginBottom: 16 }}>
        <div className="catalog-search-inputs">
          <div className="search-input-box">
            <span className="search-icon-badge">🔍</span>
            <input
              type="text"
              placeholder="Filter by student name, ID, or book title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "UNPAID", label: "Unpaid / Pending" },
            { key: "PAID", label: "Settled / Paid" },
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

      {/* Date Range Filter Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
        padding: "12px 16px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "var(--radius-md)",
        flexWrap: "wrap"
      }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>📅 Filter Date Range:</span>
        
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "12.5px", color: "#64748b" }}>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleDateFilterChange(e.target.value, toDate)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: "12.5px", color: "#64748b" }}>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleDateFilterChange(fromDate, e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
          />
        </div>

        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={() => { setFromDate(""); setToDate(""); }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Clear Date Filter
          </button>
        )}
      </div>

      {loading && <Loading text="Loading fine records..." />}

      {!loading && filteredList.length === 0 && (
        <EmptyState
          icon="💰"
          title="No records found"
          message={`No fine entries found in ${activeTab.toLowerCase()} category matching your keyword query or selected date range.`}
        />
      )}

      {!loading && filteredList.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Member</th>
                <th>Overdue Book</th>
                <th>Fine Amount</th>
                <th>Due / Returned Date</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const student = item.userId || item.user || {};
                const book = item.bookId || item.book || {};
                const isPaid = (item.fineStatus || "").toUpperCase() === "PAID";

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{student.name || "Student"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {student.studentId || "N/A"}
                      </div>
                    </td>
                    <td>
                      <strong>{book.title || "Library Book"}</strong>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                        ID: {book.bookId || "N/A"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isPaid ? "var(--color-success)" : "var(--color-error)" }}>
                        ₹{item.fineAmount || 0}
                      </span>
                    </td>
                    <td>
                      {item.returnDate
                        ? `Returned: ${new Date(item.returnDate).toLocaleDateString()}`
                        : item.dueDate
                        ? `Due: ${new Date(item.dueDate).toLocaleDateString()}`
                        : "N/A"}
                    </td>
                    <td>
                      <StatusBadge
                        status={isPaid ? "paid" : "unpaid"}
                        label={isPaid ? "Paid & Cleared" : "Payment Pending"}
                      />
                    </td>
                    <td>
                      {!isPaid ? (
                        <button
                          type="button"
                          onClick={() => setSettlingItem({
                            _id: item._id,
                            amount: item.fineAmount || 0,
                            bookTitle: book.title || "Book",
                            studentName: student.name || "Student"
                          })}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "var(--color-success)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Settle Fine
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-success)", fontWeight: 500 }}>
                          ✓ Receipt Logged
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

      {/* Settle Fine Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(settlingItem)}
        title="Settle Overdue Fine Payment"
        message={`Confirm settlement of ₹${settlingItem?.amount} overdue penalty for "${settlingItem?.bookTitle}" paid by ${settlingItem?.studentName}?`}
        confirmText="Confirm Settlement"
        cancelText="Cancel"
        onConfirm={confirmSettleFine}
        onCancel={() => setSettlingItem(null)}
      />
    </DashboardLayout>
  );
}

export default ManageFines;

