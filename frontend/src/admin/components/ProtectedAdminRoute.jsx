import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#143630]" />
      </div>
    );
  }

//   if (!isAuthenticated) {
//     return (
//       <Navigate
//         to="/admin/login"
//         replace
//         state={{ from: location.pathname }}
//       />
//     );
//   }

if (!isAuthenticated) {
    const loginPath = window.location.hostname.startsWith("admin.")
      ? "/login"
      : "/admin/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return children || <Outlet />;
}