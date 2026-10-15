import { UserRole } from '@/types';

export function dashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/plots';
    case 'seller':
      return '/dashboard/seller';
    case 'broker':
      return '/dashboard/broker';
    case 'builder':
      return '/dashboard/builder';
    case 'legal_pro':
      return '/dashboard/professional';
    case 'admin':
      return '/dashboard/admin';
  }
}
