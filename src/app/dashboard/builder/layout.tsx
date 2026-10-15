import { RoleGuard } from '@/components/auth/RoleGuard';

export default function BuilderDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="builder">{children}</RoleGuard>;
}
