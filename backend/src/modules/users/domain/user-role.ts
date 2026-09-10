export const USER_ROLES = {
  OPERATOR: 'OPERATOR',
  SUPERVISOR: 'SUPERVISOR',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];