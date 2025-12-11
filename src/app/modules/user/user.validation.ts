import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    bio: z.string().optional(),
    location: z.string().optional(),

    interests: z
      .string()
      .optional()
      .nullable()
      .transform((val, ctx) => {
        if (!val || val.trim() === "") {
          return [];
        }

        try {
          const parsedArray = JSON.parse(val);

          if (
            !Array.isArray(parsedArray) ||
            !parsedArray.every((item) => typeof item === "string")
          ) {
            // ⭐ পরিবর্তন: path: ctx.path সরিয়ে দেওয়া হয়েছে
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Interests must be a valid JSON array of strings.",
              // path: ctx.path, <--- এটি এখন নেই
            });
            return z.NEVER;
          }
          return parsedArray;
        } catch (error) {
          // ⭐ পরিবর্তন: path: ctx.path সরিয়ে দেওয়া হয়েছে
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Interests field is malformed JSON string.",
            // path: ctx.path, <--- এটি এখন নেই
          });
          return z.NEVER;
        }
      }),
  }),
});
