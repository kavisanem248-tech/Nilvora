import { RoleGuard } from '@/components/auth/RoleGuard';

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="seller">{children}</RoleGuard>;
}
