import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Please enter a valid email format.",
    }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain at least one uppercase letter and one number.",
    }),
  displayName: z.string().min(6, "Display name is required"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: "Please enter a valid email format.",
    }),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/^(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain at least one uppercase letter and one number.",
    }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

//   export type CookieCollectionInput = z.infer<typeof cookieCollectionSchema>;
//   export type IndividualCookieInput = z.infer<typeof individualCookieSchema>;
//   export type OrderInput = z.infer<typeof orderSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
