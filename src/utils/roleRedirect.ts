import type { UserRole } from '@/contexts/AuthContext';

export const getRoleBasedRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'doctor':
      return '/doctor';
    case 'merchant':
      return '/merchant';
    case 'user':
    default:
      return '/dashboard'; // Redirect regular users to dashboard
  }
};

export const redirectByRole = (role: UserRole, router: any) => {
  const path = getRoleBasedRedirectPath(role);
  router.push(path);
};
