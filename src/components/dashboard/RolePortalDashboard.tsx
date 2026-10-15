'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppointmentItem, LeadItem, PaymentOrder, PropertyItem, UserProfile } from '@/types';
import type { RevenueService } from '@/lib/payments/catalog';

type PortalData = {
  user?: Pick<UserProfile, 'id' | 'fullName' | 'email' | 'phone' | 'role'>;
  properties?: PropertyItem[];
  leads?: LeadItem[];
  payments?: PaymentOrder[];
  contactUnlocks?: Array<{ id?: string; buyerId?: string; propertyId?: string; paymentOrderId?: string; unlockedAt?: string }>;
  appointments?: AppointmentItem[];
  commissions?: unknown[];
};

type AdminData = PortalData & {
  metrics?: Record<string, number>;
  users?: UserProfile[];
  auditLogs?: Array<{ id: string; userId: string; action: string; resource: string; resourceId?: string; timestamp: string }>;
  settings?: Record<string, string>;
  services?: RevenueService[];
  revenueByRole?: Record<string, number>;
  revenueByService?: Record<string, number>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function RolePortalDashboard({ role }: { role: 'seller' | 'broker' | 'admin' }) {
  const router = useRouter();
  const [portal, setPortal] = useState<PortalData | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch(role === 'admin' ? '/api/admin' : '/api/portal', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Unable to load portal data.');
      setError('');
      if (role === 'admin') setAdminData(result as AdminData);
      else setPortal(result as PortalData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load portal data.');
    }
  }, [role]);

  useEffect(() => {
    let current = true;
    const endpoint = role === 'admin' ? '/api/admin' : '/api/portal';
    fetch(endpoint, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error(result.error || 'Unable to load portal data.');
        return result as AdminData;
      })
      .then((result) => {
        if (!current) return;
        setError('');
        if (role === 'admin') setAdminData(result);
        else setPortal(result);
      })
      .catch((cause: unknown) => {
        if (current) setError(cause instanceof Error ? cause.message : 'Unable to load portal data.');
      });
    return () => { current = false; };
  }, [role]);

  const properties = useMemo(() => role === 'admin' ? adminData?.properties || [] : portal?.properties || [], [role, adminData, portal]);
  const leads = useMemo(() => role === 'admin' ? adminData?.leads || [] : portal?.leads || [], [role, adminData, portal]);
  const payments = useMemo(() => role === 'admin' ? adminData?.payments || [] : portal?.payments || [], [role, adminData, portal]);
  const user = role === 'admin' ? adminData?.user : portal?.user;
  const hasPortalData = role === 'admin' ? Boolean(adminData) : Boolean(portal);
  const activeProperties = useMemo(() => properties.filter((property) => property.status === 'published'), [properties]);
  const pendingProperties = useMemo(() => properties.filter((property) => property.status === 'under_review'), [properties]);
  const totalViews = properties.reduce((total, property) => total + property.viewsCount, 0);
  const totalLikes = properties.reduce((total, property) => total + (property.likesCount || 0), 0);

  const submitAdminAction = async (data: Record<string, string | boolean>) => {
    setBusy(typeof data.action === 'string' ? data.action : 'update');
    setMessage('');
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'The change could not be saved.');
      setMessage('Change saved.');
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'The change could not be saved.');
    } finally {
      setBusy('');
    }
  };

  const refundPayment = async (orderId: string) => {
    setBusy('refund');
    setMessage('');
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Refund was not accepted.');
      setMessage('Refund request accepted; status will change to refunded after provider confirmation.');
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Refund was not accepted.');
    } finally {
      setBusy('');
    }
  };

  const editProperty = async (propertyId: string, updates: { title: string; locality: string; price: number; description: string }) => {
    setBusy('property');
    setMessage('');
    try {
      const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Property update failed.');
      setMessage('Property details saved.');
      await load();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Property update failed.');
    } finally {
      setBusy('');
    }
  };

  const logout = async () => {
    setBusy('logout');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out.');
      router.push('/login');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not sign out.');
      setBusy('');
    }
  };

  const navItems = role === 'seller'
    ? [
        ['Sites', '/plots'], ['Rent', '/rent'], ['Plans & Promotions', '/pricing'], ['Add New Property', '/sell'],
        ['My Properties', '#properties'], ['Active Enquiries', '#enquiries'],
        ['Watch Property Reels', '/reels'], ['Upload Property Reels', '/reels/studio'],
        ['Purchased Contacts', '#contacts'], ['Payment History', '#payments'],
        ['My Profile', '#profile'], ['Settings', '#settings'],
      ]
    : role === 'broker'
      ? [
        ['Sites', '/plots'], ['Rent', '/rent'], ['Plans & Services', '/pricing'], ['Accessible Properties', '#properties'],
          ['Active Enquiries', '#enquiries'], ['Purchased Contacts', '#contacts'],
          ['Watch Property Reels', '/reels'], ['Payment History', '#payments'],
          ['My Profile', '#profile'], ['Settings', '#settings'],
        ]
      : [
          ['Sites', '/plots'], ['Rent', '/rent'], ['Users', '#users'],
          ['Properties & Approvals', '#properties'], ['Property Reels', '#reels'],
          ['Enquiries', '#enquiries'], ['Contact Unlocks', '#contacts'],
          ['Payments', '#payments'], ['Reports', '#reports'], ['Settings', '#settings'],
        ];

  if (!hasPortalData && !error) {
    return <main className="min-h-screen bg-white p-8 text-slate-700">Loading your {role} portal…</main>;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <Link href="/" className="text-xl font-black tracking-wide">NILVORA</Link>
            <p className="text-sm text-slate-500">{role === 'admin' ? 'Admin Dashboard' : `${role[0].toUpperCase()}${role.slice(1)} Portal`}</p>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-slate-600">{user.fullName}</span>}
            <button type="button" onClick={() => void logout()} disabled={busy === 'logout'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
              {busy === 'logout' ? 'Signing out…' : 'Logout'}
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[230px_1fr]">
        <nav aria-label={`${role} portal navigation`} className="flex flex-wrap content-start gap-2 lg:flex-col">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-slate-400 hover:bg-slate-50">{label}</a>
          ))}
        </nav>

        <section className="min-w-0 space-y-6">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {message && <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
          {role !== 'admin' && user && (
            <>
              <div id="profile" className="rounded-2xl border border-slate-200 p-5">
                <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
                <p className="mt-1 text-sm text-slate-600">{user.email} · {user.phone}</p>
              </div>
              <section id="settings" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="text-lg font-semibold">Account settings</h2>
                <p className="mt-1 text-sm text-slate-600">Role: {user.role}. Password recovery and sign-out are available through the account security flows.</p>
                <Link href="/forgot-password" className="mt-3 inline-block text-sm text-blue-700 underline">Password recovery</Link>
              </section>
            </>
          )}

          {role === 'admin' ? (
            <>
              <section id="reports">
                <h1 className="mb-3 text-2xl font-bold">Platform overview</h1>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(adminData?.metrics || {}).map(([name, value]) => (
                    <div key={name} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm capitalize text-slate-500">{name.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</p>
                      <p className="mt-1 text-2xl font-bold">{['totalRevenue', 'monthlyRevenue'].includes(name) ? formatCurrency(value) : value.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section id="revenue" className="space-y-5 rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                <div>
                  <h2 className="text-xl font-bold text-[#101B33]">Revenue dashboard</h2>
                  <p className="mt-1 text-sm text-slate-600">Revenue includes only provider-verified successful payments. DEMO and unpaid orders are excluded.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Verified total revenue" value={formatCurrency(adminData?.metrics?.totalRevenue || 0)} />
                  <Metric label="Verified revenue this month" value={formatCurrency(adminData?.metrics?.monthlyRevenue || 0)} />
                  <Metric label="All transaction records" value={adminData?.metrics?.transactions || 0} />
                  <Metric label="Unpaid DEMO orders" value={adminData?.metrics?.demoOrders || 0} />
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="font-semibold">Revenue by account role</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {(['buyer', 'seller', 'broker'] as const).map((serviceRole) => (
                        <li key={serviceRole} className="flex justify-between gap-3 border-b pb-2 last:border-0">
                          <span className="capitalize">{serviceRole} services</span>
                          <strong>{formatCurrency(adminData?.revenueByRole?.[serviceRole] || 0)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="font-semibold">Revenue by service</h3>
                    <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
                      {(adminData?.services || []).map((service) => (
                        <li key={service.id} className="flex justify-between gap-3 border-b pb-2 last:border-0">
                          <span>{service.name}</span>
                          <strong>{formatCurrency(adminData?.revenueByService?.[service.id] || 0)}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="font-semibold">Configurable service prices</h3>
                  <p className="mt-1 text-xs text-slate-500">Set ₹0 to disable checkout for a service that does not yet have a price.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(adminData?.services || []).map((service) => (
                      <form
                        key={service.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 p-3"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const formData = new FormData(event.currentTarget);
                          void submitAdminAction({
                            action: 'service_price',
                            serviceId: service.id,
                            price: String(formData.get('price')),
                          });
                        }}
                      >
                        <label className="min-w-0 flex-1 text-sm font-medium" htmlFor={`price-${service.id}`}>{service.name}</label>
                        <span className="text-xs text-slate-500">₹</span>
                        <input id={`price-${service.id}`} name="price" type="number" min="0" max="1000000" step="1" required defaultValue={service.price} className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
                        <button disabled={Boolean(busy)} className="rounded-lg bg-[#315DE8] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Save</button>
                      </form>
                    ))}
                  </div>
                </div>
              </section>
              <section id="users" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-4 text-xl font-semibold">Users</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead><tr className="border-b text-slate-500"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Change role</th></tr></thead>
                    <tbody>{(adminData?.users || []).map((account) => (
                      <tr key={account.id} className="border-b last:border-0">
                        <td className="py-3">{account.fullName}</td><td>{account.email}</td><td>{account.role}</td>
                        <td><select aria-label={`Role for ${account.fullName}`} value={account.role} disabled={account.role === 'admin' || busy === 'user_role'} onChange={(event) => void submitAdminAction({ action: 'user_role', userId: account.id, role: event.target.value })} className="rounded-md border p-1">
                          {['buyer', 'seller', 'broker', 'builder', 'legal_pro'].map((value) => <option key={value} value={value}>{value}</option>)}
                        </select></td>
                      </tr>
                    ))}</tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-500">Admin privileges cannot be granted from this user-management form.</p>
                </div>
              </section>
              <PropertyTable
                id="properties"
                properties={properties}
                admin
                busy={busy}
                onPropertyAction={(propertyId, status) => void submitAdminAction({ action: 'property_status', propertyId, status })}
                onRemoveReel={(propertyId, reelId) => void submitAdminAction({ action: 'remove_reel', propertyId, reelId })}
              />
              <LeadTable id="enquiries" leads={leads} />
              <section className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-3 text-xl font-semibold">Site visit requests</h2>
                {(adminData?.appointments || []).length === 0
                  ? <p className="text-sm text-slate-500">No site visit requests are recorded.</p>
                  : <ul className="space-y-2">{adminData?.appointments?.map((appointment) => <li key={appointment.id} className="rounded-lg border p-3 text-sm">
                      <strong>{appointment.propertyTitle}</strong>
                      <p>{appointment.buyerName} · {appointment.buyerPhone}</p>
                      <p className="text-slate-500">{new Date(appointment.scheduledTime).toLocaleString()} · {appointment.status}</p>
                    </li>)}</ul>}
              </section>
              <section id="payments" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-3 text-xl font-semibold">Payment records</h2>
                <PaymentTable
                  payments={payments}
                  admin
                  busy={busy}
                  onRefund={(id) => void refundPayment(id)}
                  onRevoke={(id) => void submitAdminAction({ action: 'revoke_service', paymentId: id })}
                />
              </section>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-3 text-xl font-semibold">Broker verification requests</h2>
                {(payments.filter((payment) => payment.purpose === 'broker_verified_profile' && payment.status === 'successful' && payment.serviceStatus === 'requested')).length === 0
                  ? <p className="text-sm text-slate-600">No paid broker verification requests are awaiting review. Payment alone never grants a verified badge.</p>
                  : <ul className="space-y-3">{payments.filter((payment) => payment.purpose === 'broker_verified_profile' && payment.status === 'successful' && payment.serviceStatus === 'requested').map((payment) => (
                    <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 text-sm">
                      <span>{payment.receiptNumber} · broker account {payment.userId} · paid {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : ''}</span>
                      <div className="flex gap-2">
                        <button disabled={Boolean(busy)} onClick={() => void submitAdminAction({ action: 'broker_verification', paymentId: payment.id, approved: true })} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-white disabled:opacity-50">Approve RERA profile</button>
                        <button disabled={Boolean(busy)} onClick={() => void submitAdminAction({ action: 'broker_verification', paymentId: payment.id, approved: false })} className="rounded-lg border border-red-300 px-3 py-1.5 text-red-800 disabled:opacity-50">Reject</button>
                      </div>
                    </li>
                  ))}</ul>}
              </section>
              <section className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-3 text-xl font-semibold">Audit log</h2>
                {(adminData?.auditLogs || []).length === 0
                  ? <p className="text-sm text-slate-500">No audit events are recorded.</p>
                  : <ul className="space-y-2">{adminData?.auditLogs?.slice(0, 25).map((entry) => <li key={entry.id} className="border-b pb-2 text-sm last:border-0">
                      <strong>{entry.action}</strong><span className="text-slate-500"> · {entry.resource} · {new Date(entry.timestamp).toLocaleString()}</span>
                    </li>)}</ul>}
              </section>
              <section id="contacts" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="text-xl font-semibold">Contact unlocks</h2>
                {(adminData?.contactUnlocks || []).length === 0 ? <p className="mt-2 text-sm text-slate-600">No verified contact unlocks are recorded.</p> : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {adminData?.contactUnlocks?.map((unlock) => (
                      <li key={unlock.id} className="rounded-lg border border-slate-200 p-3">
                        Buyer {unlock.buyerId} · Property {unlock.propertyId} · {unlock.unlockedAt ? new Date(unlock.unlockedAt).toLocaleString() : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <SettingsPanel settings={adminData?.settings || {}} busy={busy} onSave={(key, value) => void submitAdminAction({ action: 'setting', key, value })} />
            </>
          ) : (
            <>
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Metric label="Accessible properties" value={properties.length} />
                <Metric label="Published properties" value={activeProperties.length} />
                <Metric label="Property views" value={totalViews.toLocaleString('en-IN')} />
                <Metric label="Property likes" value={totalLikes.toLocaleString('en-IN')} />
                <Metric label="Active enquiries" value={leads.filter((lead) => !['won', 'lost'].includes(lead.status)).length} />
              </section>
              <PropertyTable
                id="properties"
                properties={properties}
                canEdit={role === 'seller'}
                busy={busy}
                onEdit={(propertyId, updates) => void editProperty(propertyId, updates)}
              />
              <LeadTable id="enquiries" leads={leads} />
              <section id="contacts" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="text-xl font-semibold">Purchased contacts</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {portal?.contactUnlocks?.length
                    ? `${portal.contactUnlocks.length} contact unlock records.`
                    : 'No contact unlocks are recorded. Buyer contact details remain protected.'}
                </p>
              </section>
              <section id="payments" className="rounded-2xl border border-slate-200 p-5">
                <h2 className="mb-3 text-xl font-semibold">Payment history</h2>
                <PaymentTable payments={payments} />
              </section>
              {role === 'seller' && (
                <section className="rounded-2xl border border-slate-200 p-5">
                  <h2 className="text-xl font-semibold">Listing review queue</h2>
                  <p className="mt-2 text-sm text-slate-600">{pendingProperties.length} of your listings are under review.</p>
                  <Link href="/sell" className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add new property</Link>
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-xl border border-slate-200 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}

function PropertyTable({
  id,
  properties,
  admin = false,
  canEdit = false,
  busy = '',
  onPropertyAction,
  onRemoveReel,
  onEdit,
}: {
  id: string;
  properties: PropertyItem[];
  admin?: boolean;
  canEdit?: boolean;
  busy?: string;
  onPropertyAction?: (propertyId: string, status: 'published' | 'rejected') => void;
  onRemoveReel?: (propertyId: string, reelId: string) => void;
  onEdit?: (propertyId: string, updates: { title: string; locality: string; price: number; description: string }) => void;
}) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 p-5">
      <h2 className="mb-4 text-xl font-semibold">{admin ? 'Properties & approvals' : 'Accessible properties'}</h2>
      {properties.length === 0 ? <p className="text-sm text-slate-500">No properties are currently available in this account.</p> : (
        <div className="space-y-3">
          {properties.map((property) => (
            <article key={property.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-semibold">{property.title}</h3><p className="text-sm text-slate-600">{property.locality} · {property.listingType} · {formatCurrency(property.price)}</p></div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{property.status}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{property.viewsCount.toLocaleString('en-IN')} recorded views · {(property.likesCount || 0).toLocaleString('en-IN')} buyer likes · {property.reels.length} reels</p>
              {canEdit && <details className="mt-3 border-t pt-3">
                <summary className="cursor-pointer text-sm font-medium text-blue-700">Edit listing details</summary>
                <form className="mt-3 grid gap-2 sm:grid-cols-2" onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  const price = Number(form.get('price'));
                  if (!Number.isFinite(price) || price <= 0) return;
                  onEdit?.(property.id, {
                    title: String(form.get('title')).trim(),
                    locality: String(form.get('locality')).trim(),
                    price,
                    description: String(form.get('description')).trim(),
                  });
                }}>
                  <input name="title" required maxLength={160} defaultValue={property.title} aria-label="Property title" className="rounded-lg border px-3 py-2 text-sm" />
                  <input name="locality" required maxLength={120} defaultValue={property.locality} aria-label="Property locality" className="rounded-lg border px-3 py-2 text-sm" />
                  <input name="price" required min="1" type="number" defaultValue={property.price} aria-label="Property price" className="rounded-lg border px-3 py-2 text-sm" />
                  <input name="description" maxLength={2000} defaultValue={property.description} aria-label="Property description" className="rounded-lg border px-3 py-2 text-sm" />
                  <button disabled={Boolean(busy)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50 sm:col-span-2">Save listing details</button>
                </form>
              </details>}
              {admin && property.status === 'under_review' && (
                <div className="mt-3 flex gap-2">
                  <button disabled={Boolean(busy)} onClick={() => onPropertyAction?.(property.id, 'published')} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white disabled:opacity-50">Approve</button>
                  <button disabled={Boolean(busy)} onClick={() => onPropertyAction?.(property.id, 'rejected')} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50">Reject</button>
                </div>
              )}
              {admin && property.reels.length > 0 && (
                <ul id="reels" className="mt-3 space-y-1 border-t pt-3">
                  {property.reels.map((reel) => <li key={reel.id} className="flex justify-between gap-2 text-sm">
                    <a href={reel.url} target="_blank" rel="noreferrer" className="truncate text-blue-700 underline">{reel.caption || reel.url}</a>
                    <button disabled={Boolean(busy)} onClick={() => onRemoveReel?.(property.id, reel.id)} className="shrink-0 text-red-700">Remove</button>
                  </li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LeadTable({ id, leads }: { id: string; leads: LeadItem[] }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 p-5">
      <h2 className="mb-4 text-xl font-semibold">Active enquiries</h2>
      {leads.length === 0 ? <p className="text-sm text-slate-500">No enquiries are currently recorded.</p> : (
        <ul className="space-y-3">{leads.map((lead) => <li key={lead.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap justify-between gap-2"><strong>{lead.buyerName || 'Buyer contact protected'}</strong><span className="text-sm text-slate-500">{lead.status.replaceAll('_', ' ')}</span></div>
          <p className="mt-1 text-sm text-slate-600">{lead.preferredLocality} · {lead.propertyTypePreference || 'Property preference not provided'}</p>
          {lead.buyerPhone && <p className="mt-1 text-sm">{lead.buyerPhone}</p>}
          <p className="mt-1 text-xs text-slate-500">Received {new Date(lead.createdAt).toLocaleString()}</p>
        </li>)}</ul>
      )}
    </section>
  );
}

function PaymentTable({ payments, admin = false, busy = '', onRefund, onRevoke }: { payments: PaymentOrder[]; admin?: boolean; busy?: string; onRefund?: (orderId: string) => void; onRevoke?: (orderId: string) => void }) {
  return payments.length === 0 ? <p className="text-sm text-slate-500">No payment records are available.</p> : (
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
      <thead><tr className="border-b text-slate-500"><th className="py-2">Receipt</th><th>Purpose</th><th>Amount</th><th>Payment status</th><th>Service access</th><th>Date</th>{admin && <th>Action</th>}</tr></thead>
      <tbody>{payments.map((payment) => <tr key={payment.id} className="border-b last:border-0">
        <td className="py-3">{payment.receiptNumber}</td><td>{payment.purpose.replaceAll('_', ' ')}</td>
        <td>{formatCurrency(payment.amount)}</td><td>{payment.isDemo && <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900">DEMO</span>}{payment.status}</td>
        <td>{payment.serviceStatus ? `${payment.serviceStatus}${payment.serviceExpiresAt ? ` · until ${new Date(payment.serviceExpiresAt).toLocaleDateString()}` : ''}` : '—'}</td><td>{new Date(payment.createdAt).toLocaleDateString()}</td>
        {admin && <td className="space-x-2">{payment.status === 'successful' && !payment.isDemo && <>
          <button disabled={Boolean(busy)} onClick={() => onRevoke?.(payment.id)} className="text-amber-800 underline disabled:opacity-50">Revoke access</button>
          <button disabled={Boolean(busy)} onClick={() => onRefund?.(payment.id)} className="text-red-700 underline disabled:opacity-50">Refund</button>
        </>}</td>}
      </tr>)}</tbody>
    </table></div>
  );
}

function SettingsPanel({ settings, busy, onSave }: { settings: Record<string, string>; busy: string; onSave: (key: string, value: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave(String(form.get('key')), String(form.get('value')));
  };
  return <section id="settings" className="rounded-2xl border border-slate-200 p-5">
    <h2 className="mb-3 text-xl font-semibold">Website settings</h2>
    <ul className="mb-4 space-y-1 text-sm">{Object.entries(settings).map(([key, value]) => <li key={key}><strong>{key}:</strong> {value}</li>)}</ul>
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input name="key" required maxLength={80} pattern="[a-zA-Z0-9_.-]+" placeholder="Setting key" className="rounded-lg border px-3 py-2 text-sm" />
      <input name="value" required maxLength={1000} placeholder="Setting value" className="min-w-48 flex-1 rounded-lg border px-3 py-2 text-sm" />
      <button disabled={Boolean(busy)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">Save setting</button>
    </form>
  </section>;
}
