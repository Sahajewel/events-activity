// src/shared/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY, // Your SendGrid API Key
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  link: string
) => {
  const mailOptions = {
    from: '"EventHub Support" <jewelsaha072@gmail.com>', // ✅ Verified email
    to,
    subject: "🔐 Reset Your EventHub Password",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">EventHub</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #333; margin: 0 0 20px 0;">Hi ${
                      name || "there"
                    } 👋</h2>
                    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      We received a request to reset your EventHub password. Click the button below to create a new password:
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${link}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #999; font-size: 14px; margin: 20px 0;">
                      ⏱️ This link will expire in <strong>5 minutes</strong>
                    </p>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                      If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                      © 2024 EventHub. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Hi ${name},\n\nReset your EventHub password: ${link}\n\nThis link expires in 5 minutes.\n\nIf you didn't request this, ignore this email.\n\nEventHub Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("❌ Email sending failed:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
