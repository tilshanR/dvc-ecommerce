import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}.`;

    return Promise.reject(new Error(message));
  },
);

export default api;
