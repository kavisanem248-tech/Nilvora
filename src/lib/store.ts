'use client';

import {
  PropertyItem,
  BrokerProfile,
  LeadItem,
  AppointmentItem,
  OfferItem,
  DealRoomItem,
  CommissionRecord,
  PaymentOrder,
  DocumentAnalysisResult,
  UserRole,
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
  SAMPLE_AI_DOCUMENT_ANALYSIS,
} from './mock-data';

// Key for local persistence
const STORAGE_KEY = 'nilvora_app_state_v1';

export interface AppState {
  currentRole: UserRole;
  currentUser: UserProfile;
  properties: PropertyItem[];
  brokers: BrokerProfile[];
  leads: LeadItem[];
  appointments: AppointmentItem[];
  offers: OfferItem[];
  dealRooms: DealRoomItem[];
  commissions: CommissionRecord[];
  payments: PaymentOrder[];
  documentAnalyses: DocumentAnalysisResult[];
  savedPropertyIds: string[];
  preferredLanguage: 'en' | 'ta';
}

const DEFAULT_USER: UserProfile = {
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
};

const DEFAULT_STATE: AppState = {
  currentRole: 'buyer',
  currentUser: DEFAULT_USER,
  properties: INITIAL_PROPERTIES,
  brokers: INITIAL_BROKERS,
  leads: INITIAL_LEADS,
  appointments: INITIAL_APPOINTMENTS,
  offers: INITIAL_OFFERS,
  dealRooms: INITIAL_DEAL_ROOMS,
  commissions: INITIAL_COMMISSIONS,
  payments: [],
  documentAnalyses: [SAMPLE_AI_DOCUMENT_ANALYSIS],
  savedPropertyIds: ['prop-1', 'prop-4'],
  preferredLanguage: 'en',
};

class Store {
  private state: AppState = DEFAULT_STATE;
  private listeners: Set<() => void> = new Set();
  private isLoaded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
    }
  }

  private load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const storedProperties = Array.isArray(parsed.properties) ? parsed.properties : [];
        const storedPropertyIds = new Set(storedProperties.map((property: PropertyItem) => property.id));
        this.state = {
          ...DEFAULT_STATE,
          ...parsed,
          properties: [
            ...(storedProperties.length ? storedProperties : INITIAL_PROPERTIES),
            ...INITIAL_PROPERTIES.filter((property) => !storedPropertyIds.has(property.id)),
          ],
          brokers: parsed.brokers?.length ? parsed.brokers : INITIAL_BROKERS,
        };
      }
    } catch {
      this.state = DEFAULT_STATE;
    }
    this.isLoaded = true;
    this.notify();
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }
    this.notify();
  }

  public getState(): AppState {
    if (typeof window !== 'undefined' && !this.isLoaded) {
      this.load();
    }
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- ACTIONS ---

  public setRole(role: UserRole) {
    this.state.currentRole = role;
    this.state.currentUser.role = role;
    this.save();
  }

  public setLanguage(lang: 'en' | 'ta') {
    this.state.preferredLanguage = lang;
    this.state.currentUser.preferredLanguage = lang;
    this.save();
  }

  public toggleSaveProperty(id: string) {
    if (this.state.savedPropertyIds.includes(id)) {
      this.state.savedPropertyIds = this.state.savedPropertyIds.filter((pId) => pId !== id);
    } else {
      this.state.savedPropertyIds = [...this.state.savedPropertyIds, id];
    }
    this.save();
  }

  public addProperty(property: PropertyItem, syncToServer = true) {
    this.state.properties = [property, ...this.state.properties];
    this.save();
    // Synchronize to persistent server database
    if (syncToServer && typeof window !== 'undefined') {
      fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property),
      }).catch((e) => console.warn('[NILVORA STORE] Server sync notice:', e));
    }
  }

  public updateProperty(id: string, updates: Partial<PropertyItem>) {
    this.state.properties = this.state.properties.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    this.save();
    if (typeof window !== 'undefined') {
      fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch((e) => console.warn('[NILVORA STORE] Server sync notice:', e));
    }
  }

  public addReelToProperty(propertyId: string, reel: PropertyItem['reels'][0]) {
    this.state.properties = this.state.properties.map((p) => {
      if (p.id === propertyId) {
        return {
          ...p,
          hasVideo: true,
          reels: [reel, ...p.reels],
        };
      }
      return p;
    });
    this.save();
  }

  public addLead(lead: Omit<LeadItem, 'id' | 'createdAt'>) {
    const newLead: LeadItem = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.leads = [newLead, ...this.state.leads];
    this.save();

    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      }).catch((e) => console.warn('[NILVORA STORE] Lead sync notice:', e));
    }
    return newLead;
  }

  public updateLeadStatus(id: string, status: LeadItem['status']) {
    this.state.leads = this.state.leads.map((l) =>
      l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l
    );
    this.save();

    if (typeof window !== 'undefined') {
      fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      }).catch((e) => console.warn('[NILVORA STORE] Lead status sync notice:', e));
    }
  }

  public addAppointment(appointment: Omit<AppointmentItem, 'id'>) {
    const newAppt: AppointmentItem = {
      ...appointment,
      id: `appt-${Date.now()}`,
    };
    this.state.appointments = [newAppt, ...this.state.appointments];
    this.save();

    if (typeof window !== 'undefined') {
      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt),
      }).catch((e) => console.warn('[NILVORA STORE] Appt sync notice:', e));
    }
    return newAppt;
  }

  public addOffer(offer: Omit<OfferItem, 'id' | 'createdAt'>) {
    const newOffer: OfferItem = {
      ...offer,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.offers = [newOffer, ...this.state.offers];
    this.save();

    if (typeof window !== 'undefined') {
      fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      }).catch((e) => console.warn('[NILVORA STORE] Offer sync notice:', e));
    }
    return newOffer;
  }

  public addPayment(payment: Omit<PaymentOrder, 'id' | 'createdAt'>) {
    const newPayment: PaymentOrder = {
      ...payment,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.payments = [newPayment, ...this.state.payments];
    this.save();
    return newPayment;
  }

  public addDocumentAnalysis(analysis: DocumentAnalysisResult) {
    this.state.documentAnalyses = [analysis, ...this.state.documentAnalyses];
    this.save();
  }

  public toggleDealMilestone(dealId: string, milestoneId: string) {
    let targetMilestoneCompleted = false;

    this.state.dealRooms = this.state.dealRooms.map((d) => {
      if (d.id === dealId) {
        return {
          ...d,
          milestones: d.milestones.map((m) => {
            if (m.id === milestoneId) {
              targetMilestoneCompleted = !m.isCompleted;
              return {
                ...m,
                isCompleted: !m.isCompleted,
                completedAt: !m.isCompleted ? new Date().toISOString() : undefined,
              };
            }
            return m;
          }),
        };
      }
      return d;
    });
    this.save();

    if (typeof window !== 'undefined') {
      fetch(`/api/deal-rooms/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          isCompleted: targetMilestoneCompleted,
        }),
      }).catch((e) => console.warn('[NILVORA STORE] Deal milestone sync notice:', e));
    }
  }

  public resetToDefaults() {
    this.state = DEFAULT_STATE;
    this.save();
  }
}

// Global Singleton
export const nilvoraStore = new Store();
