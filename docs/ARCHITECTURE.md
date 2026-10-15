# NILVORA — Architecture & Technical Specifications

## 1. System Overview
**NILVORA** is an AI-powered real estate marketplace engineered for evidence-based property discovery, broker-first transaction coordination, vertical video Reels, document intelligence, and digital transaction execution.

- **Primary Launch Market:** Ambattur, Mogappair, Anna Nagar West, Korattur, and Avadi in Chennai, Tamil Nadu, India.
- **Academic Domain Alignment:** Skill Gap and Youth Employability in property operations, digital surveying, and land revenue coordination.

---

## 2. Technology Stack

### Frontend & Application Layer
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS with rich dark/emerald aesthetics, accessible contrast, and mobile-first responsiveness
- **Icons & Graphics:** Lucide React
- **State Management:** Reactive observable store (`src/lib/store.ts`) with zero-latency browser persistence and Supabase client abstraction

### Data, Security & Backend
- **Database Engine:** PostgreSQL via Supabase with versioned migrations (`supabase/migrations/20260101000000_nilvora_schema.sql`)
- **Row Level Security (RLS):** Enforced on profiles, properties, documents, leads, deal rooms, and commission ledgers
- **Payment Gateway:** Razorpay India integration boundary with server-side order creation, webhook idempotency, and sandbox simulation
- **Document Intelligence:** OCR extraction engine for Tamil Nilam Patta passbooks, TSLR extracts, and 30-year Encumbrance Certificates

---

## 3. Core Business Workflow: Seller → Broker → Buyer
```
PROPERTY OWNER / SELLER 
       ↓ (Lists property, attaches Patta/EC, declares authority)
BROKER / AGENT (TN RERA Registered)
       ↓ (Coordinates visits, produces vertical Reels, manages CRM pipeline)
BUYER DISCOVERY
       ↓ (Watches Reels, inspects Trust Passport, schedules visit)
NEGOTIATION & OFFER
       ↓ (Submits formal offer, broker coordinates seller counter-offer)
DOCUMENT REVIEW & OCR
       ↓ (AI scans survey no., boundaries, missing GCC tax / TSLR records)
NILVORA DEAL ROOM
       ↓ (Milestone tracking: Token Advance → EC Check → Sale Agreement → Loan Sanction → SRO Slot)
REGISTRATION FOLLOW-UP
       ↓ (TNREGINET fee calculation: 7% Stamp Duty + 2% Reg Fee, execution at SRO Ambattur)
```

---

## 4. Key Architectural Safeguards
1. **Evidence-Based Trust Passports:** Badges explicitly state the scope of completed checks (Seller declaration vs. Revenue document match vs. Advocate title opinion). We never issue vague "100% Verified" claims.
2. **Transparent Commission Accounting:** Segregates property transaction value from gross broker commissions and NILVORA platform revenue.
3. **Privacy by Design:** Phone numbers and confidential parent deeds are protected; buyer contacts are shared only with the assigned broker for scheduled visits or formal offers.
