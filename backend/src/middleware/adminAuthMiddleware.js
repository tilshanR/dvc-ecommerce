import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Admin from "../modules/adminAuth/adminModel.js";

export const ADMIN_COOKIE_NAME = "dvc_admin_token";
export const SESSION_TTL_STRING = "60m"; // REQ-NFR-SEC-08
export const SESSION_TTL_MS = 60 * 60 * 1000; // 60 minutes

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }
  return secret;
};

export const signAdminToken = (admin) =>
  jwt.sign(
    {
      sub: admin._id.toString(),
      role: admin.role,
    },
    getJwtSecret(),
    { expiresIn: SESSION_TTL_STRING },
  );

export const getAdminCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  };
};

export const setAdminAuthCookie = (res, admin) => {
  const token = signAdminToken(admin);
  res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
  return token;
};

export const clearAdminAuthCookie = (res) => {
  const { maxAge, ...clearOpts } = getAdminCookieOptions();
  res.clearCookie(ADMIN_COOKIE_NAME, clearOpts);
};
 //Brute-Force Lockout on Admin Login
// Locks IP for 15 minutes after 5 consecutive failed attempts
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // express-rate-limit v8 standard option (replaces deprecated `max: 5`)
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Too many failed login attempts. Access is temporarily locked for 15 minutes.",
    });
  },
});

// REQ-NFR-SEC-08: Protect all /api/admin/* routes + sliding-window 60m session refresh
export const protectAdmin = async (req, res, next) => {
  try {
    let token = req.cookies?.[ADMIN_COOKIE_NAME];

    // Optional Bearer header fallback (useful for Postman / automated tests)
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      const err = new Error("Authentication required. Please log in.");
      err.statusCode = 401;
      return next(err);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (jwtErr) {
      clearAdminAuthCookie(res);
      const err = new Error(
        jwtErr.name === "TokenExpiredError"
          ? "Session expired due to 60 minutes of inactivity. Please log in again."
          : "Invalid authentication token. Please log in again.",
      );
      err.statusCode = 401;
      return next(err);
    }

    const admin = await Admin.findById(decoded.sub);
    if (!admin || !admin.isActive) {
      clearAdminAuthCookie(res);
      const err = new Error("Admin account is no longer active.");
      err.statusCode = 401;
      return next(err);
    }

    if (admin.changedPasswordAfter(decoded.iat)) {
      clearAdminAuthCookie(res);
      const err = new Error(
        "Password was recently changed. Please log in again.",
      );
      err.statusCode = 401;
      return next(err);
    }

    // Attach to req.user (matches existing adminProductController comment) and req.admin
    req.user = admin;
    req.admin = admin;

    // Sliding-window refresh: extend session another 60m on active admin API calls
    if (req.cookies?.[ADMIN_COOKIE_NAME]) {
      setAdminAuthCookie(res, admin);
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

// Optional RBAC helper (e.g., requireAdminRole("super_admin"))
export const requireAdminRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const err = new Error("You do not have permission to perform this action.");
      err.statusCode = 403;
      return next(err);
    }
    return next();
  };