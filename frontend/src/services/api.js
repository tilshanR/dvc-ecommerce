import axios from "axios";

const isAdminSubdomain = window.location.hostname.startsWith("admin.");

const API_BASE_URL = (
  (isAdminSubdomain
    ? import.meta.env.VITE_ADMIN_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL) ||
  `http://${window.location.hostname}:8000/api`
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Required for HTTP-only admin auth cookies
  headers: {
    Accept: "application/json",
  },
});

// Centralized error handling
api.interceptors.response.use(
  (response) => response,

  (error) => {
    // Preserve request cancellation errors
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (!error.response) {
      return Promise.reject(
        new Error(
          "Unable to connect to the server. Please check your connection.",
        ),
      );
    }
    // Notify AdminAuthContext when a protected admin API returns 401 (expired/invalid session)
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/admin/me") ||
      requestUrl.includes("/admin/login") ||
      requestUrl.includes("/admin/signup") ||
      requestUrl.includes("/admin/forgot-password") ||
      requestUrl.includes("/admin/reset-password");

    if (error.response.status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("dvc:admin-unauthorized"));
    }
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}.`;

    return Promise.reject(new Error(message));
  },
);

export default api;
