import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ProfessionalDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="legal_pro">{children}</RoleGuard>;
}
