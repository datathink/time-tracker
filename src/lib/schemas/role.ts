export const roles = ["owner", "manager", "member"] as const;

export type Role = (typeof roles)[number];

export const ROLE_OPTIONS = roles.map((role) => ({
  value: role,
  label: role.charAt(0).toUpperCase() + role.slice(1),
}));
