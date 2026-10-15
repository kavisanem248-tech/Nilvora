import fs from 'fs';
import path from 'path';
import {
  PropertyItem,
  BrokerProfile,
  LeadItem,
  AppointmentItem,
  OfferItem,
  DealRoomItem,
  CommissionRecord,
  PaymentOrder,
  ContactUnlock,
  PropertyLike,
  UserProfile,
} from '@/types';
import {
  INITIAL_PROPERTIES,
  INITIAL_BROKERS,
  INITIAL_LEADS,
  INITIAL_APPOINTMENTS,
  INITIAL_OFFERS,
  INITIAL_DEAL_ROOMS,
  INITIAL_COMMISSIONS,
  DEMO_SITE_PROPERTIES,
} from '@/lib/mock-data';

// Persistent Server-Side Database Schema
export interface DatabaseSchema {
  users: (UserProfile & { passwordHash?: string; salt?: string })[];
  properties: PropertyItem[];
  brokers: BrokerProfile[];
  leads: LeadItem[];
  appointments: AppointmentItem[];
  offers: OfferItem[];
  dealRooms: DealRoomItem[];
  commissionLedger: CommissionRecord[];
  paymentOrders: PaymentOrder[];
  contactUnlocks: ContactUnlock[];
  propertyLikes: PropertyLike[];
  messages: Array<{
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
    attachmentUrl?: string;
    isRead: boolean;
    createdAt: string;
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    type: 'visit' | 'offer' | 'compliance' | 'payment' | 'security';
    title: string;
    message: string;
    isRead: boolean;
    priority: 'normal' | 'high' | 'urgent';
    linkUrl?: string;
    createdAt: string;
  }>;
  auditLogs: Array<{
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    timestamp: string;
  }>;
  settings: Record<string, string>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'nilvora_database.json');

