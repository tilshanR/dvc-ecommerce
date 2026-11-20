import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Cost factor for bcrypt password hashing (higher = slower and more resistant to brute-force)
const BCRYPT_SALT_ROUNDS = 12;
// How long a password reset link/token remains valid
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
// Number of consecutive failed logins allowed before temporarily locking the account
const MAX_LOGIN_ATTEMPTS = 5;
// How long the account stays locked after reaching max login attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required."],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Admin email is required."],
      // Enforces uniqueness at the database index level; normalize casing/whitespace before saving
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
      // Excluded from query results by default so password hashes aren't accidentally leaked
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "super_admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  // Tracks consecutive failed sign-in attempts for the current lock window
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    // Timestamp until which logins are blocked; null when not locked
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Used to invalidate existing JWTs issued before a password change
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    // Stores a SHA-256 hash of the reset token
    passwordResetToken: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    // Automatically adds and maintains `createdAt` and `updatedAt` timestamps
    timestamps: true,
  },
);
// Computed property (not stored in MongoDB) indicating whether an active lockout is in effect
adminSchema.virtual("isLocked").get(function () {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
});
// Automatically hash the password whenever a new admin is created or an existing password changes
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
// Subtract 1 second so tokens issued right around the save still register as older than the change
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
});
// Verifies a plain-text login password against the stored bcrypt hash
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error(
      "Password field not selected. Use .select('+password') in your query.",
    );
  }
  return bcrypt.compare(candidatePassword, this.password);
};
// Returns true if the password was changed after the given JWT was issued (iat is in seconds)
adminSchema.methods.changedPasswordAfter = function (jwtIssuedAtSeconds) {
  if (!this.passwordChangedAt) return false;
  const changedTimestampSeconds = Math.floor(
    this.passwordChangedAt.getTime() / 1000,
  );
  return jwtIssuedAtSeconds < changedTimestampSeconds;
};
// Increments failed login count and locks the account once MAX_LOGIN_ATTEMPTS is reached
adminSchema.methods.handleFailedLogin = async function () {
  // If a previous lockout expired, clear it and start counting fresh
  if (this.lockUntil && this.lockUntil.getTime() <= Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.failedLoginAttempts += 1;
  }
// Trigger lockout and reset the attempt counter for the next cycle
  if (this.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    this.failedLoginAttempts = 0;
  }
// Skip schema validation since only lockout/attempt counters are being updated
  return this.save({ validateBeforeSave: false });
};
// Resets lockout state and updates last login timestamp after a successful sign-in
adminSchema.methods.handleSuccessfulLogin = async function () {
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  this.lastLoginAt = new Date();
  return this.save({ validateBeforeSave: false });
};
// Generates a raw reset token to send to the user while saving only its hashed version and expiry
adminSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  return rawToken;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;