## NILVORA

NILVORA is the existing real-estate marketplace and role-based property portal built with Next.js.

### Run locally

```bash
npm install
npm run dev
```

The root route redirects to the Buyer Sites page at `/plots`. Sign in at `/login` and select the account's registered role. Buyer, Seller, Broker, and Admin routes are guarded by the active server session.

### Admin account

Admin accounts cannot be created through public registration or demo sign-in. In local development only, you can sign in using the configured username alias (`NILVORA_ADMIN_USERNAME`) and `NILVORA_ADMIN_PASSWORD`; set `NILVORA_ADMIN_EMAIL` to the seeded admin account email. Keep these values in the ignored `.env.local`, never expose them through a `NEXT_PUBLIC_` variable, and replace the default development password before using a shared or deployed environment. Production admin sign-in accepts only the seeded account email and a server-side password of at least 16 characters; the username alias is disabled. Admin role changes are not available through the ordinary user-role editor.

### Payments

Real payment checkout requires server-side `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` settings. If the gateway keys are not configured, checkout creates clearly labeled `DEMO` orders that remain unpaid and do not activate services or count as revenue. Partial gateway configuration is reported as unavailable. Real payments are verified using the Razorpay signature and a server-side captured-payment lookup; webhook confirmation is also supported.

The service catalog includes configurable buyer, seller, and broker pricing. Admins can change prices in the Revenue Dashboard; a price of ₹0 disables checkout for an unpriced optional service. Sample prices are not transactions. Revenue totals include only verified, non-demo successful payments, and contact details are returned only after a verified buyer contact-unlock payment.

### Validate

```bash
npx tsc --noEmit
npm run build
```

See the [Next.js documentation](https://nextjs.org/docs) for framework guidance.
