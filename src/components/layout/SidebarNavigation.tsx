'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import {
  BriefcaseBusiness,
  FileText,
  Home,
  LandPlot,
  LogIn,
  Menu,
  Plus,
  Scale,
  TrendingUp,
  Video,
  X,
} from 'lucide-react';

interface SidebarContentsProps {
  pathname: string;
  onNavigate: () => void;
  canListProperty: boolean;
}

function SidebarContents({ pathname, onNavigate, canListProperty }: SidebarContentsProps) {
  const linkClass = (isActive: boolean) =>
    `sidebar-link${isActive ? ' is-active' : ''}`;

  return (
    <>
      <Link href="/" onClick={onNavigate} className="mb-5 flex items-center gap-3 px-2">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_3px_0_#d8d8d8,0_8px_16px_rgba(0,0,0,0.1)]">
          <Image src="/nilvora-mark.png" alt="NILVORA N logo" fill sizes="48px" className="object-contain p-1" priority />
        </span>
        <span className="min-w-0">
          <span className="block text-lg font-black leading-tight text-black">NILVORA</span>
          <span className="mt-1 block text-[10px] font-medium text-black/60">Your Dream Property. Our Priority.</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto pr-1">
        <Link href="/plots" onClick={onNavigate} className={linkClass(pathname === '/plots')}>
          <LandPlot className="h-4 w-4 shrink-0" />
          <span>Sites</span>
        </Link>
        <Link href="/rent" onClick={onNavigate} className={linkClass(pathname === '/rent')}>
          <Home className="h-4 w-4 shrink-0" />
          <span>Rent</span>
        </Link>
        <Link href="/reels" onClick={onNavigate} className={linkClass(pathname === '/reels')}>
          <Video className="h-4 w-4 shrink-0" />
          <span>Reels</span>
        </Link>
        <Link href="/compare" onClick={onNavigate} className={linkClass(pathname === '/compare')}>
          <Scale className="h-4 w-4 shrink-0" />
          <span>Compare</span>
        </Link>
        <Link href="/investment" onClick={onNavigate} className={linkClass(pathname === '/investment')}>
          <TrendingUp className="h-4 w-4 shrink-0" />
          <span>Investment</span>
        </Link>
        <Link href="/document-intelligence" onClick={onNavigate} className={linkClass(pathname === '/document-intelligence')}>
          <FileText className="h-4 w-4 shrink-0" />
          <span>Doc OCR</span>
        </Link>
        <Link href="/brokers" onClick={onNavigate} className={linkClass(pathname === '/brokers')}>
          <BriefcaseBusiness className="h-4 w-4 shrink-0" />
          <span>Broker</span>
        </Link>
      </nav>

      <div className="mt-4 space-y-2 border-t border-black/10 pt-4">
        {canListProperty && (
          <Link href="/sell" onClick={onNavigate} className="sidebar-action">
            <Plus className="h-4 w-4" />
            <span>List Property</span>
          </Link>
        )}
        <Link href="/login" onClick={onNavigate} className="sidebar-action">
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </div>
    </>
  );
}

export const SidebarNavigation: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canListProperty, setCanListProperty] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    let isCurrent = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((response) => response.json())
      .then((result) => {
        const role = result.session?.primaryRole as UserRole | undefined;
        if (isCurrent) {
          setCanListProperty(
            result.authenticated && ['seller', 'broker', 'admin'].includes(role || '')
          );
        }
      })
      .catch(() => {
        if (isCurrent) setCanListProperty(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [pathname]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-black/10 bg-[#e8e8e6] px-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-black/10 bg-white p-2 text-black shadow-sm"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 text-sm font-black text-black">
          <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-black/10 bg-white">
            <Image src="/nilvora-mark.png" alt="" fill sizes="32px" className="object-contain p-0.5" />
          </span>
          NILVORA
        </Link>
        <span className="w-9" aria-hidden="true" />
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/25 lg:hidden"
          onClick={closeMobile}
          aria-label="Close navigation overlay"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-3rem)] flex-col border-r border-black/10 bg-[#e8e8e6] p-4 shadow-[8px_0_28px_rgba(0,0,0,0.12)] transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:translate-x-0 lg:shadow-none ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-black/55">Browse NILVORA</span>
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg border border-black/10 bg-white p-1.5 text-black shadow-sm"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContents pathname={pathname} onNavigate={closeMobile} canListProperty={canListProperty} />
      </aside>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/10 bg-[#e8e8e6] p-4 lg:flex">
        <SidebarContents pathname={pathname} onNavigate={() => undefined} canListProperty={canListProperty} />
      </aside>
    </>
  );
};
