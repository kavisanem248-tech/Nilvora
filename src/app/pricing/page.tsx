'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PaymentOrder, PropertyItem, UserRole } from '@/types';
import { RevenueService } from '@/lib/payments/catalog';
import { requireSignedInForAction } from '@/lib/auth/client-session';
import { Film, ShieldCheck } from 'lucide-react';

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type PortalResult = {
  success?: boolean;
  error?: string;
  user?: { id: string; role: UserRole };
  properties?: PropertyItem[];
  payments?: PaymentOrder[];
};

type OrderResult = {
  success?: boolean;
  error?: string;
  demo?: boolean;
  message?: string;
  order?: {
    id: string;
    razorpayOrderId?: string;
    currency: string;
    amountInPaisa?: number;
    itemName: string;
    receiptNumber: string;
    keyId?: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: RazorpayCheckoutResponse) => void;
      modal: { ondismiss: () => void };
    }) => { open: () => void };
  }
}

const ROLE_LABELS = { buyer: 'Buyer', seller: 'Seller', broker: 'Broker' } as const;
const money = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount);

export default function PricingPage() {
  const [services, setServices] = useState<RevenueService[]>([]);
  const [role, setRole] = useState<UserRole | null>(null);
  const [accountId, setAccountId] = useState('');
  const [activeRole, setActiveRole] = useState<'buyer' | 'seller' | 'broker'>('buyer');
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [payments, setPayments] = useState<PaymentOrder[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMode, setPaymentMode] = useState<'demo' | 'live'>('demo');
  const [message, setMessage] = useState('');

  const refreshPortal = useCallback(async () => {
    const response = await fetch('/api/portal', { cache: 'no-store' });
    const result = await response.json() as PortalResult;
    if (!response.ok || result.success !== true) {
      setRole(null);
      setProperties([]);
      setPayments([]);
      return;
    }
    setRole(result.user?.role || null);
    setAccountId(result.user?.id || '');
    if (result.user?.role === 'buyer' || result.user?.role === 'seller' || result.user?.role === 'broker') {
      setActiveRole(result.user.role);
    }
    setProperties(result.properties || []);
    setPayments(result.payments || []);
  }, []);

  useEffect(() => {
    let current = true;
    const load = async () => {
      try {
        const [catalogResponse, portalResponse] = await Promise.all([
          fetch('/api/payments/catalog', { cache: 'no-store' }),
          fetch('/api/portal', { cache: 'no-store' }),
        ]);
        const catalog = await catalogResponse.json() as {
          success?: boolean;
          error?: string;
          services?: RevenueService[];
          paymentMode?: 'demo' | 'live';
        };
        const portal = await portalResponse.json() as PortalResult;
        if (!catalogResponse.ok || catalog.success !== true) throw new Error(catalog.error || 'Could not load pricing.');
        if (!current) return;
        setServices(catalog.services || []);
        setPaymentMode(catalog.paymentMode || 'demo');
        if (portalResponse.ok && portal.success === true) {
          setRole(portal.user?.role || null);
          setAccountId(portal.user?.id || '');
          if (portal.user?.role === 'buyer' || portal.user?.role === 'seller' || portal.user?.role === 'broker') {
            setActiveRole(portal.user.role);
          }
          setProperties(portal.properties || []);
          setPayments(portal.payments || []);
        }
        const query = new URLSearchParams(window.location.search);
        const requestedProperty = query.get('propertyId');
        if (requestedProperty) setSelectedPropertyId(requestedProperty);
        const requestedService = catalog.services?.find((service) => service.id === query.get('service'));
        if (requestedService) setActiveRole(requestedService.role);
      } catch (error) {
        if (current) setMessage(error instanceof Error ? error.message : 'Could not load pricing.');
      } finally {
        if (current) setIsLoading(false);
      }
    };
    void load();
    return () => { current = false; };
  }, []);

  const visibleServices = useMemo(
    () => services.filter((service) => service.role === activeRole || service.additionalRoles?.includes(activeRole) || service.purpose === 'legal_doc_service'),
    [activeRole, services],
  );
  const propertyOptions = useMemo(() => {
    if (activeRole === 'buyer') return properties.filter((property) => property.status === 'published' && property.ownerId !== accountId);
    if (activeRole === 'seller') return properties.filter((property) => property.ownerId && property.status === 'published');
    return properties.filter((property) => property.status === 'published');
  }, [accountId, activeRole, properties]);

  const handlePayment = async (service: RevenueService) => {
    if (!await requireSignedInForAction()) return;
    if (!role) {
      setMessage('Your account role cannot use this service. Sign in with the matching account.');
      return;
    }
    if (service.propertyRequired && !selectedPropertyId) {
      setMessage('Choose a property before continuing.');
      return;
    }

    setIsProcessing(true);
    setMessage('');
    try {
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: service.id,
          purpose: service.purpose,
          propertyId: service.propertyRequired ? selectedPropertyId : undefined,
        }),
      });
      const orderResult = await orderResponse.json() as OrderResult;
      if (!orderResponse.ok || orderResult.success !== true || !orderResult.order) {
        throw new Error(orderResult.error || 'Unable to start checkout.');
      }
      if (orderResult.demo) {
        setMessage(orderResult.message || 'DEMO ONLY: unpaid order; no transaction was processed.');
        await refreshPortal();
        setIsProcessing(false);
        return;
      }
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Unable to load secure Razorpay checkout.'));
          document.body.appendChild(script);
        });
      }
      if (!window.Razorpay || !orderResult.order.keyId || !orderResult.order.razorpayOrderId || !orderResult.order.amountInPaisa) {
        throw new Error('Secure checkout could not be initialized.');
      }

      const checkout = new window.Razorpay({
        key: orderResult.order.keyId,
        amount: orderResult.order.amountInPaisa,
        currency: orderResult.order.currency,
        name: 'NILVORA',
        description: orderResult.order.itemName,
        order_id: orderResult.order.razorpayOrderId,
        handler: async (payment) => {
          try {
            const verificationResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderResult.order!.id,
                razorpayOrderId: payment.razorpay_order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature,
              }),
            });
            const verification = await verificationResponse.json() as { success?: boolean; error?: string; invoice?: { receiptNumber: string } };
            if (!verificationResponse.ok || verification.success !== true) {
              throw new Error(verification.error || 'Payment verification failed.');
            }
            setMessage(`Payment verified. Receipt: ${verification.invoice?.receiptNumber || orderResult.order!.receiptNumber}.`);
            await refreshPortal();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setMessage('Checkout closed. The order remains unpaid until confirmed by the payment provider.');
            setIsProcessing(false);
            void refreshPortal();
          },
        },
      });
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to start checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="space-y-3">
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-800">
          Role-based services
        </span>
        <h1 className="text-3xl font-black text-[#101B33] sm:text-4xl">Transparent NILVORA pricing</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Browse and search for properties for free. Promotions and optional memberships are priced by the service catalog; only verified payments are recorded as revenue.
        </p>
        <p className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${paymentMode === 'demo' ? 'bg-amber-50 text-amber-900' : 'bg-blue-50 text-blue-900'}`}>
          {paymentMode === 'demo'
            ? 'DEMO MODE — no payment gateway is configured. Orders remain unpaid and do not activate services.'
            : 'Secure checkout enabled — a service activates only after backend payment verification.'}
        </p>
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Pricing by account role">
        {(Object.keys(ROLE_LABELS) as Array<keyof typeof ROLE_LABELS>).map((roleOption) => (
          <button
            key={roleOption}
            type="button"
            onClick={() => setActiveRole(roleOption)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold ${activeRole === roleOption ? 'border-[#315DE8] bg-[#101B33] text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}
          >
            {ROLE_LABELS[roleOption]}
          </button>
        ))}
      </div>

      {message && <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">{message}</div>}
      {isLoading ? <p className="text-sm text-slate-500">Loading current service prices…</p> : (
        <>
          {visibleServices.some((service) => service.propertyRequired) && (
            <label className="block max-w-xl space-y-1 text-sm font-semibold text-[#101B33]">
              Select a property for property-specific services
              <select
                value={selectedPropertyId}
                onChange={(event) => setSelectedPropertyId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-900"
              >
                <option value="">Choose a property</option>
                {propertyOptions.map((property) => (
                  <option key={property.id} value={property.id}>{property.title} · {property.locality}</option>
                ))}
              </select>
              {role !== activeRole && <span className="block text-xs font-normal text-slate-500">Sign in as a {ROLE_LABELS[activeRole].toLowerCase()} to load properties you are authorized to use.</span>}
            </label>
          )}

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleServices.map((service) => {
              const disabled = isProcessing || !role || role !== activeRole || service.price <= 0 ||
                (service.propertyRequired && !selectedPropertyId);
              return (
                <article key={service.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase text-blue-800">
                      {[service.role, ...(service.additionalRoles || [])].map((serviceRole) => ROLE_LABELS[serviceRole]).join(' / ')}
                    </span>
                    {service.purpose === 'seller_reels_promotion' && <Film className="h-5 w-5 text-blue-700" />}
                    {service.purpose === 'broker_verified_profile' && <ShieldCheck className="h-5 w-5 text-blue-700" />}
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-[#101B33]">{service.name}</h2>
                  <p className="mt-2 min-h-12 text-sm text-slate-600">{service.description}</p>
                  <p className="mt-4 text-2xl font-black text-[#101B33]">
                    {service.price > 0 ? money(service.price) : 'Price not set'}
                    {service.price > 0 && <span className="ml-1 text-xs font-medium text-slate-500">/ {service.period}</span>}
                  </p>
                  {service.price > 0 && <p className="mt-1 text-xs text-slate-500">GST is calculated at checkout.</p>}
                  {service.serviceStatus === 'requested' && <p className="mt-2 text-xs text-amber-800">Payment requests a review; it does not create a verification badge.</p>}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => void handlePayment(service)}
                    className="mt-auto rounded-xl bg-[#315DE8] px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {service.price <= 0 ? 'Awaiting admin pricing' : !role ? 'Sign in to purchase' : role !== activeRole ? `Sign in as ${ROLE_LABELS[activeRole]}` : service.propertyRequired && !selectedPropertyId ? 'Select a property' : isProcessing ? 'Processing…' : 'Continue'}
                  </button>
                </article>
              );
            })}
          </section>
        </>
      )}

      <section id="payment-history" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-bold text-[#101B33]">Payment history</h2>
        {!role ? <p className="text-sm text-slate-600"><Link href="/login" className="font-semibold text-blue-700 underline">Sign in</Link> to view your transactions.</p> : payments.length === 0 ? (
          <p className="text-sm text-slate-600">No payment orders are recorded for this account.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="py-2">Receipt</th><th>Service</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{payments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0">
                  <td className="py-3">{payment.receiptNumber}</td>
                  <td>{payment.purpose.replaceAll('_', ' ')}</td>
                  <td>{money(payment.amount)}</td>
                  <td className="font-semibold">
                    {payment.isDemo && <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900">DEMO</span>}
                    {payment.status}
                  </td>
                  <td>{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      <p className="text-xs text-slate-500">Buyer property search and viewing stay free. DEMO orders are clearly labeled, unpaid, and never included in revenue totals.</p>
    </main>
  );
}
