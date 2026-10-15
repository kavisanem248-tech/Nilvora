'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { dashboardPathForRole } from '@/lib/auth/role-routes';

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let current = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not verify the signed-in account.');
        return response.json();
      })
      .then((result) => {
        if (!current) return;
        if (!result.authenticated) {
          router.replace(`/login?role=${role}`);
          return;
        }
        if (result.session.primaryRole !== role) {
          router.replace(dashboardPathForRole(result.session.primaryRole as UserRole));
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (current) router.replace(`/login?role=${role}`);
      });

    return () => {
      current = false;
    };
  }, [role, router]);

  if (!authorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600" role="status">
        Verifying your NILVORA account…
      </div>
    );
  }

  return <>{children}</>;
}
