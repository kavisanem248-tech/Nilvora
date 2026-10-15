// Razorpay India Payment & Commission Accounting Module
export interface PlanDetails {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
}

export const BROKER_PLANS: PlanDetails[] = [
  {
    id: 'starter',
    name: 'Starter Broker',
    price: 0,
    currency: 'INR',
    period: 'forever',
    features: [
      'Up to 3 active property listings',
      'Basic lead notifications',
      'Standard broker directory profile',
      'Manual deal room coordination',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Broker Partner',
    price: 999,
    currency: 'INR',
    period: 'per month',
    features: [
      'Up to 25 active property listings',
      'Full-featured Broker CRM pipeline',
      'AI Broker Copilot (lead prioritisation)',
      'Verified RERA badge & priority search ranking',
      'Direct WhatsApp and SMS alerts for hot leads',
      '1 Featured Listing boost per month',
    ],
  },
  {
    id: 'team',
    name: 'Agency Team & Developers',
    price: 2499,
    currency: 'INR',
    period: 'per month',
    features: [
      'Unlimited property listings & Reels uploads',
      'Multi-agent team assignment & split commissions',
      'White-labeled Deal Room with digital signatures',
      'Priority Legal & Document Intelligence scans',
      'Dedicated Account Manager in Ambattur/Chennai',
      '5 Featured Listing boosts per month',
    ],
  },
];

export const PROMOTION_PACKAGES = [
  {
    id: 'featured-7',
    name: '7-Day Top Placement',
    price: 299,
    description: 'Highlighted banner on Ambattur & West Chennai search pages for 7 days.',
  },
  {
    id: 'featured-15',
    name: '15-Day Spotlight & Reels Boost',
    price: 599,
    description: 'Featured on Homepage, top 3 search results, and 2x higher Reels feed distribution.',
  },
  {
    id: 'featured-30',
    name: '30-Day Master Campaign',
    price: 999,
    description: 'Maximum visibility across web, Reels, and weekly buyer recommendation emails.',
  },
];

export function isProviderOrder(orderId?: string): boolean {
  return typeof orderId === 'string' && /^order_[A-Za-z0-9]{14}$/.test(orderId);
}

export function isProviderPayment(paymentId?: string): boolean {
  return typeof paymentId === 'string' && /^pay_[A-Za-z0-9]{14}$/.test(paymentId);
}

export const calculateCommissionSplit = (
  propertyValue: number,
  agreedCommissionPercent: number,
  platformFeePercent: number = 10.0
) => {
  const grossCommission = (propertyValue * agreedCommissionPercent) / 100;
  const platformRevenue = (grossCommission * platformFeePercent) / 100;
  const netBrokerPayout = grossCommission - platformRevenue;

  return {
    propertyValue,
    agreedCommissionPercent,
    grossCommission,
    platformFeePercent,
    platformRevenue,
    netBrokerPayout,
  };
};
