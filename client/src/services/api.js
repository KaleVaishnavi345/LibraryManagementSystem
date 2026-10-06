import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all authentication credentials
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("studentId");

      // Redirect to login if not already on an auth page
      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
