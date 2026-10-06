import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import ConfirmationModal from "../../Common/Modal/ConfirmationModal";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ViewUser() {
  const [studentsList, setStudentsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  // Status toggle confirmation modal
  const [togglingStudent, setTogglingStudent] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Email / Message notification modal state
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/students");
      setStudentsList(response.data || []);
    } catch (error) {
      console.error("Error fetching students directory:", error);
      toast.error("Failed to load registered student records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const confirmToggleStatus = async () => {
    if (!togglingStudent) return;
    setActionInProgress(true);
    try {
      const response = await api.put(`/admin/toggle-user-status/${togglingStudent._id}`);
      if (response.status === 200) {
        toast.success(response.data.message || `Account status updated for ${togglingStudent.name}`);
        setTogglingStudent(null);
        await fetchStudents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update account status");
    } finally {
      setActionInProgress(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      toast.error("Title and Message body are required");
      return;
    }

    setSendingNotif(true);
    try {
      const response = await api.post("/admin/send-notification", {
        studentId: notifyTarget._id,
        title: notifTitle.trim(),
        message: notifMessage.trim()
      });

      if (response.status === 200) {
        toast.success(response.data.message || "Notification sent to student email & dashboard!");
        setNotifyTarget(null);
        setNotifTitle("");
        setNotifMessage("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send notification email");
    } finally {
      setSendingNotif(false);
    }
  };

  const departments = [
    "All",
    ...new Set(studentsList.map((s) => s.department).filter(Boolean)),
  ];

  const filteredStudents = studentsList.filter((student) => {
    const name = (student.name || "").toLowerCase();
    const sId = (student.studentId || "").toLowerCase();
    const email = (student.email || "").toLowerCase();
    const phone = (student.phone || "").toLowerCase();
    const dept = (student.department || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      q === "" || name.includes(q) || sId.includes(q) || email.includes(q) || phone.includes(q) || dept.includes(q);

    const matchesDept =
      selectedDepartment === "All" || student.department === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout role="admin" title="Student Directory">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 className="page-title">Registered Students Directory</h2>
          <p className="page-subtitle">
            Search student member profiles, view borrowed book tallies, and send direct email notices
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotifyTarget({ _id: "all", name: "All Registered Active Students" });
            setNotifTitle("Important Library Announcement");
            setNotifMessage("");
          }}
          style={{
            padding: "9px 18px",
            backgroundColor: "var(--color-primary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "13.5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <span>📢 Broadcast to All Students</span>
        </button>
      </div>

      {/* Search and Department Filter */}
      <div className="catalog-search-bar" style={{ marginBottom: 20 }}>
        <div className="catalog-search-inputs">
          <div className="search-input-box">
            <span className="search-icon-badge">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, ID, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {departments.length > 1 && (
          <div className="category-chips-row">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                className={`category-chip ${selectedDepartment === dept ? "active" : ""}`}
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <Loading text="Loading student directory..." />}

      {!loading && filteredStudents.length === 0 && (
        <EmptyState
          icon="👥"
          title="No students found"
          message="No student accounts matched your search keyword or selected department filter."
        />
      )}

      {!loading && filteredStudents.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Member</th>
                <th>Email & Contact</th>
                <th>Department</th>
                <th>Registered Date</th>
                <th>Issued Books</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const isActive = student.active !== false;
                return (
                  <tr key={student._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "var(--color-secondary)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 13
                        }}>
                          {(student.name || "S").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{student.name}</strong>
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                            ID: {student.studentId || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{student.email}</div>
                      {student.phone && (
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                          📞 {student.phone}
                        </div>
                      )}
                    </td>
                    <td>{student.department || "General"}</td>
                    <td>
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>
                        {student.issuedCount || student.activeIssuedCount || 0} books
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={isActive ? "active" : "cancelled"}
                        label={isActive ? "Active Verified" : "Suspended"}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifyTarget(student);
                            setNotifTitle("Notice regarding your Library Account");
                            setNotifMessage("");
                          }}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#e0e7ff",
                            border: "1px solid #c7d2fe",
                            color: "#4338ca",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          title="Send direct email and system notification"
                        >
                          📧 Send Mail
                        </button>
                        <button
                          type="button"
                          onClick={() => setTogglingStudent(student)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: isActive ? "var(--color-error-subtle)" : "var(--color-success-subtle)",
                            border: `1px solid ${isActive ? "var(--color-error-border)" : "var(--color-success-border)"}`,
                            color: isActive ? "var(--color-error)" : "var(--color-success)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Account Status Toggle */}
      <ConfirmationModal
        isOpen={Boolean(togglingStudent)}
        title={togglingStudent?.active !== false ? "Suspend Student Account" : "Reactivate Student Account"}
        message={`Are you sure you want to ${togglingStudent?.active !== false ? "suspend" : "activate"} the library account for "${togglingStudent?.name}" (ID: ${togglingStudent?.studentId})?`}
        confirmText={togglingStudent?.active !== false ? "Suspend Account" : "Activate Account"}
        cancelText="Cancel"
        isDestructive={togglingStudent?.active !== false}
        onConfirm={confirmToggleStatus}
        onCancel={() => setTogglingStudent(null)}
      />

      {/* Email Notification Compose Modal */}
      {Boolean(notifyTarget) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "520px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "var(--color-primary)" }}>
              📧 Send Email & System Notice
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--color-text-muted)" }}>
              Recipient: <strong>{notifyTarget?.name}</strong> {notifyTarget?.email ? `(${notifyTarget.email})` : ""}
            </p>

            <form onSubmit={handleSendNotification}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Notification Subject / Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Book Due Reminder / Library Notice"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Message Body (Sent to Email & In-App Panel)
                </label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setNotifyTarget(null)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#475569",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13.5px"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  style={{
                    padding: "8px 18px",
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: 600
                  }}
                >
                  {sendingNotif ? "Sending..." : "Send Email & Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ViewUser;

