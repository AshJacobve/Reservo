# Role-Based Authentication Setup

## Overview
The application now supports role-based authentication with automatic redirection based on user roles.

## User Roles
- **admin**: Full access to admin dashboard and all features
- **user**: Access to regular user pages

## How to Add/Modify Users

### 1. Edit the User Roles Configuration
Open `lib/userRoles.ts` and modify the `userRoles` array:

```typescript
export const userRoles: UserRoleConfig[] = [
  // Admin users
  { email: 'admin@example.com', role: 'admin' },
  { email: 'youradmin@domain.com', role: 'admin' },
  
  // Regular users
  { email: 'user@example.com', role: 'user' },
  { email: 'student@soen.com', role: 'user' },
  
  // Add more users as needed
];
```

### 2. Login Redirection
After successful login:
- **Admin users** → Redirected to `/admin/dashboard`
- **Regular users** → Redirected to `/` (home page)

### 3. Customize Redirect Routes
To change where users are redirected, edit the `roleRoutes` object in `lib/userRoles.ts`:

```typescript
export const roleRoutes: Record<UserRole, string> = {
  admin: '/admin/dashboard',  // Change this for admin redirect
  user: '/',                   // Change this for user redirect
};
```

## Protected Routes

### Admin Dashboard
The `/admin/*` routes are automatically protected. Only users with the 'admin' role can access them. Non-admin users will be redirected to the home page.

### Adding Protection to Other Routes
To protect any page, wrap it with `RoleProtectedRoute`:

```tsx
import { RoleProtectedRoute } from '@/components/role-protected-route'

export default function YourPage() {
  return (
    <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/">
      {/* Your protected content */}
    </RoleProtectedRoute>
  )
}
```

## Session Management
- Users must log in each time they open the browser (session persistence)
- Authentication state is cleared when the browser is closed
- Users are NOT automatically logged in on page refresh

## Testing

### Test Admin Login
1. Use an email from the admin list in `lib/userRoles.ts`
2. Login → Should redirect to `/admin/dashboard`

### Test User Login
1. Use an email from the user list or any other email
2. Login → Should redirect to `/` (home page)

### Test Protected Routes
1. Try accessing `/admin/dashboard` without logging in → Should redirect to `/login`
2. Login as a regular user and try accessing `/admin/dashboard` → Should redirect to `/`
3. Login as an admin → Should have access to `/admin/dashboard`

## Example Users (Update These!)

```typescript
// Example configuration - customize for your needs
{ email: 'admin@soen.com', role: 'admin' }
{ email: 'professor@soen.com', role: 'admin' }
{ email: 'student1@soen.com', role: 'user' }
{ email: 'student2@soen.com', role: 'user' }
```

## Security Notes
- ⚠️ This is client-side role checking only
- For production, implement server-side role verification
- Never trust client-side checks for sensitive operations
- Consider using Firebase custom claims for production-grade role management
