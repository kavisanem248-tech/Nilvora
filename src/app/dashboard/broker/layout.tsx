import { RoleGuard } from '@/components/auth/RoleGuard';

export default function BrokerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="broker">{children}</RoleGuard>;
}
