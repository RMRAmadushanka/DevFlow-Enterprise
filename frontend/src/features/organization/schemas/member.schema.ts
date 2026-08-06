import { z } from "zod";

import { ROLES } from "@/lib/permissions";

const roleSchema = z.enum(ROLES);

export const inviteMemberSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: roleSchema,
  teamId: z.string().optional().or(z.literal("")),
  message: z.string().max(500, "Message must be 500 characters or fewer").optional().or(z.literal("")),
});

export const changeMemberRoleSchema = z.object({
  role: roleSchema,
});

export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name is required").max(60),
  description: z.string().max(240, "Description must be 240 characters or fewer").optional().or(z.literal("")),
  memberIds: z.array(z.string()).optional(),
});

export const updateTeamSchema = createTeamSchema;

export const roleDefinitionSchema = z.object({
  name: z.string().min(2, "Role name is required").max(40),
  description: z.string().max(200, "Description must be 200 characters or fewer"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
export type ChangeMemberRoleFormValues = z.infer<typeof changeMemberRoleSchema>;
export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;
export type RoleDefinitionFormValues = z.infer<typeof roleDefinitionSchema>;
