import crypto from "crypto";
import Admin from "./adminModel.js";
import serializeAdmin from "./adminAuthSerializer.js";
import {
  setAdminAuthCookie,
  clearAdminAuthCookie,
} from "../../middleware/adminAuthMiddleware.js";
import { sendAdminPasswordResetEmail } from "../../utils/mailer.js";

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// POST /api/admin/signup
export const adminSignupHandler = async (req, res, next) => {
  try {
    const { name, email, password, role, signupSecret } = req.body;

    // Security gate: first admin can bootstrap freely; subsequent signups check ADMIN_SIGNUP_SECRET if configured
    const existingAdminCount = await Admin.countDocuments();
    const configuredSecret = process.env.ADMIN_SIGNUP_SECRET;

    if (existingAdminCount > 0 && configuredSecret) {
      if (!signupSecret || signupSecret !== configuredSecret) {
        return next(
          createHttpError(403, "Invalid or missing Admin Setup Secret."),
        );
      }
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return next(
        createHttpError(409, "An admin account with this email already exists."),
      );
    }

    // First bootstrapped admin becomes super_admin by default
    const assignedRole =
      existingAdminCount === 0 ? "super_admin" : role || "admin";

    const admin = await Admin.create({
      name,
      email,
      password,
      role: assignedRole,
      lastLoginAt: new Date(),
    });

    setAdminAuthCookie(res, admin);

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully.",
      admin: serializeAdmin(admin),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/login
// export const adminLoginHandler = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email }).select("+password");

//     if (!admin || !(await admin.comparePassword(password))) {
//       return next(createHttpError(401, "Invalid email or password."));
//     }

//     if (!admin.isActive) {
//       return next(
//         createHttpError(403, "This admin account has been deactivated."),
//       );
//     }

//     admin.lastLoginAt = new Date();
//     await admin.save({ validateBeforeSave: false });

//     setAdminAuthCookie(res, admin);

//     return res.status(200).json({
//       success: true,
//       message: "Login successful.",
//       admin: serializeAdmin(admin),
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// POST /api/admin/login
export const adminLoginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return next(createHttpError(401, "Invalid email or password."));
    }

    if (!admin.isActive) {
      return next(
        createHttpError(403, "This admin account has been deactivated."),
      );
    }

    // Check DB lockout BEFORE running bcrypt (saves CPU & enforces lock)
    if (admin.isLocked) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((admin.lockUntil.getTime() - Date.now()) / 60000),
      );
      return next(
        createHttpError(
          429,
          `Account is temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        ),
      );
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      await admin.handleFailedLogin();

      if (admin.isLocked) {
        return next(
          createHttpError(
            429,
            "Too many failed login attempts. This account is now locked for 15 minutes.",
          ),
        );
      }

      return next(createHttpError(401, "Invalid email or password."));
    }

    await admin.handleSuccessfulLogin();
    setAdminAuthCookie(res, admin);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      admin: serializeAdmin(admin),
    });
  } catch (error) {
    return next(error);
  }
};
// POST /api/admin/logout
export const adminLogoutHandler = async (req, res, next) => {
  try {
    clearAdminAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/me
export const getAdminMeHandler = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      admin: serializeAdmin(req.user),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/forgot-password
export const adminForgotPasswordHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericMessage =
      "If an admin account with that email exists, a password reset link has been sent.";

    const admin = await Admin.findOne({ email, isActive: true });

    // Prevent email enumeration by returning 200 even if email doesn't exist
    if (!admin) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const rawToken = admin.createPasswordResetToken();
    await admin.save({ validateBeforeSave: false });

    const clientOrigin = (
      process.env.CLIENT_ORIGIN || "http://localhost:5173"
    ).replace(/\/+$/, "");
    const resetUrl = `${clientOrigin}/admin/reset-password/${rawToken}`;

    await sendAdminPasswordResetEmail({
      to: admin.email,
      name: admin.name,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/reset-password/:token
export const adminResetPasswordHandler = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || token.length < 32) {
      return next(createHttpError(400, "Invalid or expired password reset link."));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true,
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!admin) {
      return next(
        createHttpError(
          400,
          "Password reset token is invalid or has expired. Please request a new one.",
        ),
      );
    }

    admin.password = password; // Pre-save hook hashes with bcrypt cost 12 & updates passwordChangedAt
    admin.passwordResetToken = null;
    admin.passwordResetExpires = null;
    admin.failedLoginAttempts = 0; // Clear failed strikes on verified reset
    admin.lockUntil = null;        // Unlock account immediately
    await admin.save();

    // Clear any stale cookie so the admin logs in fresh with the new password
    clearAdminAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now sign in with your new password.",
    });
  } catch (error) {
    return next(error);
  }
};