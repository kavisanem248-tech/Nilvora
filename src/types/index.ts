export type UserRole = 'buyer' | 'seller' | 'broker' | 'builder' | 'legal_pro' | 'admin';

export type PropertyType =
  | 'apartment'
  | 'independent_house'
  | 'villa'
  | 'plot'
  | 'commercial'
  | 'builder_project';

export type ListingType = 'sale' | 'rent';

export type ListingStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'paused'
  | 'sold'
  | 'rejected';

export interface UserProfile {
  id: string;
  authUserId?: string;
  fullName: string;
  displayName?: string;
  email: string;
  phone: string;
  role: UserRole;
  preferredLanguage: 'en' | 'ta';
  state: string;
  district: string;
  locality: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface BrokerProfile {
  id: string;
  profileId: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string;
  agencyName: string;
  reraNumber: string;
  experienceYears: number;
  serviceAreas: string[];
  defaultCommissionPercent: number;
  bio: string;
  rating: number;
  totalDealsClosed: number;
  isReraVerified: boolean;
  subscriptionTier: 'starter' | 'pro' | 'team';
}

export interface PropertyTrustScope {
  sellerDeclaration: boolean;
  docChecked: boolean;
  legalReviewed: boolean;
  reraVerified: boolean;
  ecVerified: boolean;
  pattaVerified: boolean;
  lastCheckedDate: string;
  reviewerName?: string;
  disclaimer: string;
}

export interface PropertyMediaItem {
  id: string;
  propertyId: string;
  mediaType: 'photo' | 'video_reel' | 'video_landscape' | 'floor_plan';
  url: string;
  thumbnailUrl: string;
  caption?: string;
  captionTa?: string;
  category?: string;
  durationSeconds?: number;
  isCover?: boolean;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  docType: 'sale_deed' | 'patta' | 'chitta' | 'encumbrance_certificate' | 'tnrera_approval' | 'parent_deed';
  name: string;
  fileUrl: string;
  isPrivate: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  notes?: string;
}

export interface PropertyItem {
  id: string;
  ownerId: string;
  assignedBrokerId?: string;
  title: string;
  titleTa?: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: ListingStatus;
  price: number;
  priceNegotiable: boolean;
  state: string;
  district: string;
  locality: string;
  subLocality?: string;
  pincode: string;
  surveyNumber?: string;
  pattaNumber?: string;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  floorNumber?: number;
  totalFloors?: number;
  furnishingStatus: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  amenities: string[];
  images: string[];
  reels: PropertyMediaItem[];
  documents?: PropertyDocument[];
  trustScore: number;
  trustScope: PropertyTrustScope;
  isFeatured?: boolean;
  featuredUntil?: string;
  reelsPromotionUntil?: string;
  likesCount?: number;
  viewsCount: number;
  createdAt: string;
  builderProjectName?: string;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'property_suggested'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'negotiation'
  | 'agreement_prep'
  | 'won'
  | 'lost';

export interface LeadItem {
  id: string;
  brokerId: string;
  buyerId?: string;
  propertyId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocality: string;
  propertyTypePreference: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  nextFollowUp?: string;
  createdAt: string;
}

export interface AppointmentItem {
  id: string;
  buyerId?: string;
  leadId?: string;
  propertyId: string;
  propertyTitle: string;
  brokerId: string;
  buyerName: string;
  buyerPhone: string;
  scheduledTime: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface OfferItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  brokerId?: string;
  offerAmount: number;
  counterAmount?: number;
  status: 'submitted' | 'countered' | 'accepted' | 'rejected';
  termsConditions: string;
  createdAt: string;
}

export interface DealMilestoneItem {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface DealRoomItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocality: string;
  sellerId: string;
  sellerName: string;
  brokerId: string;
  brokerName: string;
  buyerId: string;
  buyerName: string;
  status: 'in_negotiation' | 'agreement_drafting' | 'patta_verification' | 'registration_scheduled' | 'closed_won' | 'cancelled';
  agreedPrice: number;
  tokenAmount: number;
  tokenPaid: boolean;
  commissionPercentage: number;
  commissionAmount: number;
  milestones: DealMilestoneItem[];
  createdAt: string;
}

export interface CommissionRecord {
  id: string;
  dealRoomId: string;
  propertyTitle: string;
  brokerId: string;
  sellerName: string;
  totalPropertyValue: number;
  commissionPercentage: number;
  grossCommission: number;
  platformFeeAmount: number;
  netBrokerCommission: number;
  status: 'pending' | 'invoiced' | 'paid' | 'disputed';
  dueDate: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  purchaserRole?: 'buyer' | 'seller' | 'broker';
  purpose:
    | 'buyer_contact_unlock'
    | 'buyer_premium'
    | 'seller_featured_property'
    | 'seller_subscription'
    | 'seller_reels_promotion'
    | 'broker_subscription'
    | 'broker_verified_profile'
    | 'broker_lead_management'
    | 'legal_doc_service';
  itemId?: string;
  propertyId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'processing' | 'successful' | 'failed' | 'refunded';
  isDemo?: boolean;
  serviceStatus?: 'active' | 'requested' | 'revoked';
  serviceExpiresAt?: string;
  paidAt?: string;
  receiptNumber: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface ContactUnlock {
  id: string;
  buyerId: string;
  propertyId: string;
  paymentOrderId: string;
  unlockedAt: string;
}

export interface PropertyLike {
  id: string;
  userId: string;
  propertyId: string;
  likedAt: string;
}

export interface DocumentAnalysisResult {
  id: string;
  documentName: string;
  category: 'patta' | 'chitta' | 'sale_deed' | 'encumbrance_certificate';
  surveyNumberExtracted?: string;
  pattaHolderName?: string;
  extentSqft?: number;
  villageName?: string;
  talukName?: string;
  district?: string;
  identifiedEncumbrances: string[];
  missingDocuments: string[];
  riskScore: number; // 0-100 (100 = cleanest)
  disclaimer: string;
  analysisDate: string;
}

export interface ComplianceRulePack {
  id: string;
  stateCode: string;
  jurisdictionName: string;
  category: string;
  ruleTitle: string;
  summary: string;
  officialSourceUrl: string;
  effectiveDate: string;
  lastReviewedDate: string;
}

export interface IntegrationServiceStatus {
  serviceKey: 'supabase' | 'razorpay' | 'sms' | 'email' | 'maps' | 'ai_llm' | 'digilocker';
  serviceName: string;
  category: string;
  status: 'configured' | 'not_configured' | 'requires_credentials' | 'simulated_fallback' | 'temporarily_unavailable';
  details: string;
  configuredAt?: string;
}
