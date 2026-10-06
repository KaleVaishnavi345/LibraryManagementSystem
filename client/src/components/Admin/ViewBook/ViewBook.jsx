import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import StatusBadge from "../../Common/StatusBadge/StatusBadge";
import ConfirmationModal from "../../Common/Modal/ConfirmationModal";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CATEGORIES = [
  "All",
  "Computer Science",
  "Mathematics",
  "English",
  "Electronics",
  "Physics",
  "Business & Management"
];

function ViewBook() {
  const [booksList, setBooksList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);

  // Form states
  const [formState, setFormState] = useState({
    bookId: "",
    title: "",
    author: "",
    category: "Computer Science",
    isbn: "",
    publisher: "",
    year: "",
    totalCopies: 1,
    availableCopies: 1,
    description: "",
    syllabusRelated: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/book/search", {
        params: {
          query: searchQuery,
          category: selectedCategory === "All" ? "" : selectedCategory,
        },
      });
      setBooksList(response.data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load book catalog");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleOpenAddModal = () => {
    setFormState({
      bookId: `B${String(Date.now()).slice(-4)}`,
      title: "",
      author: "",
      category: "Computer Science",
      isbn: "",
      publisher: "",
      year: new Date().getFullYear(),
      totalCopies: 1,
      availableCopies: 1,
      description: "",
      syllabusRelated: false,
    });
    setImageFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setFormState({
      bookId: book.bookId || "",
      title: book.title || "",
      author: book.author || "",
      category: book.category || "Computer Science",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      year: book.year || "",
      totalCopies: book.totalCopies ?? 1,
      availableCopies: book.availableCopies ?? 1,
      description: book.description || "",
      syllabusRelated: book.syllabusRelated ?? false,
    });
    setImageFile(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.keys(formState).forEach((key) => {
      formData.append(key, formState[key]);
    });
    if (imageFile) {
      formData.append("img", imageFile);
    }

    try {
      const response = await api.post("/book/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 201) {
        toast.success("New book added to library catalog!");
        setIsAddModalOpen(false);
        fetchBooks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    Object.keys(formState).forEach((key) => {
      formData.append(key, formState[key]);
    });
    if (imageFile) {
      formData.append("img", imageFile);
    }

    try {
      const response = await api.put(`/book/update/${editingBook._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Book inventory details updated!");
        setEditingBook(null);
        fetchBooks();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update book");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingBook) return;
    try {
      await api.delete(`/book/${deletingBook._id}`);
      toast.success(`'${deletingBook.title}' removed from catalog`);
      setDeletingBook(null);
      fetchBooks();
    } catch (error) {
      toast.error("Failed to delete book");
    }
  };

  const renderBookFormFields = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Book Catalog ID *</label>
          <input
            type="text"
            className="form-input"
            required
            value={formState.bookId}
            onChange={(e) => setFormState({ ...formState, bookId: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Subject Category *</label>
          <select
            className="form-input"
            value={formState.category}
            onChange={(e) => setFormState({ ...formState, category: e.target.value })}
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
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
          required
          value={formState.title}
          onChange={(e) => setFormState({ ...formState, title: e.target.value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Author *</label>
          <input
            type="text"
            className="form-input"
            required
            value={formState.author}
            onChange={(e) => setFormState({ ...formState, author: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Publisher</label>
          <input
            type="text"
            className="form-input"
            value={formState.publisher}
            onChange={(e) => setFormState({ ...formState, publisher: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="form-group">
          <label className="form-label">ISBN Code</label>
          <input
            type="text"
            className="form-input"
            value={formState.isbn}
            onChange={(e) => setFormState({ ...formState, isbn: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Total Copies *</label>
          <input
            type="number"
            min="1"
            className="form-input"
            required
            value={formState.totalCopies}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 1;
              setFormState({
                ...formState,
                totalCopies: val,
                availableCopies: Math.min(val, formState.availableCopies),
              });
            }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Available Copies *</label>
          <input
            type="number"
            min="0"
            max={formState.totalCopies}
            className="form-input"
            required
            value={formState.availableCopies}
            onChange={(e) => setFormState({ ...formState, availableCopies: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description / Synopsis</label>
        <textarea
          rows="3"
          className="form-input"
          value={formState.description}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Book Cover Image</label>
        <input
          type="file"
          accept="image/*"
          className="form-input"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout role="admin" title="Book Catalog Management">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h2 className="page-title">Manage Books Catalog</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Catalog new arrivals, update copy availability, and manage book metadata
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            padding: "9px 18px",
            backgroundColor: "var(--color-secondary)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <span>➕</span>
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="catalog-search-bar" style={{ marginBottom: 20 }}>
        <div className="catalog-search-inputs">
          <div className="search-input-box">
            <span className="search-icon-badge">🔍</span>
            <input
              type="text"
              placeholder="Search catalog by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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

      {loading && <Loading text="Fetching book inventory..." />}

      {!loading && booksList.length === 0 && (
        <EmptyState
          icon="📚"
          title="No books found"
          message="No catalog titles matched your search query. Try clearing the filter or adding a new book."
          actionText="Add Book Now"
          onAction={handleOpenAddModal}
        />
      )}

      {!loading && booksList.length > 0 && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Details</th>
                <th>Author</th>
                <th>Category</th>
                <th>Copies (Total/Avail)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {booksList.map((book) => {
                const isAvailable = (book.availableCopies ?? 0) > 0;
                let imageUrl = null;
                const rawImg = book.img || book.image;
                if (rawImg) {
                  imageUrl = rawImg.startsWith("http")
                    ? rawImg
                    : `${API_BASE}/${rawImg}`;
                }

                return (
                  <tr key={book._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 50,
                          borderRadius: 4,
                          backgroundColor: "#F1F5F9",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: 18 }}>📖</span>
                          )}
                        </div>
                        <div>
                          <strong>{book.title}</strong>
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                            ID: {book.bookId || "N/A"} {book.isbn ? `| ISBN: ${book.isbn}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{book.author || "Unknown"}</td>
                    <td>{book.category || "General"}</td>
                    <td>
                      <strong>{book.totalCopies ?? 1}</strong> total /{" "}
                      <span style={{ color: isAvailable ? "var(--color-success)" : "var(--color-error)", fontWeight: 600 }}>
                        {book.availableCopies ?? 0} available
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={isAvailable ? "in_stock" : "out_of_stock"}
                        label={isAvailable ? "In Stock" : "Out of Stock"}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(book)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "var(--color-surface-hover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingBook(book)}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "var(--color-error-subtle)",
                            border: "1px solid var(--color-error-border)",
                            color: "var(--color-error)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          🗑️ Delete
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

      {/* Add Book Modal */}
      <ConfirmationModal
        isOpen={isAddModalOpen}
        title="Add New Book to Catalog"
        confirmText={submitting ? "Adding..." : "Add Book"}
        onConfirm={handleAddSubmit}
        onCancel={() => setIsAddModalOpen(false)}
      >
        <form onSubmit={handleAddSubmit}>
          {renderBookFormFields()}
        </form>
      </ConfirmationModal>

      {/* Edit Book Modal */}
      <ConfirmationModal
        isOpen={Boolean(editingBook)}
        title={`Edit Book: ${editingBook?.title}`}
        confirmText={submitting ? "Saving..." : "Save Changes"}
        onConfirm={handleEditSubmit}
        onCancel={() => setEditingBook(null)}
      >
        <form onSubmit={handleEditSubmit}>
          {renderBookFormFields()}
        </form>
      </ConfirmationModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingBook)}
        title="Confirm Book Deletion"
        message={`Are you sure you want to permanently remove "${deletingBook?.title}" from the library catalog? This action cannot be undone.`}
        confirmText="Delete Book"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingBook(null)}
      />
    </DashboardLayout>
  );
}

export default ViewBook;