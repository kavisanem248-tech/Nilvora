import type { PaymentOrder } from '@/types';

export type RevenuePurpose = PaymentOrder['purpose'];

export interface RevenueService {
  id: string;
  purpose: RevenuePurpose;
  role: 'buyer' | 'seller' | 'broker';
  additionalRoles?: Array<'buyer' | 'seller' | 'broker'>;
  name: string;
  price: number;
  period: string;
  description: string;
  propertyRequired?: boolean;
  serviceStatus?: 'active' | 'requested';
}

export const REVENUE_SERVICES: RevenueService[] = [
  {
    id: 'buyer-contact-unlock',
    purpose: 'buyer_contact_unlock',
    role: 'buyer',
    name: 'Property Contact Unlock',
    price: 99,
    period: 'per property',
    description: 'Unlock the property owner contact after confirmed payment.',
    propertyRequired: true,
  },
  {
    id: 'buyer-premium-monthly',
    purpose: 'buyer_premium',
    role: 'buyer',
    name: 'Buyer Premium Membership',
    price: 870,
    period: 'per month',
    description: 'Buyer Premium membership with access to assigned broker profile details.',
    serviceStatus: 'active',
  },
  {
    id: 'seller-featured-property',
    purpose: 'seller_featured_property',
    role: 'seller',
    additionalRoles: ['broker'],
    name: 'Featured Property',
    price: 499,
    period: '30 days',
    description: 'Promote one of your published properties for 30 days.',
    propertyRequired: true,
  },
  {
    id: 'seller-subscription-monthly',
    purpose: 'seller_subscription',
    role: 'seller',
    additionalRoles: ['broker'],
    name: 'Premium Seller Subscription',
    price: 999,
    period: 'per month',
    description: 'Premium seller services for one month.',
    serviceStatus: 'active',
  },
  {
    id: 'seller-reels-promotion',
    purpose: 'seller_reels_promotion',
    role: 'seller',
    name: 'Property Reels Promotion',
    price: 299,
    period: '30 days',
    description: 'Promote the reels attached to one of your published properties.',
    propertyRequired: true,
  },
  {
    id: 'broker-subscription-monthly',
    purpose: 'broker_subscription',
    role: 'broker',
    name: 'Premium Broker Subscription',
    price: 1499,
    period: 'per month',
    description: 'Premium broker services for one month.',
    serviceStatus: 'active',
  },
  {
    id: 'broker-verified-profile',
    purpose: 'broker_verified_profile',
    role: 'broker',
    name: 'Verified Broker Profile Review',
    price: 499,
    period: 'per year',
    description: 'Request a broker-profile verification review. Payment does not itself verify RERA credentials.',
    serviceStatus: 'requested',
  },
  {
    id: 'broker-lead-management',
    purpose: 'broker_lead_management',
    role: 'broker',
    name: 'Lead Management Plan',
    price: 0,
    period: 'per month',
    description: 'Optional lead-management plan; price must be configured by an administrator.',
    serviceStatus: 'active',
  },
  {
    id: 'advocate-title-opinion',
    purpose: 'legal_doc_service',
    role: 'buyer',
    additionalRoles: ['seller', 'broker'],
    name: 'Advocate Title Opinion & 30-Year EC Screening',
    price: 1499,
    period: 'per request',
    description: 'Existing legal document review service.',
  },
];

const SETTING_PREFIX = 'revenue.price.';

export function getRevenueCatalog(settings: Record<string, string>): RevenueService[] {
  return REVENUE_SERVICES.map((service) => {
    const configured = settings[`${SETTING_PREFIX}${service.id}`];
    const price = configured === undefined ? service.price : Number(configured);
    return { ...service, price: Number.isSafeInteger(price) && price >= 0 ? price : service.price };
  });
}

export function getRevenueService(id: string, settings: Record<string, string>) {
  return getRevenueCatalog(settings).find((service) => service.id === id);
}
