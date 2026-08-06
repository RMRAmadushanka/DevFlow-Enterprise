import { z } from "zod";

import { getPasswordStrength } from "@/components/forms/validation/validators";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((value) => getPasswordStrength(value).score >= 2, {
    message: "Password is too weak — add upper/lowercase, a number, and a symbol",
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(60),
    lastName: z.string().min(1, "Last name is required").max(60),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  bio: z.string().max(280).optional().or(z.literal("")),
  avatarUrl: z.string().nullable().optional(),
});

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string().min(1),
  timezone: z.string().min(1),
  dateFormat: z.enum(["MDY", "DMY", "YMD"]),
});

export const notificationPreferencesSchema = z.object({
  emailProduct: z.boolean(),
  emailSecurity: z.boolean(),
  emailMarketing: z.boolean(),
  inAppMentions: z.boolean(),
  inAppDeployments: z.boolean(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(2, "Name is required").max(60),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
export type NotificationPreferencesFormValues = z.infer<typeof notificationPreferencesSchema>;
export type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;
