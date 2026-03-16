const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
} as const;

export type Role = keyof typeof allRoles;
export type Right = typeof allRoles[keyof typeof allRoles][number];

export const roles = Object.keys(allRoles) as Role[];
export const roleRights = new Map<Role, readonly Right[]>(
  Object.entries(allRoles) as [Role, readonly Right[]][]
);
