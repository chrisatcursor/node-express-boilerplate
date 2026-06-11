const allRoles: Record<string, string[]> = {
  user: [],
  admin: ['getUsers', 'manageUsers'],
};

const roles: string[] = Object.keys(allRoles);
const roleRights: Map<string, string[]> = new Map(Object.entries(allRoles));

export { roles, roleRights };
