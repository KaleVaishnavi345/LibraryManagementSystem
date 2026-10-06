import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatCard from "../../Common/StatCard/StatCard";
import Loading from "../../Common/Loading";
import ErrorMessage from "../../Common/ErrorMessage";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Admin() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    activeIssuedBooks: 0,
    pendingIssueRequests: 0,
    pendingLibraryRequests: 0,
    totalFinesCollected: 0,
    totalUnpaidFines: 0,
  });

  const fetchDashboardStats = useCallback(async (isManual = false) => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
      return;
    }

    setAdminName(localStorage.getItem("name") || "Librarian Admin");

    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/admin/dashboard-stats");
      setStats(response.data);
      if (isManual === true) {
        toast.info("📊 Admin analytics refreshed!");
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to load admin analytics. Please check server connectivity.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <DashboardLayout role="admin" title="Librarian Dashboard">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      {/* Admin Greeting Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        color: "#FFFFFF",
        padding: "24px 28px",
        borderRadius: "var(--radius-lg)",
        marginBottom: "28px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
            🛡️ Welcome, {adminName}
          </h2>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#94A3B8" }}>
            Library Desk Operations, Circulation Oversight, and Catalog Management
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboardStats(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
        >
          ↻ Refresh Analytics
        </button>
      </div>

      {loading && <Loading text="Fetching administrative analytics..." />}
      {error && <ErrorMessage message={error} retry={fetchDashboardStats} />}

      {!loading && !error && (
        <>
          {/* Main KPI Stat Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            marginBottom: "32px"
          }}>
            <StatCard
              icon="📚"
              label="Total Books Catalog"
              value={stats.totalBooks}
              subtext="Registered library titles"
              color="blue"
              onClick={() => navigate("/admin/view-book")}
            />
            <StatCard
              icon="👥"
              label="Registered Students"
              value={stats.totalStudents}
              subtext="Enrolled member accounts"
              color="green"
              onClick={() => navigate("/admin/view-user")}
            />
            <StatCard
              icon="📖"
              label="Active Loans"
              value={stats.activeIssuedBooks}
              subtext="Currently with students"
              color="navy"
              onClick={() => navigate("/admin/physical-issue")}
            />
            <StatCard
              icon="📋"
              label="Pending Requests"
              value={stats.pendingIssueRequests}
              subtext="Awaiting desk approval"
              color={stats.pendingIssueRequests > 0 ? "amber" : "green"}
              onClick={() => navigate("/admin/requests")}
            />
            <StatCard
              icon="💡"
              label="Pending Inquiries"
              value={stats.pendingLibraryRequests}
              subtext="Suggestions & complaints"
              color="blue"
            />
            <StatCard
              icon="💰"
              label="Fines Collected"
              value={`₹${stats.totalFinesCollected}`}
              subtext="Total settled revenue"
              color="green"
              onClick={() => navigate("/admin/fines")}
            />
            <StatCard
              icon="⚠️"
              label="Unpaid Penalties"
              value={`₹${stats.totalUnpaidFines}`}
              subtext="Overdue fine balances"
              color={stats.totalUnpaidFines > 0 ? "red" : "green"}
              onClick={() => navigate("/admin/fines")}
            />
          </div>

          {/* Quick Desk Action Shortcuts */}
          <div style={{ marginBottom: "36px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-text-main)" }}>
              Desk Operations & Quick Shortcuts
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}>
              {[
                { title: "Review Issue Requests", desc: "Approve or decline student book checkout requests", icon: "📋", link: "/admin/requests", color: "var(--color-secondary)" },
                { title: "Physical Issue Counter", desc: "Scan and hand over physical copies to students", icon: "📥", link: "/admin/physical-issue", color: "var(--color-primary)" },
                { title: "Process Book Returns", desc: "Verify returned book condition and log check-in", icon: "🔄", link: "/admin/return-book", color: "var(--color-info)" },
                { title: "Fine Settlement Desk", desc: "Review overdue penalties and mark fees as settled", icon: "💰", link: "/admin/fines", color: "var(--color-warning)" },
                { title: "Manage Book Catalog", desc: "Search, edit details, update stock or delete books", icon: "📚", link: "/admin/view-book", color: "var(--color-secondary)" },
                { title: "Student Directory", desc: "Inspect student borrowing history and account status", icon: "👥", link: "/admin/view-user", color: "var(--color-success)" },
              ].map((action, i) => (
                <div
                  key={i}
                  onClick={() => navigate(action.link)}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px",
                    boxShadow: "var(--shadow-card)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-card)";
                  }}
                >
                  <span style={{ fontSize: 26 }}>{action.icon}</span>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "var(--color-text-main)" }}>
                      {action.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                      {action.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Admin;
