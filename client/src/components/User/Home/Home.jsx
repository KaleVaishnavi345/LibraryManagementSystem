import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatCard from "../../Common/StatCard/StatCard";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import BookCard from "../../Common/BookCard/BookCard";
import BookDetailModal from "../../Common/BookCard/BookDetailModal";
import EmptyState from "../../Common/EmptyState";
import Loading from "../../Common/Loading";
import ErrorMessage from "../../Common/ErrorMessage";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./home.css";

const CATEGORIES = [
  "All",
  "Computer Science",
  "Mathematics",
  "English",
  "Electronics",
  "Physics",
  "Business & Management"
];

function Home() {
  const navigate = useNavigate();

  const studentName = localStorage.getItem("name") || "Student";
  const [greeting, setGreeting] = useState("Good Day");

  // Dashboard Stats State
  const [stats, setStats] = useState({
    booksIssued: 0,
    requestsCount: 0,
    dueSoonCount: 0,
    totalFine: 0,
  });

  // Recent data
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Catalog State
  const [books, setBooks] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBookForModal, setSelectedBookForModal] = useState(null);

  // Set greeting according to local time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch Dashboard Stats and summaries
  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const [issuedRes, requestsRes, finesRes, notifRes] = await Promise.allSettled([
        api.get("/book/my-issued"),
        api.get("/book/my-requests"),
        api.get("/book/my-fines"),
        api.get("/notifications"),
      ]);

      let issuedList = [];
      if (issuedRes.status === "fulfilled" && Array.isArray(issuedRes.value.data)) {
        issuedList = issuedRes.value.data;
        setIssuedBooks(issuedList);
      }

      let requestsList = [];
      if (requestsRes.status === "fulfilled" && Array.isArray(requestsRes.value.data)) {
        requestsList = requestsRes.value.data;
        setRecentRequests(requestsList.slice(0, 5));
      }

      let totalFine = 0;
      let dueSoonCount = 0;
      if (finesRes.status === "fulfilled" && finesRes.value.data) {
        totalFine = finesRes.value.data.totalUnpaidFine || 0;
        dueSoonCount = finesRes.value.data.overdueCount || 0;
      }

      if (notifRes.status === "fulfilled" && notifRes.value.data) {
        setRecentNotifications(
          (notifRes.value.data.notifications || []).slice(0, 4)
        );
      }

      // Count active loans
      const activeIssued = issuedList.filter(
        (b) => (b.status || "").toUpperCase() === "ISSUED"
      ).length;

      setStats({
        booksIssued: activeIssued || issuedList.length,
        requestsCount: requestsList.filter((r) => (r.status || "").toUpperCase() === "PENDING").length,
        dueSoonCount,
        totalFine,
      });
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  // Fetch Books Catalog
  const fetchBooks = useCallback(async () => {
    try {
      setCatalogLoading(true);
      setCatalogError(null);
      const res = await api.get("/book/search", {
        params: {
          query: searchQuery,
          category: selectedCategory === "All" ? "" : selectedCategory,
        },
      });
      setBooks(res.data || []);
    } catch (err) {
      setCatalogError("Failed to load catalog books. Please try again.");
    } finally {
      setCatalogLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Request single book
  const handleRequestSingleBook = async (bookId) => {
    try {
      const res = await api.post("/book/request-single", { bookId });
      if (res.status === 201) {
        toast.success("Book issue request submitted successfully!");
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  };

  // Add to cart
  const handleAddToCart = async (bookId) => {
    try {
      const res = await api.post("/book/cart/add", { bookId });
      toast.success(res.data?.message || "Book added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
    }
  };

  // Join waitlist
  const handleJoinWaitlist = async (bookId) => {
    try {
      const res = await api.post("/waiting-list/join", { bookId });
      toast.success(res.data?.message || "Added to waitlist!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join waitlist");
    }
  };

  // Return request for issued book
  const handleReturnRequest = async (transactionId) => {
    try {
      await api.put(`/book/return-request/${transactionId}`);
      toast.success("Return request submitted to the librarian!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return");
    }
  };

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      {/* 1. Welcome Greeting Banner */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text-area">
          <h2>
            {greeting}, {studentName} 👋
          </h2>
          <p>
            Here's an overview of your borrowed titles, active requests, and library catalog.
          </p>
        </div>
        <div className="welcome-quick-actions">
          <a href="#catalog-section" className="welcome-action-btn">
            🔍 Browse Books
          </a>
          <Link to="/my-requests" className="welcome-action-btn">
            📋 My Requests
          </Link>
          <Link to="/my-issued" className="welcome-action-btn">
            📖 Loans & Fines
          </Link>
          <Link to="/waitlist" className="welcome-action-btn">
            ⏳ Waitlist
          </Link>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="dashboard-stats-grid">
        <StatCard
          icon="📚"
          label="Books Issued"
          value={stats.booksIssued}
          subtext="Currently with you"
          color="blue"
          onClick={() => navigate("/my-issued")}
        />
        <StatCard
          icon="📋"
          label="Active Requests"
          value={stats.requestsCount}
          subtext="Pending librarian approval"
          color="amber"
          onClick={() => navigate("/my-requests")}
        />
        <StatCard
          icon="⏰"
          label="Due / Overdue"
          value={stats.dueSoonCount}
          subtext={stats.dueSoonCount > 0 ? "Return promptly to avoid fines" : "All loans on schedule"}
          color={stats.dueSoonCount > 0 ? "red" : "green"}
          onClick={() => navigate("/my-issued")}
        />
        <StatCard
          icon="💰"
          label="Fine Amount"
          value={`₹${stats.totalFine}`}
          subtext={stats.totalFine > 0 ? "Unpaid overdue penalties" : "No pending fines"}
          color={stats.totalFine > 0 ? "red" : "green"}
          onClick={() => navigate("/my-issued")}
        />
      </div>

      {/* 3. Currently Issued Books Table */}
      <div style={{ marginBottom: "32px" }}>
        <div className="dashboard-section-header">
          <h3>📖 Currently Issued Books</h3>
          <Link to="/my-issued" className="section-view-all">
            View All Loans →
          </Link>
        </div>

        {issuedBooks.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No books currently issued"
            message="Explore the catalog below to borrow course textbooks or reference titles."
          />
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issuedBooks.slice(0, 5).map((item) => {
                  const book = item.bookId || item.book || {};
                  const isOverdue =
                    item.status === "OVERDUE" ||
                    (item.dueDate && new Date(item.dueDate) < new Date());
                  const statusKey = isOverdue
                    ? "overdue"
                    : (item.status || "active").toLowerCase();

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
                        <span
                          style={{
                            fontWeight: isOverdue ? 700 : 500,
                            color: isOverdue ? "var(--color-error)" : "inherit",
                          }}
                        >
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge
                          status={statusKey}
                          label={isOverdue ? "Overdue" : item.status || "Active"}
                        />
                      </td>
                      <td>
                        {item.status === "RETURN_REQUESTED" ? (
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                            Return Pending
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReturnRequest(item._id)}
                            style={{
                              padding: "5px 12px",
                              backgroundColor: "var(--color-surface-hover)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Return Book
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

      {/* 4. Side-by-side Activity (Recent Requests & Notifications) */}
      <div className="dashboard-activity-grid">
        {/* Recent Requests */}
        <div className="activity-card">
          <div className="dashboard-section-header" style={{ marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              📋 Recent Book Requests
            </h4>
            <Link to="/my-requests" className="section-view-all">
              View All
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-muted)", fontSize: 13 }}>
              No recent requests placed.
            </div>
          ) : (
            <div className="activity-list">
              {recentRequests.map((req) => {
                const book = req.bookId || req.book || {};
                return (
                  <div key={req._id} className="activity-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{book.title || "Book Request"}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <StatusBadge status={req.status || "pending"} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="activity-card">
          <div className="dashboard-section-header" style={{ marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
              🔔 Library Alerts
            </h4>
            <Link to="/notifications" className="section-view-all">
              View All
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-muted)", fontSize: 13 }}>
              No alerts at this time.
            </div>
          ) : (
            <div className="activity-list">
              {recentNotifications.map((notif) => (
                <div key={notif._id} className="activity-item">
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{notif.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {notif.message}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-light)", whiteSpace: "nowrap" }}>
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Book Browsing & Catalog Section */}
      <section id="catalog-section">
        <div className="dashboard-section-header">
          <div>
            <h3 style={{ fontSize: 20 }}>📚 Library Catalog & Book Search</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: 13.5, color: "var(--color-text-muted)" }}>
              Search course textbooks, reference guides, and reserve titles
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="catalog-search-bar">
          <div className="catalog-search-inputs">
            <div className="search-input-box">
              <span className="search-icon-badge">🔍</span>
              <input
                type="text"
                placeholder="Search by title, author, keyword, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="category-chips-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Results */}
        {catalogLoading && <Loading text="Loading library catalog..." />}
        {catalogError && <ErrorMessage message={catalogError} retry={fetchBooks} />}

        {!catalogLoading && !catalogError && books.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No matching books found"
            message={`We couldn't find any books matching "${searchQuery}". Try a different keyword or category.`}
          />
        )}

        {!catalogLoading && !catalogError && books.length > 0 && (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onRequest={handleRequestSingleBook}
                onAddToCart={handleAddToCart}
                onJoinWaitlist={handleJoinWaitlist}
                onViewDetails={(b) => setSelectedBookForModal(b)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Full Book Details Modal */}
      <BookDetailModal
        book={selectedBookForModal}
        isOpen={Boolean(selectedBookForModal)}
        onClose={() => setSelectedBookForModal(null)}
        onRequest={handleRequestSingleBook}
        onAddToCart={handleAddToCart}
        onJoinWaitlist={handleJoinWaitlist}
      />
    </DashboardLayout>
  );
}

export default Home;
