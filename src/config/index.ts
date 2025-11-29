import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  jwt_secret: process.env.JWT_SECRET,
  refresh_token: process.env.REFRESH_TOKEN,
  jwt_pass_secret: process.env.RESET_PASS_SECRET,
  reset_pass_expires: process.env.RESET_PASS_EXPIRES,
  jwt_access_expires: process.env.JWT_ACCESS_EXPIRES,
  jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES,

  reset_pass_link: process.env.RESET_PASS_LINK,
  reset_pass_secret: process.env.RESET_PASS_SECRET,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  emailSender: {
    email: process.env.EMAIL_SENDER_EMAIL,
    app_pass: process.env.EMAIL_SENDER_PASS_APP,
  },
};