const INITIAL_USERS: (UserProfile & { passwordHash?: string; salt?: string })[] = [
  {
    id: 'user-default-1',
    fullName: 'Karthik Subburaj',
    displayName: 'Karthik S.',
    email: 'karthik.subburaj@chennaitech.in',
    phone: '+91 98409 33211',
    role: 'buyer',
    preferredLanguage: 'en',
    state: 'Tamil Nadu',
    district: 'Chennai',
    locality: 'Ambattur',
    isVerified: true,
    createdAt: '2026-01-10T00:00:00Z',
    passwordHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    salt: 'salt_default_karthik_2026',
  },
  {
    id: 'user-seller-1',
    fullName: 'M. Jayaraman',
    displayName: 'Jayaraman M.',
    email: 'jayaraman.properties@ambattur.in',
    phone: '+91 94441 55210',
    role: 'seller',
    preferredLanguage: 'ta',
    state: 'Tamil Nadu',
    district: 'Chennai',
    locality: 'Ambattur',
    isVerified: true,
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'user-broker-1',
    fullName: 'Senthil Kumaran',
    displayName: 'Senthil K.',
    email: 'senthil.kumaran@nilvora-partners.in',
    phone: '+91 98401 22345',
    role: 'broker',
    preferredLanguage: 'en',
    state: 'Tamil Nadu',
    district: 'Chennai',
    locality: 'Ambattur',
    isVerified: true,
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'user-admin-1',
    fullName: 'Super Administrator',
    displayName: 'Super Admin',
    email: 'admin.super@nilvora.in',
    phone: '+91 98400 00001',
    role: 'admin',
    preferredLanguage: 'en',
    state: 'Tamil Nadu',
    district: 'Chennai',
    locality: 'Ambattur',
    isVerified: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.getDefaultData();
    this.init();
  }

  private getDefaultData(): DatabaseSchema {
    return {
      users: INITIAL_USERS,
      properties: INITIAL_PROPERTIES,
      brokers: INITIAL_BROKERS,
      leads: INITIAL_LEADS,
      appointments: INITIAL_APPOINTMENTS,
      offers: INITIAL_OFFERS,
      dealRooms: INITIAL_DEAL_ROOMS,
      commissionLedger: INITIAL_COMMISSIONS,
      paymentOrders: [],
      contactUnlocks: [],
      propertyLikes: [],
      messages: [],
      notifications: [],
      auditLogs: [],
      settings: {},
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        const storedProperties: PropertyItem[] = parsed.properties?.length ? parsed.properties : INITIAL_PROPERTIES;
        const storedPropertyIds = new Set(storedProperties.map((property) => property.id));
        const newDemoSites = DEMO_SITE_PROPERTIES.filter((property) => !storedPropertyIds.has(property.id));
        this.data = {
          ...this.getDefaultData(),
          ...parsed,
          settings: parsed.settings || {},
          paymentOrders: parsed.paymentOrders || [],
          contactUnlocks: parsed.contactUnlocks || [],
          propertyLikes: parsed.propertyLikes || [],
          properties: [...storedProperties, ...newDemoSites],
          brokers: parsed.brokers?.length ? parsed.brokers : INITIAL_BROKERS,
          leads: parsed.leads?.length ? parsed.leads : INITIAL_LEADS,
          appointments: parsed.appointments?.length ? parsed.appointments : INITIAL_APPOINTMENTS,
          offers: parsed.offers?.length ? parsed.offers : INITIAL_OFFERS,
          dealRooms: parsed.dealRooms?.length ? parsed.dealRooms : INITIAL_DEAL_ROOMS,
        };
        for (const payment of this.data.paymentOrders) {
          const storedPurpose: string = payment.purpose;
          const hasRealProviderIds =
            typeof payment.razorpayOrderId === 'string' && /^order_[A-Za-z0-9]{14}$/.test(payment.razorpayOrderId) &&
            typeof payment.razorpayPaymentId === 'string' && /^pay_[A-Za-z0-9]{14}$/.test(payment.razorpayPaymentId);
          if (payment.status === 'successful' && !payment.isDemo && !hasRealProviderIds) {
            payment.status = 'created';
            payment.isDemo = true;
            payment.receiptNumber = payment.receiptNumber.startsWith('DEMO-')
              ? payment.receiptNumber
              : `DEMO-${payment.receiptNumber}`;
            payment.itemId ||= storedPurpose === 'broker_subscription'
              ? 'broker-subscription-monthly'
              : storedPurpose === 'featured_listing'
                ? 'seller-featured-property'
                : undefined;
            if (storedPurpose === 'featured_listing') payment.purpose = 'seller_featured_property';
            delete payment.razorpayOrderId;
            delete payment.razorpayPaymentId;
            delete payment.paidAt;
            delete payment.serviceStatus;
            delete payment.serviceExpiresAt;
          }
        }
        if (newDemoSites.length > 0) this.save();
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('[NILVORA DB] Database file init fallback:', err);
      this.data = this.getDefaultData();
    }
    this.isInitialized = true;
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[NILVORA DB] Failed to persist data to disk:', err);
    }
  }

  public getData(): DatabaseSchema {
    if (!this.isInitialized) {
      this.init();
    }
    return this.data;
  }

  // --- ENTITY HELPERS ---

  // Users
  public getUsers() {
    return this.data.users;
  }

  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public createBrokerProfile(profile: BrokerProfile) {
    this.data.brokers = [profile, ...this.data.brokers];
    this.save();
    return profile;
  }

  public createUser(user: DatabaseSchema['users'][0]) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<DatabaseSchema['users'][0]>) {
    const index = this.data.users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  // Properties
  public getProperties() {
    return this.data.properties;
  }

  public syncBrokerSubscription(profileId: string) {
    const broker = this.data.brokers.find((profile) => profile.profileId === profileId);
    if (!broker) return undefined;
    const userHasSubscriptionRecords = this.data.paymentOrders.some(
      (payment) => payment.userId === profileId && payment.purpose === 'broker_subscription'
    );
    if (!userHasSubscriptionRecords) return broker;
    const hasActiveSubscription = this.data.paymentOrders.some((payment) =>
      payment.userId === profileId &&
      payment.purpose === 'broker_subscription' &&
      payment.status === 'successful' &&
      (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
    );
    const tier = hasActiveSubscription ? 'pro' : 'starter';
    if (broker.subscriptionTier !== tier) {
      broker.subscriptionTier = tier;
      this.save();
    }
    return broker;
  }

  public getPropertyById(id: string) {
    return this.data.properties.find((p) => p.id === id);
  }

  public createProperty(property: PropertyItem) {
    this.data.properties = [property, ...this.data.properties];
    this.save();
    return property;
  }

  public updateProperty(id: string, updates: Partial<PropertyItem>) {
    const idx = this.data.properties.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.properties[idx] = { ...this.data.properties[idx], ...updates };
      this.save();
      return this.data.properties[idx];
    }
    return null;
  }

  public togglePropertyLike(userId: string, propertyId: string) {
    const existingIndex = this.data.propertyLikes.findIndex(
      (like) => like.userId === userId && like.propertyId === propertyId
    );
    const liked = existingIndex === -1;
    if (liked) {
      this.data.propertyLikes.unshift({
        id: `like-${userId}-${propertyId}`,
        userId,
        propertyId,
        likedAt: new Date().toISOString(),
      });
    } else {
      this.data.propertyLikes.splice(existingIndex, 1);
    }
    this.save();
    return { liked, likesCount: this.getPropertyLikeCount(propertyId) };
  }

  public getPropertyLikeCount(propertyId: string) {
    return this.data.propertyLikes.filter((like) => like.propertyId === propertyId).length;
  }

  public hasPropertyLike(userId: string, propertyId: string) {
    return this.data.propertyLikes.some((like) => like.userId === userId && like.propertyId === propertyId);
  }

  // Leads
  public getLeads(brokerId?: string) {
    if (brokerId) {
      return this.data.leads.filter((l) => l.brokerId === brokerId);
    }
    return this.data.leads;
  }

  public createLead(lead: LeadItem) {
    this.data.leads = [lead, ...this.data.leads];
    this.save();
    return lead;
  }

  public updateLead(id: string, updates: Partial<LeadItem>) {
    const idx = this.data.leads.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.data.leads[idx] = { ...this.data.leads[idx], ...updates };
      this.save();
      return this.data.leads[idx];
    }
    return null;
  }

  // Appointments
  public getAppointments(filter?: { brokerId?: string; propertyId?: string }) {
    let appts = this.data.appointments;
    if (filter?.brokerId) {
      appts = appts.filter((a) => a.brokerId === filter.brokerId);
    }
    if (filter?.propertyId) {
      appts = appts.filter((a) => a.propertyId === filter.propertyId);
    }
    return appts;
  }

  public createAppointment(appt: AppointmentItem) {
    this.data.appointments = [appt, ...this.data.appointments];
    this.save();
    return appt;
  }

  // Offers
  public getOffers(propertyId?: string) {
    if (propertyId) {
      return this.data.offers.filter((o) => o.propertyId === propertyId);
    }
    return this.data.offers;
  }

  public createOffer(offer: OfferItem) {
    this.data.offers = [offer, ...this.data.offers];
    this.save();
    return offer;
  }

  public updateOffer(id: string, updates: Partial<OfferItem>) {
    const idx = this.data.offers.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.data.offers[idx] = { ...this.data.offers[idx], ...updates };
      this.save();
      return this.data.offers[idx];
    }
    return null;
  }

  // Deal Rooms
  public getDealRooms() {
    return this.data.dealRooms;
  }

  public getDealRoomById(id: string) {
    return this.data.dealRooms.find((d) => d.id === id);
  }

  public updateDealRoom(id: string, updates: Partial<DealRoomItem>) {
    const idx = this.data.dealRooms.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.data.dealRooms[idx] = { ...this.data.dealRooms[idx], ...updates };
      this.save();
      return this.data.dealRooms[idx];
    }
    return null;
  }

  // Payments & Commission Ledger
  public getPaymentOrders() {
    return this.data.paymentOrders;
  }

  public createPaymentOrder(order: PaymentOrder) {
    this.data.paymentOrders = [order, ...this.data.paymentOrders];
    this.save();
    return order;
  }

  public updatePaymentOrder(orderId: string, updates: Partial<PaymentOrder>) {
    const idx = this.data.paymentOrders.findIndex((p) => p.id === orderId || p.razorpayOrderId === orderId);
    if (idx !== -1) {
      this.data.paymentOrders[idx] = { ...this.data.paymentOrders[idx], ...updates };
      this.save();
      return this.data.paymentOrders[idx];
    }
    return null;
  }

  public confirmPayment(orderId: string, paymentId: string) {
    const order = this.data.paymentOrders.find((payment) => payment.id === orderId);
    if (!order || order.isDemo || order.status === 'refunded' || order.status === 'failed') return null;
    if (order.status === 'successful') {
      return order.razorpayPaymentId === paymentId ? order : null;
    }

    const now = new Date();
    let expiresAt: Date | undefined;
    const monthlyPurposes = ['buyer_premium', 'seller_subscription', 'broker_subscription', 'broker_lead_management'];
    if (monthlyPurposes.includes(order.purpose)) {
      const currentMembershipExpiry = this.data.paymentOrders
        .filter((payment) => payment.id !== order.id && payment.userId === order.userId &&
          payment.purpose === order.purpose && payment.status === 'successful' && payment.serviceExpiresAt)
        .map((payment) => new Date(payment.serviceExpiresAt!))
        .filter((date) => date > now)
        .sort((a, b) => b.getTime() - a.getTime())[0];
      expiresAt = currentMembershipExpiry ? new Date(currentMembershipExpiry) : new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (order.purpose === 'broker_verified_profile') {
      expiresAt = new Date(now);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else if (order.purpose === 'seller_featured_property' || order.purpose === 'seller_reels_promotion') {
      const property = order.propertyId ? this.data.properties.find((item) => item.id === order.propertyId) : undefined;
      const priorExpiry = order.purpose === 'seller_featured_property' ? property?.featuredUntil : property?.reelsPromotionUntil;
      const activeExpiry = priorExpiry ? new Date(priorExpiry) : now;
      expiresAt = new Date(activeExpiry > now ? activeExpiry : now);
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    order.status = 'successful';
    order.razorpayPaymentId = paymentId;
    order.paidAt = now.toISOString();
    if (order.purpose === 'broker_verified_profile' || order.purpose === 'legal_doc_service') {
      order.serviceStatus = 'requested';
    } else if (order.purpose !== 'buyer_contact_unlock') {
      order.serviceStatus = 'active';
    }
    if (order.serviceStatus && expiresAt) order.serviceExpiresAt = expiresAt.toISOString();

    if (order.purpose === 'buyer_contact_unlock' && order.propertyId &&
      !this.data.contactUnlocks.some((unlock) => unlock.paymentOrderId === order.id)) {
      this.data.contactUnlocks.unshift({
        id: `unlock-${order.id}`,
        buyerId: order.userId,
        propertyId: order.propertyId,
        paymentOrderId: order.id,
        unlockedAt: now.toISOString(),
      });
    } else if (order.purpose === 'seller_featured_property' && order.propertyId) {
      const property = this.data.properties.find((item) => item.id === order.propertyId);
      if (property && expiresAt) {
        property.isFeatured = true;
        property.featuredUntil = expiresAt.toISOString();
      }
    } else if (order.purpose === 'seller_reels_promotion' && order.propertyId) {
      const property = this.data.properties.find((item) => item.id === order.propertyId);
      if (property && expiresAt) property.reelsPromotionUntil = expiresAt.toISOString();
    } else if (order.purpose === 'broker_subscription') {
      const broker = this.data.brokers.find((profile) => profile.profileId === order.userId);
      if (broker) broker.subscriptionTier = 'pro';
    }

    this.save();
    return order;
  }

  public getContactUnlocks() {
    return this.data.contactUnlocks;
  }

  public revokePaymentService(orderId: string) {
    const order = this.data.paymentOrders.find((payment) => payment.id === orderId);
    if (!order || order.status !== 'successful' || order.isDemo) return null;
    order.serviceStatus = 'revoked';
    if (order.purpose === 'buyer_contact_unlock') {
      this.data.contactUnlocks = this.data.contactUnlocks.filter((unlock) => unlock.paymentOrderId !== order.id);
    } else if (order.purpose === 'broker_verified_profile') {
      const anotherVerifiedService = this.data.paymentOrders.some((payment) =>
        payment.id !== order.id &&
        payment.userId === order.userId &&
        payment.purpose === 'broker_verified_profile' &&
        payment.status === 'successful' &&
        payment.serviceStatus === 'active' &&
        (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
      );
      if (!anotherVerifiedService) {
        const broker = this.data.brokers.find((profile) => profile.profileId === order.userId);
        if (broker) broker.isReraVerified = false;
      }
    } else if (order.purpose === 'broker_subscription') {
      const activeSubscriptionRemains = this.data.paymentOrders.some((payment) =>
        payment.id !== order.id &&
        payment.userId === order.userId &&
        payment.purpose === 'broker_subscription' &&
        payment.status === 'successful' &&
        payment.serviceStatus !== 'revoked' &&
        (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
      );
      if (!activeSubscriptionRemains) {
        const broker = this.data.brokers.find((profile) => profile.profileId === order.userId);
        if (broker) broker.subscriptionTier = 'starter';
      }
    } else if (order.propertyId && ['seller_featured_property', 'seller_reels_promotion'].includes(order.purpose)) {
      const activeOrders = this.data.paymentOrders.filter((payment) =>
        payment.id !== order.id &&
        payment.propertyId === order.propertyId &&
        payment.purpose === order.purpose &&
        payment.status === 'successful' &&
        payment.serviceStatus !== 'revoked' &&
        (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
      );
      const latestExpiry = activeOrders
        .map((payment) => payment.serviceExpiresAt ? new Date(payment.serviceExpiresAt) : new Date(0))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      const property = this.data.properties.find((item) => item.id === order.propertyId);
      if (property) {
        if (order.purpose === 'seller_featured_property') {
          property.isFeatured = Boolean(latestExpiry);
          property.featuredUntil = latestExpiry?.toISOString();
        } else {
          property.reelsPromotionUntil = latestExpiry?.toISOString();
        }
      }
    }
    this.save();
    return order;
  }

  public reviewBrokerVerification(orderId: string, approved: boolean) {
    const order = this.data.paymentOrders.find((payment) =>
      payment.id === orderId &&
      payment.purpose === 'broker_verified_profile' &&
      payment.status === 'successful' &&
      payment.serviceStatus === 'requested'
    );
    if (!order) return null;
    const broker = this.data.brokers.find((profile) => profile.profileId === order.userId);
    if (!broker) return null;
    broker.isReraVerified = approved;
    order.serviceStatus = approved ? 'active' : 'revoked';
    this.save();
    return order;
  }

  public markPaymentRefunded(orderId: string) {
    const order = this.data.paymentOrders.find((payment) => payment.id === orderId);
    if (!order || order.status === 'refunded') return order || null;
    order.status = 'refunded';
    order.serviceStatus = 'revoked';
    if (order.purpose === 'buyer_contact_unlock') {
      this.data.contactUnlocks = this.data.contactUnlocks.filter((unlock) => unlock.paymentOrderId !== order.id);
    } else if (order.purpose === 'broker_subscription') {
      const anotherActiveSubscription = this.data.paymentOrders.some((payment) =>
        payment.id !== order.id &&
        payment.userId === order.userId &&
        payment.purpose === 'broker_subscription' &&
        payment.status === 'successful' &&
        (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
      );
      if (!anotherActiveSubscription) {
        const broker = this.data.brokers.find((profile) => profile.profileId === order.userId);
        if (broker) broker.subscriptionTier = 'starter';
      }
    } else if (order.propertyId && ['seller_featured_property', 'seller_reels_promotion'].includes(order.purpose)) {
      const activeOrders = this.data.paymentOrders.filter((payment) =>
        payment.id !== order.id &&
        payment.propertyId === order.propertyId &&
        payment.purpose === order.purpose &&
        payment.status === 'successful' &&
        (!payment.serviceExpiresAt || new Date(payment.serviceExpiresAt) > new Date())
      );
      const property = this.data.properties.find((item) => item.id === order.propertyId);
      const latestExpiry = activeOrders
        .map((payment) => payment.serviceExpiresAt ? new Date(payment.serviceExpiresAt) : new Date(0))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      if (property) {
        if (order.purpose === 'seller_featured_property') {
          property.isFeatured = Boolean(latestExpiry);
          property.featuredUntil = latestExpiry?.toISOString();
        } else {
          property.reelsPromotionUntil = latestExpiry?.toISOString();
        }
      }
    }
    this.save();
    return order;
  }

  public getCommissions() {
    return this.data.commissionLedger;
  }

  public createCommissionRecord(record: CommissionRecord) {
    this.data.commissionLedger = [record, ...this.data.commissionLedger];
    this.save();
    return record;
  }

  // Audit Logs
  public addAuditLog(log: Omit<DatabaseSchema['auditLogs'][0], 'id' | 'timestamp'>) {
    const entry = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs = [entry, ...this.data.auditLogs];
    this.save();
    return entry;
  }

  public setSetting(key: string, value: string) {
    this.data.settings[key] = value;
    this.save();
  }
}

export const db = new DatabaseEngine();
