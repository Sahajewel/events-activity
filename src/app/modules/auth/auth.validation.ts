import z from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    location: z.string().optional(),
    bio: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
export const changePasswordSchema = z.object({
  body: z.object({
    // কারেন্ট পাসওয়ার্ড অবশ্যই দরকার
    currentPassword: z.string().min(6, "Current password is required"),

    // নতুন পাসওয়ার্ডের জন্য শক্তিশালী পলিসি দরকার
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter")
      .regex(/[0-9]/, "Password must include at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must include at least one special character"
      ),
  }),
});
