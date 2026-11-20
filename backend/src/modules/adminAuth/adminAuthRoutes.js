import { Router } from "express";
import {
  adminSignupHandler,
  adminLoginHandler,
  adminLogoutHandler,
  getAdminMeHandler,
  adminForgotPasswordHandler,
  adminResetPasswordHandler,
} from "./adminAuthController.js";
import {
  adminSignupSchema,
  adminLoginSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  validateBody,
} from "./adminAuthValidation.js";
import {
  adminLoginLimiter,
  protectAdmin,
} from "../../middleware/adminAuthMiddleware.js";

const router = Router();

// Public Admin Auth endpoints
router.post("/signup", validateBody(adminSignupSchema), adminSignupHandler);

// Brute-force limiter runs BEFORE login handler (REQ-NFR-SEC-07)
router.post(
  "/login",
  adminLoginLimiter,
  validateBody(adminLoginSchema),
  adminLoginHandler,
);

router.post(
  "/forgot-password",
  validateBody(adminForgotPasswordSchema),
  adminForgotPasswordHandler,
);

router.post(
  "/reset-password/:token",
  validateBody(adminResetPasswordSchema),
  adminResetPasswordHandler,
);

// Session endpoints
router.post("/logout", adminLogoutHandler);
router.get("/me", protectAdmin, getAdminMeHandler);

export default router;