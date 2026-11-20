import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminSignup() {
//   const { signup, isAuthenticated, loading } = useAdminAuth();
const { signup, isAuthenticated, loading } = useAdminAuth();
const navigate = useNavigate();
const basePath = window.location.hostname.startsWith("admin.") ? "" : "/admin";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    signupSecret: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) {
    // return <Navigate to="/admin" replace />;
    return <Navigate to={basePath || "/"} replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        ...(form.signupSecret.trim()
          ? { signupSecret: form.signupSecret.trim() }
          : {}),
      };
      await signup(payload);
    //   navigate("/admin", { replace: true });
    navigate(basePath || "/", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create admin account.");
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
            Create Admin Account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Passwords require 8+ characters with uppercase, lowercase, and a
            number.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@dvcstore.com"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <div>
            <label
              htmlFor="signupSecret"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Admin Setup Code{" "}
              <span className="font-normal text-gray-400">
                (required after first admin)
              </span>
            </label>
            <input
              id="signupSecret"
              name="signupSecret"
              type="password"
              value={form.signupSecret}
              onChange={handleChange}
              placeholder="Enter setup code if applicable"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#143630] focus:outline-none focus:ring-2 focus:ring-[#143630]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#143630] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f2924] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          {/* <Link
            to="/admin/login"
            className="font-medium text-[#143630] hover:underline"
          >
            Sign in
          </Link> */}
          <Link
            to={`${basePath}/login`}
            className="font-medium text-[#143630] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
