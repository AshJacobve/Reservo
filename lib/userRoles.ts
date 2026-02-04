// User roles configuration
// Add user emails and their corresponding roles here

export type UserRole = 'admin' | 'user';

export interface UserRoleConfig {
  email: string;
  role: UserRole;
}

// Define your users and their roles here
export const userRoles: UserRoleConfig[] = [
  // ========== ADMIN USERS ==========
  { email: 'ashwinadmin@gmail.com', role: 'admin' },
  // Add more admin users below:
  // { email: 'another.admin@gmail.com', role: 'admin' },
  
  // ========== REGULAR USERS ==========
  { email: 'ashwinuser@gmail.com', role: 'user' },
  // Add more regular users below:
  // { email: 'another.user@gmail.com', role: 'user' },
];

// Helper function to get user role by email
export function getUserRoleByEmail(email: string): UserRole {
  const userConfig = userRoles.find(
    (config) => config.email.toLowerCase() === email.toLowerCase()
  );
  
  // Default to 'user' if email not found in configuration
  return userConfig?.role || 'user';
}

// Route mappings for different roles
export const roleRoutes: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  user: '/',
};

// Helper function to get redirect route based on role
export function getRedirectRouteForRole(role: UserRole): string {
  return roleRoutes[role];
}
