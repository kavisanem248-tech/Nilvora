-- ==============================================================================
-- NILVORA POSTGRESQL SCHEMA (MIGRATION 20260101000000)
-- Full Real Estate Marketplace, Broker Operations, Deals, Trust & Compliance
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ACCOUNTS
CREATE TYPE user_role AS ENUM (
  'buyer',
  'seller',
  'broker',
  'builder',
  'legal_pro',
  'admin'
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role NOT NULL DEFAULT 'buyer',
  preferred_language VARCHAR(10) DEFAULT 'en', -- 'en' or 'ta'
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  district VARCHAR(100) DEFAULT 'Chennai',
  locality VARCHAR(100) DEFAULT 'Ambattur',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BROKER PROFILES
CREATE TABLE IF NOT EXISTS broker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  agency_name VARCHAR(255),
  rera_number VARCHAR(100),
  experience_years INT DEFAULT 3,
  service_areas TEXT[] DEFAULT ARRAY['Ambattur', 'Mogappair', 'Anna Nagar', 'Korattur', 'Avadi'],
  default_commission_percent NUMERIC(4, 2) DEFAULT 1.50,
  bio TEXT,
  rating NUMERIC(3, 2) DEFAULT 4.80,
  total_deals_closed INT DEFAULT 0,
  is_rera_verified BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'pro', 'team'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROPERTIES
CREATE TYPE property_type AS ENUM (
  'apartment',
  'independent_house',
  'villa',
  'plot',
  'commercial',
  'builder_project'
);

CREATE TYPE listing_type AS ENUM ('sale', 'rent');
CREATE TYPE listing_status AS ENUM (
  'draft',
  'under_review',
  'approved',
  'published',
  'paused',
  'sold',
  'rejected'
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_broker_id UUID REFERENCES broker_profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  title_ta VARCHAR(255),
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  listing_type listing_type NOT NULL DEFAULT 'sale',
  status listing_status NOT NULL DEFAULT 'under_review',
  price NUMERIC(14, 2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT TRUE,
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
  district VARCHAR(100) DEFAULT 'Chennai',
  locality VARCHAR(100) NOT NULL, -- e.g. 'Ambattur', 'Anna Nagar'
  sub_locality VARCHAR(100),
  pincode VARCHAR(10) DEFAULT '600053',
  address_visibility VARCHAR(50) DEFAULT 'approximate', -- 'exact', 'approximate'
  survey_number VARCHAR(100),
  patta_number VARCHAR(100),
  area_sqft INT NOT NULL,
  bedrooms INT DEFAULT 2,
  bathrooms INT DEFAULT 2,
  floor_number INT,
  total_floors INT,
  furnishing_status VARCHAR(50) DEFAULT 'semi-furnished', -- 'unfurnished', 'semi-furnished', 'fully-furnished'
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  has_video BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  reels_promotion_until TIMESTAMPTZ,
  trust_score INT DEFAULT 85,
  trust_scope JSONB DEFAULT '{"seller_declaration": true, "doc_checked": false, "legal_reviewed": false}'::JSONB,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROPERTY MEDIA & REELS
CREATE TYPE media_type AS ENUM ('photo', 'video_reel', 'video_landscape', 'floor_plan', 'document');

CREATE TABLE IF NOT EXISTS property_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  media_type media_type NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption VARCHAR(255),
  caption_ta VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general', -- 'exterior', 'living_room', 'bedrooms', 'kitchen', 'terrace', 'neighborhood'
  duration_seconds INT,
  is_cover BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCUMENTS & VERIFICATION
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'sale_deed', 'patta', 'chitta', 'encumbrance_certificate', 'tnrera_approval'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verification_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SELLER -> BROKER ASSIGNMENTS
CREATE TABLE IF NOT EXISTS seller_broker_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE RESTRICT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'pending', 'active', 'declined', 'completed', 'terminated'
  commission_percentage NUMERIC(4, 2) NOT NULL DEFAULT 1.50,
  exclusivity_type VARCHAR(50) DEFAULT 'semi_exclusive',
  signed_agreement_url TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BROKER LEADS & CRM PIPELINE
CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'property_suggested',
  'visit_scheduled',
  'visit_completed',
  'negotiation',
  'agreement_prep',
  'won',
  'lost'
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20) NOT NULL,
  buyer_email VARCHAR(255),
  budget_min NUMERIC(14, 2),
  budget_max NUMERIC(14, 2),
  preferred_locality VARCHAR(100) DEFAULT 'Ambattur',
  status lead_status NOT NULL DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  notes TEXT,
  next_follow_up TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. APPOINTMENTS & SITE VISITS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed', -- 'requested', 'confirmed', 'completed', 'cancelled', 'rescheduled'
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. OFFERS & NEGOTIATIONS
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  broker_id UUID REFERENCES broker_profiles(id) ON DELETE SET NULL,
  offer_amount NUMERIC(14, 2) NOT NULL,
  counter_amount NUMERIC(14, 2),
  status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'countered', 'accepted', 'rejected', 'expired'
  terms_conditions TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NILVORA DEAL ROOM
CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'in_negotiation', -- 'in_negotiation', 'agreement_drafting', 'patta_verification', 'registration_scheduled', 'closed_won', 'cancelled'
  agreed_price NUMERIC(14, 2) NOT NULL,
  token_amount NUMERIC(14, 2) DEFAULT 0,
  token_paid BOOLEAN DEFAULT FALSE,
  commission_percentage NUMERIC(4, 2) DEFAULT 1.50,
  commission_amount NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DEAL MILESTONES
CREATE TABLE IF NOT EXISTS deal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE CASCADE,
  milestone_title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 1
);

-- 12. CONVERSATIONS & COMMUNICATION HUB
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  participant_one UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PAYMENTS & FINANCIAL LEDGER
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  purchaser_role VARCHAR(20),
  purpose VARCHAR(100) NOT NULL,
  item_id VARCHAR(100),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created', -- 'created', 'processing', 'successful', 'failed', 'refunded'
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  service_status VARCHAR(50),
  service_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  receipt_number VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_contact_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  payment_order_id UUID NOT NULL UNIQUE REFERENCES payment_orders(id) ON DELETE RESTRICT,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, property_id)
);

