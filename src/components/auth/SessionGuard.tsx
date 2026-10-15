'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let current = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not verify your NILVORA account.');
        return response.json() as Promise<{ authenticated?: boolean }>;
      })
      .then((result) => {
        if (!current) return;
        if (!result.authenticated) {
          const query = searchParams.toString();
          const returnTo = `${pathname}${query ? `?${query}` : ''}`;
          window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        setAuthorized(true);
      })
      .catch(() => {
        if (current) {
          const query = searchParams.toString();
          const returnTo = `${pathname}${query ? `?${query}` : ''}`;
          window.location.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        }
      });

    return () => {
      current = false;
    };
  }, [pathname, searchParams]);

  if (!authorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-600" role="status">
        Verifying your NILVORA account…
      </div>
    );
  }

  return <>{children}</>;
}
