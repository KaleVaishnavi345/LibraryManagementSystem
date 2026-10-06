import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import DashboardLayout from "../../Common/Layout/DashboardLayout";
import Loading from "../../Common/Loading";
import EmptyState from "../../Common/EmptyState";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingBookId, setRemovingBookId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/book/cart");
      setCart(response.data?.cart || []);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const removeFromCart = async (bookId) => {
    if (removingBookId) return;
    setRemovingBookId(bookId);
    try {
      await api.delete(`/book/cart/${bookId}`);
      setCart((prev) => prev.filter((book) => book._id !== bookId));
      toast.success("Book removed from cart");
    } catch (error) {
      toast.error("Error removing book from cart");
    } finally {
      setRemovingBookId(null);
    }
  };

  const checkOut = async () => {
    if (checkingOut || cart.length === 0) return;
    setCheckingOut(true);
    try {
      const response = await api.post("/book/cart/request", {});
      if (response.data.message === "Request submitted" || response.status === 200 || response.status === 201) {
        toast.success("Issue request for all cart items submitted successfully!");
        setCart([]);
        setTimeout(() => {
          navigate("/my-requests");
        }, 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting request");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Book Cart">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        transition={Bounce}
      />

      <div style={{ marginBottom: "24px" }}>
        <h2 className="page-title">Your Book Cart ({cart.length})</h2>
        <p className="page-subtitle">
          Review selected books before submitting your issue requests to the librarian
        </p>
      </div>

      {loading && <Loading text="Loading your cart..." />}

      {!loading && cart.length === 0 && (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="You haven't added any books to your cart yet. Browse the catalog to find books you want to request."
          actionText="Browse Catalog"
          onAction={() => navigate("/welcome")}
        />
      )}

      {!loading && cart.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "28px", alignItems: "start" }}>
          {/* Cart Table */}
          <div className="data-table-wrapper" style={{ margin: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Availability</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((book) => {
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
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{
                            width: 44,
                            height: 60,
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
                              <span style={{ fontSize: 20 }}>📖</span>
                            )}
                          </div>
                          <div>
                            <strong style={{ fontSize: 14 }}>{book.title}</strong>
                            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                              by {book.author || "Unknown"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{book.category || "General"}</td>
                      <td>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: isAvailable ? "var(--color-success)" : "var(--color-error)"
                        }}>
                          ● {isAvailable ? "Available" : "Waitlist Only"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={removingBookId === book._id}
                          onClick={() => removeFromCart(book._id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "var(--color-surface-hover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "12px",
                            color: "var(--color-error)",
                            fontWeight: 600,
                            cursor: removingBookId === book._id ? "not-allowed" : "pointer"
                          }}
                        >
                          {removingBookId === book._id ? "Removing..." : "Remove"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Checkout Order Summary Card */}
          <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            boxShadow: "var(--shadow-card)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-main)" }}>
              Request Summary
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--color-text-muted)" }}>
              <span>Total Books</span>
              <strong style={{ color: "var(--color-text-main)" }}>{cart.length} item{cart.length > 1 ? "s" : ""}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "var(--color-text-muted)" }}>
              <span>Standard Loan Period</span>
              <strong style={{ color: "var(--color-text-main)" }}>14 Days</strong>
            </div>

            <div style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 14,
              fontSize: 12.5,
              color: "var(--color-text-muted)",
              lineHeight: 1.4
            }}>
              Submitting requests sends these items to the library desk for librarian approval. Pick up your physical copies upon approval notification.
            </div>

            <button
              type="button"
              disabled={checkingOut}
              onClick={checkOut}
              style={{
                width: "100%",
                padding: "11px",
                backgroundColor: "var(--color-secondary)",
                color: "#ffffff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: checkingOut ? "not-allowed" : "pointer",
                marginTop: 6
              }}
            >
              {checkingOut ? "Submitting Requests..." : "Submit Issue Requests"}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Cart;
