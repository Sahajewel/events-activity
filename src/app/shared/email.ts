// src/shared/email.ts (বা আপনার ইমেল ইউটিলিটি ফাইল)

// Resend এর পরিবর্তে Nodemailer ইম্পোর্ট করা হলো
import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

// Nodemailer ট্রান্সপোর্টার ইনিশিয়ালাইজ করা
const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465", // SSL/TLS প্রয়োজন হলে
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // লোকাল টেস্টিং এর জন্য ignoreTLS: true সেট করা যেতে পারে
    // ignoreTLS: process.env.NODE_ENV === "development",
  });
};

const transporter = createTransporter();

// sendPasswordResetEmail ফাংশনটি এখন Nodemailer ব্যবহার করবে
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  link: string
) => {
  // HTML টেমপ্লেট আপনার Resend কোড থেকে নেওয়া হয়েছে
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #8b5cf6;">Hi ${name || "there"},</h2>
      <p>We received a request to reset your EventHub password.</p>
      <p style="margin: 30px 0;">
        <a href="${link}" style="display: inline-block; padding: 14px 28px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Reset Password
        </a>
      </p>
      <p><small>This link will expire in <strong>1 hour</strong>.</small></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #888; font-size: 12px;">EventHub Team</p>
    </div>
  `;

  const mailOptions = {
    // 💡 আপনার .env থেকে নেওয়া EMAIL_FROM ব্যবহার করুন
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Reset Your EventHub Password",
    html: htmlContent,
    // টেক্সট কন্টেন্ট যুক্ত করা ভালো অভ্যাস
    text: `Reset Password Link: ${link}. This link expires in 1 hour.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    // 💡 এররটি থ্রো করে কন্ট্রোলারে পাঠান যাতে ক্লায়েন্টকে জানানো যায়
    throw new Error("Failed to send password reset email.");
  }
};
