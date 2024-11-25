import { z } from "zod";
import { User as FirebaseUser } from "firebase/auth";

export interface User extends FirebaseUser {
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Helper function to format Zod errors
export const getZodErrorMessage = (error: z.ZodError): string => {
  return error.errors[0]?.message || "Validation error";
};

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must include an uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must include a lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must include a number"
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    "Password must include a special character"
  );

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: passwordSchema,
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
