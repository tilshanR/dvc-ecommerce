import nodemailer from "nodemailer";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
};

export const sendAdminPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const transporter = createTransporter();

  const logFallback = (reason) => {
    console.log("\n================ DVC STORE ADMIN PASSWORD RESET ================");
    console.log(`Reason   : ${reason}`);
    console.log(`Admin    : ${name} <${to}>`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("================================================================\n");
  };

  if (!transporter) {
    logFallback("SMTP not configured — using demo console fallback");
    return { delivered: false, fallback: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "DVC Store Admin — Password Reset Request",
      text: `Hi ${name},\n\nReset your DVC Store admin password using this link (expires in 15 minutes):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
          <h2 style="color: #143630;">DVC Store Admin Password Reset</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your admin password. Click the button below within <strong>15 minutes</strong>:</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background: #143630; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 12px; color: #6b7280;">Or copy this link: ${resetUrl}</p>
          <p style="font-size: 12px; color: #6b7280;">If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    if (process.env.NODE_ENV !== "production") {
      logFallback("Email sent via SMTP (logged in non-prod for demo convenience)");
    }

    return { delivered: true, fallback: false };
  } catch (error) {
    console.warn("SMTP delivery failed:", error.message);
    logFallback("SMTP error — using console fallback so demo continues");
    return { delivered: false, fallback: true };
  }
};