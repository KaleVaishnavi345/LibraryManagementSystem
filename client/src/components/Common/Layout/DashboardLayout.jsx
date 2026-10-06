import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ConfirmationModal from "../Modal/ConfirmationModal";
import "./DashboardLayout.css";

function DashboardLayout({ children, title = "Library Management System", role = "student" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Profile data from storage
  const name = localStorage.getItem("name") || (role === "admin" ? "Administrator" : "Student");
  const email = localStorage.getItem("email") || "N/A";
  const studentId = localStorage.getItem("studentId") || "N/A";
  const department = localStorage.getItem("department") || "General";
  const phone = localStorage.getItem("phone") || "N/A";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="dashboard-layout">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main-area">
        <Header
          title={title}
          role={role}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
        />

        <main className="dashboard-content">
          {children}
        </main>
      </div>

      {/* User Profile Modal */}
      <ConfirmationModal
        isOpen={profileModalOpen}
        title="User Account Profile"
        confirmText="Close"
        cancelText="Sign Out"
        onConfirm={() => setProfileModalOpen(false)}
        onCancel={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      >
        <div className="profile-modal-grid">
          <div className="profile-avatar-header">
            <div className="profile-big-avatar">{initial}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, color: "var(--color-text-main)" }}>
                {name}
              </h3>
              <p style={{ margin: "3px 0 0 0", fontSize: 12.5, color: "var(--color-text-muted)" }}>
                Role: <strong>{role === "admin" ? "Librarian Administrator" : "Student Member"}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="profile-field-row">
              <span className="profile-field-label">Email Address</span>
              <span className="profile-field-value">{email}</span>
            </div>
            {role !== "admin" && (
              <>
                <div className="profile-field-row">
                  <span className="profile-field-label">Student ID</span>
                  <span className="profile-field-value">{studentId}</span>
                </div>
                <div className="profile-field-row">
                  <span className="profile-field-label">Department</span>
                  <span className="profile-field-value">{department}</span>
                </div>
                <div className="profile-field-row">
                  <span className="profile-field-label">Phone Contact</span>
                  <span className="profile-field-value">{phone}</span>
                </div>
              </>
            )}
            <div className="profile-field-row">
              <span className="profile-field-label">Account Status</span>
              <span className="profile-field-value" style={{ color: "var(--color-success)", fontWeight: 600 }}>
                ● Active Verified
              </span>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

export default DashboardLayout;
