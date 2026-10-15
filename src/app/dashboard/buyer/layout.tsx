import { RoleGuard } from '@/components/auth/RoleGuard';

export default function BuyerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="buyer">{children}</RoleGuard>;
}
