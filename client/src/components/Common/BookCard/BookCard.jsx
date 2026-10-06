import React, { useState } from "react";
import "./BookCard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function BookCard({ book, onRequest, onAddToCart, onJoinWaitlist, onViewDetails }) {
  const [imgError, setImgError] = useState(false);

  if (!book) return null;

  const isAvailable = (book.availableCopies ?? 0) > 0;
  
  // Format image URL cleanly
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
    <div className="book-card">
      <div
        className="book-card-cover"
        onClick={() => onViewDetails && onViewDetails(book)}
        style={{ cursor: onViewDetails ? "pointer" : "default" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={book.title}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="book-card-placeholder">
            <span className="book-placeholder-icon">📖</span>
            <span style={{ fontSize: 11, fontWeight: 600 }}>{book.category || "General"}</span>
          </div>
        )}
        {book.category && (
          <span className="book-card-category-tag">{book.category}</span>
        )}
      </div>

      <div className="book-card-body">
        <h3
          className="book-card-title"
          title={book.title}
          onClick={() => onViewDetails && onViewDetails(book)}
          style={{ cursor: onViewDetails ? "pointer" : "default" }}
        >
          {book.title}
        </h3>
        <p className="book-card-author">by {book.author || "Unknown"}</p>

        <div className="book-card-meta">
          <span className={`book-card-stock ${isAvailable ? "in-stock" : "out-of-stock"}`}>
            ● {isAvailable ? `${book.availableCopies} Copies Available` : "Out of Stock"}
          </span>
          {book.bookId && (
            <span style={{ color: "var(--color-text-light)", fontSize: 11 }}>
              ID: {book.bookId}
            </span>
          )}
        </div>

        <div className="book-card-actions">
          {isAvailable ? (
            <>
              {onRequest && (
                <button
                  type="button"
                  className="book-btn-primary"
                  onClick={() => onRequest(book._id)}
                  title="Submit single issue request"
                >
                  <span>Request</span>
                </button>
              )}
              {onAddToCart && (
                <button
                  type="button"
                  className="book-btn-secondary"
                  onClick={() => onAddToCart(book._id)}
                  title="Add to cart"
                  aria-label="Add to cart"
                >
                  <span>🛒</span>
                </button>
              )}
            </>
          ) : (
            onJoinWaitlist && (
              <button
                type="button"
                className="book-btn-primary"
                onClick={() => onJoinWaitlist(book._id)}
                style={{ backgroundColor: "var(--color-warning)", color: "#fff" }}
                title="Join waitlist to get notified when returned"
              >
                <span>⏳ Join Waitlist</span>
              </button>
            )
          )}

          {onViewDetails && (
            <button
              type="button"
              className="book-btn-secondary"
              onClick={() => onViewDetails(book)}
              title="View full details"
              aria-label="View book details"
            >
              <span>ℹ️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
