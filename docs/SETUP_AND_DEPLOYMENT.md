# NILVORA — Setup, Configuration & Deployment Guide

## 1. Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test # or: node --test tests/nilvora.test.mjs

# 3. Start development server
npm run dev

# 4. Access application
http://localhost:3000
```

---

## 2. Environment Configuration
Copy `.env.example` to `.env.local` and populate relevant service credentials:

```bash
cp .env.example .env.local
```

### Essential Environment Variables
- `NEXT_PUBLIC_APP_URL`: Base application URL (e.g. `http://localhost:3000` or production domain)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase server-side service key (never exposed to browser)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay key ID (Test or Live)
- `RAZORPAY_KEY_SECRET`: Razorpay secret for HMAC-SHA256 signature verification
- `RESEND_API_KEY`: Transactional email delivery key
- `MSG91_AUTH_KEY`: OTP and SMS delivery gateway
- `GEMINI_API_KEY`: Server-side key for the NILVORA AI assistant (never expose with `NEXT_PUBLIC_`)
- `AI_MODEL_NAME`: Optional Gemini model override; defaults to `gemini-3.8-flash`

*Note: In local development, NILVORA automatically activates simulated sandbox fallbacks for Supabase, Razorpay, and Document OCR when external keys are not provided.*

---

## 3. Database Migration Deployment
To apply PostgreSQL schema migrations to a live Supabase project:

```bash
npx supabase db push
# or execute SQL directly via Supabase SQL Editor:
# supabase/migrations/20260101000000_nilvora_schema.sql
```

---

## 4. Production Build Verification
```bash
npm run build
npm start
```
All routes support Turbopack compilation and Next.js partial pre-rendering.
