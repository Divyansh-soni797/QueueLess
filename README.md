# QueueLess

A scan-and-pay checkout system for physical retail stores. Customers scan a
store's QR, scan product barcodes as they shop, pay the store directly via
UPI, and get a one-time-use digital receipt QR to show security on the way
out — no billing counter queue required.

**Scan → Pay → Verify → Go**

---

## 1. Problem

Billing counter queues are one of the slowest parts of in-store retail
shopping. Customers already carry a phone capable of scanning a barcode and
paying — there's no technical reason checkout has to mean standing in line.

## 2. Solution

QueueLess lets a customer scan a store's entry QR, scan each product's
barcode as they pick it up, pay the shop owner directly over UPI, and walk
out — showing a one-time QR receipt to store security instead of a physical
bill. The traditional counter still exists for anyone who wants it; QueueLess
is an optional faster lane.

## 3. Core user flow

```
STORE QR → SCAN PRODUCT → ADD TO CART → PAY VIA UPI →
DIGITAL RECEIPT → SECURITY SCANS RECEIPT → BACKEND VERIFICATION →
MARK USED → EXIT
```

There is no customer signup, login, or OTP anywhere in this flow.

## 4. Architecture

Two independent apps:

```
frontend/   React + Vite + TypeScript + Tailwind, mobile-first
backend/    Node + Express + TypeScript, layered architecture
```

Backend request flow:

```
Route → Controller → Service → Repository → Data store
```

Business logic lives in services; controllers only translate HTTP ↔ service
calls; repositories are the only layer that knows how data is actually
stored (see "Known limitations" — this is the seam where a real database
would plug in).

## 5. Database design

Conceptually, five entities:

- **shops** — id, name, upiId, tagline
- **products** — id, shopId, barcode, name, price
- **orders** — id, shopId, items[], totalAmount, paymentStatus, createdAt
- **order_items** — embedded in orders here (see limitations)
- **receipts** — id, receiptToken, orderId, shopId, paymentStatus,
  exitStatus (UNUSED/USED), createdAt, usedAt

## 6. Payment approach

QueueLess never holds customer money. Checkout builds a standard UPI deep
link (`upi://pay?pa=...&pn=...&am=...`) straight to the store's own UPI ID,
the same as any peer-to-peer UPI transfer. Payment status is tracked as
`PENDING → SUCCESS | FAILED | CANCELLED`.

## 7. Receipt verification & security

This is the part that actually has to be correct:

- The QR code only ever contains an opaque, cryptographically random
  receipt token — never a "PAID" flag, never order details.
- Verification is entirely server-side. The backend looks up the token and
  independently checks: does it exist, does it belong to this shop, was
  payment actually confirmed, has it already been used. The client's or
  QR's own claims are never trusted.
- Marking a receipt USED happens in the same atomic step as the validity
  check (no `await` between reading and writing), so two security guards
  scanning the same receipt at the same instant cannot both get a valid
  result. This was tested directly — see "Known limitations" for the
  concurrency caveat that still applies with a real multi-process database.

## 8. Tech stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS v4, Framer Motion,
Lucide React, React Router, @zxing/browser (barcode/QR scanning),
qrcode.react (QR generation)

**Backend:** Node.js, Express, TypeScript

**Data:** in-memory (see limitations)

## 9. Running it locally

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

The frontend reads the backend URL from `frontend/.env`
(`VITE_API_BASE_URL`), already set to `http://localhost:4000/api`.

Try it at `/shop/demo`. Demo barcodes are on the scan screen so you can try
the full flow without a physical product or a working camera. The owner
dashboard is at `/shop/demo/owner` and the security check-in at
`/shop/demo/verify` (linked from the landing page for demo purposes only —
see limitations).

## 10. Known limitations

This is a portfolio-scale prototype. Being upfront about what's simplified:

- **Data store is in-memory, not Supabase/PostgreSQL.** Every repository
  method is written the way a real DB-backed repository would be (async,
  returns plain objects), so swapping the inside of each `repositories/*.ts`
  file for real Supabase queries shouldn't require touching services or
  controllers. Restarting the backend wipes all data.
- **Payment confirmation is manual, not gateway-verified.** There's no real
  UPI payment gateway integration here — the "I've completed the payment"
  button on the payment screen is what a real webhook/callback from a UPI
  PSP would trigger in production. This is a known, disclosed limitation of
  the prototype, not a bug — see the note directly on the payment screen.
- **Owner dashboard has no authentication.** Anyone with the URL can edit a
  store's products and UPI ID. Fine for a demo; not fine for production —
  a real deployment needs owner login before this ships.
- **Atomicity holds for a single Node process,** which is what's running
  here. A production deployment with a real database and multiple server
  instances would need the equivalent atomic guarantee enforced at the
  database layer (e.g. a single conditional UPDATE with `WHERE exit_status
  = 'UNUSED'` checked via the returned row count), not just in application
  code.
- **No `shopping_sessions` table.** The cart lives as client-side state
  (sessionStorage) until checkout creates a real order; this was simpler
  than modeling an intermediate session entity and doesn't lose anything a
  customer would notice.
- **The security check-in and store dashboard links on the customer landing
  page are demo-only conveniences.** In production, staff and owners would
  be given those URLs directly rather than having them discoverable from
  the customer-facing page.

## 11. Testing performed

Verified manually end-to-end (see conversation for screenshots): shop
landing (found + not-found states), barcode → product lookup against the
real backend, cart quantity management, order creation with
server-authoritative pricing, UPI link generation, payment state
transitions, receipt QR generation, and the full security verification loop
— including confirming a second scan of the same receipt is correctly
rejected as `ALREADY_USED`, and a receipt scanned at the wrong shop is
rejected as `WRONG_SHOP`.

Not yet covered: automated test suite, expired-receipt handling (no
expiry concept exists yet), network-failure UI states beyond basic error
messages, and accessibility audit beyond basic focus states and aria
labels.

## 12. Future improvements

- Real Supabase/PostgreSQL persistence
- Real UPI payment gateway webhook integration
- Owner authentication
- Receipt expiry
- Automated tests (unit + integration)
- Deployment (Vercel for frontend, Render/Railway for backend, Supabase for
  data — not yet done)
