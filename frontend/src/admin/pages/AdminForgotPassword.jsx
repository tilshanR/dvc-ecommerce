import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const { data } = await api.post("/admin/forgot-password", { email });
      setSuccess(
        data.message ||
          "If an admin account with that email exists, a reset link has been sent.",
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-[#143630]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#143630]">
            DVC Store Admin
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your admin email and we will send a 15-minute reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dvcstore.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#143630] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2924] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending reset link..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-[#143630] hover:underline"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
