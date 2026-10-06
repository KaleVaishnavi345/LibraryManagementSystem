import React, { useState } from "react";
import ConfirmationModal from "../Modal/ConfirmationModal";
import StatusBadge from "../StatusBadge/StatusBadge";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function BookDetailModal({ book, isOpen, onClose, onRequest, onAddToCart, onJoinWaitlist }) {
  const [imgError, setImgError] = useState(false);

  if (!book || !isOpen) return null;

  const isAvailable = (book.availableCopies ?? 0) > 0;

  let imageUrl = null;
  const rawImg = book.img || book.image;
  if (rawImg && !imgError) {
    if (rawImg.startsWith("http")) {
      imageUrl = rawImg;
    } else if (rawImg.startsWith("uploads/")) {
      imageUrl = `${API_BASE}/${rawImg}`;
    } else {
      imageUrl = `${API_BASE}/uploads/${rawImg}`;
    }
  }

  return (
    <ConfirmationModal
      isOpen={isOpen}
      title="Book Information & Details"
      confirmText="Close"
      cancelText="Dismiss"
      onConfirm={onClose}
      onCancel={onClose}
    >
      <div style={{ display: "flex", gap: "20px", marginBottom: "18px" }}>
        {/* Cover */}
        <div style={{
          width: "120px",
          height: "170px",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "#F1F5F9",
          overflow: "hidden",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--color-border)"
        }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ fontSize: "36px", color: "var(--color-text-light)" }}>📖</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-text-main)", margin: "0 0 4px 0" }}>
            {book.title}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: "0 0 12px 0" }}>
            by <strong>{book.author || "Unknown"}</strong>
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
            <StatusBadge
              status={isAvailable ? "in_stock" : "out_of_stock"}
              label={isAvailable ? `${book.availableCopies} Copies Available` : "Out of Stock"}
            />
            {book.category && (
              <span style={{
                fontSize: 12,
                backgroundColor: "var(--color-surface-hover)",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)"
              }}>
                📁 {book.category}
              </span>
            )}
            {book.bookId && (
              <span style={{
                fontSize: 12,
                backgroundColor: "var(--color-surface-hover)",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)"
              }}>
                ID: {book.bookId}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            {isAvailable ? (
              <>
                {onRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      onRequest(book._id);
                      onClose();
                    }}
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Request Book
                  </button>
                )}
                {onAddToCart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(book._id);
                      onClose();
                    }}
                    style={{
                      backgroundColor: "var(--color-surface-hover)",
                      color: "var(--color-text-main)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "8px 12px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                )}
              </>
            ) : (
              onJoinWaitlist && (
                <button
                  type="button"
                  onClick={() => {
                    onJoinWaitlist(book._id);
                    onClose();
                  }}
                  style={{
                    backgroundColor: "var(--color-warning)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ⏳ Join Waitlist
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Description & metadata section */}
      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "14px" }}>
        <h4 style={{ fontSize: "13.5px", fontWeight: "600", margin: "0 0 6px 0", color: "var(--color-text-main)" }}>
          Description & Overview
        </h4>
        <p style={{ fontSize: "13.5px", color: "var(--color-text-muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
          {book.description || "No detailed synopsis provided for this title."}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "10px",
          background: "#F8FAFC",
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)"
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Publisher</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{book.publisher || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Year</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{book.year || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>ISBN</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{book.isbn || "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Copies</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{book.totalCopies ?? 1}</div>
          </div>
        </div>
      </div>
    </ConfirmationModal>
  );
}

export default BookDetailModal;