CREATE TABLE IF NOT EXISTS property_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS commission_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_room_id UUID NOT NULL REFERENCES deal_rooms(id) ON DELETE RESTRICT,
  broker_id UUID NOT NULL REFERENCES broker_profiles(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  total_property_value NUMERIC(14, 2) NOT NULL,
  commission_percentage NUMERIC(4, 2) NOT NULL,
  gross_commission NUMERIC(14, 2) NOT NULL,
  platform_fee_percent NUMERIC(4, 2) DEFAULT 10.00,
  platform_fee_amount NUMERIC(14, 2) NOT NULL,
  net_broker_commission NUMERIC(14, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'invoiced', 'paid', 'disputed'
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DOCUMENT ANALYSIS & OCR JOBS
CREATE TABLE IF NOT EXISTS document_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES property_documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doc_category VARCHAR(100) NOT NULL,
  extracted_survey_number VARCHAR(100),
  extracted_patta_holder VARCHAR(255),
  extracted_extent_sqft INT,
  identified_encumbrances TEXT,
  risk_assessment_score INT DEFAULT 90, -- 0-100
  disclaimer_accepted BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'completed', -- 'queued', 'processing', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. COMPLIANCE RULE PACKS
CREATE TABLE IF NOT EXISTS compliance_rule_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_code VARCHAR(10) NOT NULL DEFAULT 'TN', -- 'TN', 'KA', 'MH', etc.
  jurisdiction_name VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  rule_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirement_summary TEXT NOT NULL,
  official_source_url TEXT NOT NULL,
  effective_date DATE DEFAULT '2024-01-01',
  last_reviewed_date DATE DEFAULT '2026-01-15',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH QUERY EFFICIENCY
CREATE INDEX IF NOT EXISTS idx_properties_locality ON properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_leads_broker ON leads(broker_id, status);
CREATE INDEX IF NOT EXISTS idx_reels_property ON property_media(property_id, media_type);
CREATE INDEX IF NOT EXISTS idx_deal_rooms_participants ON deal_rooms(seller_id, broker_id, buyer_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_contact_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_likes ENABLE ROW LEVEL SECURITY;

-- BASE POLICIES (Public discovery for approved properties)
CREATE POLICY "Public can view published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view and edit own profile" ON profiles
  FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY "Brokers can view assigned leads" ON leads
  FOR ALL USING (broker_id IN (SELECT id FROM broker_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())));

CREATE POLICY "Users can view their payment orders" ON payment_orders
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Buyers can view their contact unlocks" ON property_contact_unlocks
  FOR SELECT USING (buyer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view their own property likes" ON property_likes
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage their own property likes" ON property_likes
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
