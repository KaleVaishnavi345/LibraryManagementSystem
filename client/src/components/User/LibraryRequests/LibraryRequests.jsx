import React, { useEffect, useState, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import ErrorMessage from "../../Common/ErrorMessage";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LibraryRequests() {
  const [formData, setFormData] = useState({
    requestType: "NEW_BOOK_SUGGESTION",
    title: "",
    author: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/library-requests/my-requests");
      setHistoryList(response.data || []);
    } catch (err) {
      console.error("Error fetching library requests history:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your past requests and inquiries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Subject title is required.";
    }
    if (!formData.description.trim()) {
      errors.description = "Please provide details or a description.";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description should be at least 10 characters long.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await api.post("/library-requests/create", formData);
      toast.success(
        response.data?.message ||
          "Your request/suggestion has been submitted to the library administration!"
      );
      setFormData({
        requestType: "NEW_BOOK_SUGGESTION",
        title: "",
        author: "",
        description: "",
      });
      setFormErrors({});
      await fetchHistory();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Library Inquiries">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Book Suggestions & Library Inquiries</h2>
        <p className="page-subtitle">
          Recommend books for acquisition or submit feedback and general service inquiries to library staff
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 480px) 1fr", gap: "32px", alignItems: "start" }}>
        {/* Form Card */}
        <div style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          boxShadow: "var(--shadow-card)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: 700, color: "var(--color-text-main)" }}>
            Submit Inquiries & Suggestions
          </h3>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Inquiry Type</label>
              <select
                className="form-input"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              >
                <option value="NEW_BOOK_SUGGESTION">Book Purchase Recommendation</option>
                <option value="SYLLABUS_UPDATE">Course Syllabus Textbook Request</option>
                <option value="COMPLAINT">Facility / Service Feedback</option>
                <option value="GENERAL_QUERY">General Reference Query</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title / Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Design Patterns by GoF or Reading Room Lighting"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {formErrors.title && (
                <span style={{ color: "var(--color-error)", fontSize: 12 }}>{formErrors.title}</span>
              )}
            </div>

            {formData.requestType.includes("BOOK") && (
              <div className="form-group">
                <label className="form-label">Author / Edition (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Erich Gamma, 2nd Edition"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Details / Description *</label>
              <textarea
                className="form-input"
                rows="4"
                placeholder="Provide rationale, course name, or details to assist library staff..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: "vertical" }}
              />
              {formErrors.description && (
                <span style={{ color: "var(--color-error)", fontSize: 12 }}>{formErrors.description}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn"
              style={{ marginTop: 8 }}
            >
              {submitting ? "Submitting Inquiry..." : "Submit Inquiry"}
            </button>
          </form>
        </div>

        {/* History List */}
        <div>
          <div className="dashboard-section-header">
            <h3>Submission History ({historyList.length})</h3>
          </div>

          {loading && <Loading text="Loading your inquiry history..." />}
          {error && <ErrorMessage message={error} retry={fetchHistory} />}

          {!loading && !error && historyList.length === 0 && (
            <EmptyState
              icon="💡"
              title="No previous submissions"
              message="You haven't submitted any book suggestions or feedback tickets yet."
            />
          )}

          {!loading && !error && historyList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {historyList.map((item) => (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "18px 20px",
                    boxShadow: "var(--shadow-card)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <span style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "var(--color-text-light)",
                        letterSpacing: "0.04em"
                      }}>
                        {item.requestType?.replace(/_/g, " ")}
                      </span>
                      <h4 style={{ margin: "2px 0 0 0", fontSize: 15, fontWeight: 700, color: "var(--color-text-main)" }}>
                        {item.title}
                      </h4>
                      {item.author && (
                        <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                          Author: {item.author}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={item.status || "pending"} />
                  </div>

                  <p style={{ margin: "8px 0", fontSize: 13.5, color: "var(--color-text-main)", lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  {item.adminResponse && (
                    <div style={{
                      backgroundColor: "#F8FAFC",
                      borderLeft: "3px solid var(--color-secondary)",
                      padding: "8px 12px",
                      borderRadius: 4,
                      fontSize: 12.5,
                      marginTop: 10
                    }}>
                      <strong style={{ color: "var(--color-secondary)" }}>Librarian Response:</strong>{" "}
                      {item.adminResponse}
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: "var(--color-text-light)", marginTop: 8 }}>
                    Submitted on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LibraryRequests;
