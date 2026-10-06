import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CATEGORIES = [
  "Computer Science",
  "Mathematics",
  "English",
  "Electronics",
  "Physics",
  "Business & Management"
];

function Add() {
  const [form, setForm] = useState({
    bookId: `B${String(Date.now()).slice(-4)}`,
    title: "",
    author: "",
    category: "Computer Science",
    isbn: "",
    publisher: "",
    year: new Date().getFullYear(),
    quantity: 1,
    description: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const clearForm = () => {
    setForm({
      bookId: `B${String(Date.now()).slice(-4)}`,
      title: "",
      author: "",
      category: "Computer Science",
      isbn: "",
      publisher: "",
      year: new Date().getFullYear(),
      quantity: 1,
      description: "",
    });
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.author.trim()) {
      return toast.error("Title and Author are required.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("bookId", form.bookId);
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("category", form.category);
    formData.append("isbn", form.isbn);
    formData.append("publisher", form.publisher);
    formData.append("year", form.year);
    formData.append("quantity", form.quantity);
    formData.append("totalCopies", form.quantity);
    formData.append("availableCopies", form.quantity);
    formData.append("description", form.description);
    if (file) {
      formData.append("img", file);
    }

    try {
      const response = await api.post("/book/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.data?.message === "success") {
        toast.success("New book successfully cataloged!");
        clearForm();
        setTimeout(() => {
          navigate("/admin/view-book");
        }, 1200);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin" title="Add Book">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Catalog New Book</h2>
        <p className="page-subtitle">
          Register new physical acquisitions, textbook copies, and reference material
        </p>
      </div>

      <div style={{
        maxWidth: 640,
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "28px 32px",
        boxShadow: "var(--shadow-card)"
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Catalog ID *</label>
              <input
                type="text"
                className="form-input"
                required
                value={form.bookId}
                onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Category *</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Book Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Introduction to Algorithms"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Primary Author *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Thomas H. Cormen"
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MIT Press"
                value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">ISBN Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 978-0262033848"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Copies *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publication Year</label>
              <input
                type="number"
                className="form-input"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Synopsis</label>
            <textarea
              rows="3"
              className="form-input"
              placeholder="Summary of contents, edition info, or targeted course..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cover Artwork (Image file)</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="form-input"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={{ flex: 1, margin: 0 }}
            >
              {loading ? "Cataloging Book..." : "Add Book to Catalog"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              style={{
                padding: "10px 18px",
                backgroundColor: "var(--color-surface-hover)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default Add;
