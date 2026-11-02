# QueueLess

**Scan. Shop. Pay. Go.**

QueueLess is a mobile-first scan-and-pay checkout system designed for physical retail stores. Customers scan a store QR code, scan product barcodes while shopping, add products to their cart, complete payment through Razorpay, and receive a digital receipt QR code for verification at the store exit.

The goal is to reduce time spent waiting at traditional billing counters.

## 1. Problem Statement

Traditional retail checkout requires customers to wait at billing counters, even when they have already selected their products and can make digital payments using their phones.

During busy hours, this creates unnecessary queues and increases the time required to complete a shopping trip.

## 2. Proposed Solution

QueueLess provides an alternative checkout process through a mobile application.

Customers can:
- Scan a store's QR code to enter its digital shopping environment.
- Scan product barcodes to find and add products to their cart.
- View product details, quantities, and total prices.
- Complete checkout using Razorpay.
- Receive a digital receipt containing a QR code.
- Present the receipt QR code to store security for verification.

The store owner can manage products and view orders through the owner dashboard.

## 3. Core Workflow

```text
CUSTOMER SCANS STORE QR
          |
          v
     OPEN STORE
          |
          v
   SCAN PRODUCT BARCODE
          |
          v
      ADD TO CART
          |
          v
    CREATE ORDER
          |
          v
   RAZORPAY PAYMENT
          |
          v
   PAYMENT VERIFICATION
          |
          v
   GENERATE RECEIPT QR
          |
          v
   SECURITY SCANS QR
          |
          v
   BACKEND VERIFICATION
          |
          v
     MARK RECEIPT USED
          |
          v
        EXIT
```

## 4. Main Features

### Customer Features
- Store entry through QR codes.
- Barcode-based product lookup.
- Manual barcode entry as an alternative.
- Shopping cart with quantity management.
- Server-authoritative order pricing.
- Razorpay payment integration.
- Digital receipt generation.
- Receipt verification at the store exit.

### Store Owner Features
- Store registration.
- Store-specific QR code generation.
- Product management.
- Product barcode registration.
- UPI payment configuration.
- Order management through the owner dashboard.

### Security Features
- Unique receipt tokens.
- Server-side payment verification.
- Store-specific receipt validation.
- Prevention of duplicate receipt usage.
- Rejection of invalid or previously used receipts.

## 5. System Architecture

QueueLess is divided into two main applications.

**Frontend**

- React
- Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion
- React Router
- Lucide React
- ZXing browser scanner
- qrcode.react

**Backend**

- Node.js
- Express.js
- TypeScript
- Razorpay SDK
- Supabase client

### Backend Request Flow

```text
Client Request
      |
      v
    Routes
      |
      v
  Controllers
      |
      v
   Services
      |
      v
  Repositories
      |
      v
  Data Storage
```

The backend handles order creation, payment verification, product lookup, and receipt validation.

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express |
| Language | TypeScript |
| Barcode Scanning | ZXing |
| QR Generation | qrcode.react |
| Payments | Razorpay |
| Database Integration | Supabase client |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## 7. Project Structure

```text
QueueLess/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## 8. Local Installation

### Prerequisites

- Node.js
- npm
- Git
- Supabase project credentials
- Razorpay test API credentials

### Clone the Repository

```bash
git clone https://github.com/Divyansh-soni797/QueueLess.git

cd QueueLess
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend runs locally on port `4000` by default.

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL, usually:

```text
http://localhost:5173
```

## 9. Environment Variables

Environment variables must be configured separately for local development and production.

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Backend

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Never commit `.env` files or expose backend secrets in frontend code.

## 10. Deployment

QueueLess is deployed using separate frontend and backend hosting services.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database integration | Supabase |
| Payment gateway | Razorpay Test Mode |

The frontend communicates with the deployed backend using:

```text
https://queueless-backend-yqc1.onrender.com/api
```

Set the following frontend environment variables in Vercel:

```env
VITE_API_BASE_URL=https://queueless-backend-yqc1.onrender.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_test_key_id
```

Backend credentials must be configured in Render's environment variable settings.

## 11. Payment and Receipt Verification

QueueLess uses Razorpay for payment processing.

The payment workflow includes:
1. Creating an order through the backend.
2. Initiating payment using Razorpay.
3. Receiving the payment response.
4. Verifying the payment signature on the backend.
5. Updating the payment status.
6. Generating a digital receipt QR code.

The receipt QR code is intended to contain an opaque receipt token rather than trusted payment information.

When security scans a receipt, the backend validates its existence, store association, payment status, and usage status.

A previously used receipt must not be accepted again.

**Note:** The current deployment uses Razorpay Test Mode. Real-money payment processing requires a separately configured production Razorpay account and live credentials.

## 12. Testing

The project has been manually tested for the following workflows:

- Store registration and store QR generation.
- Store lookup.
- Product barcode lookup.
- Manual barcode entry.
- Cart quantity management.
- Order creation.
- Payment flow using Razorpay Test Mode.
- Backend payment verification.
- Digital receipt generation.
- Receipt QR scanning.
- Rejection of duplicate receipt scans.
- Rejection of receipts associated with another store.
- Mobile-responsive page layouts.

Mobile camera scanning has been tested successfully. Laptop webcam scanning may be less reliable depending on camera focus and image quality.

## 13. Current Limitations and Future Scope

Potential improvements include:

- Automated unit and integration testing.
- Owner authentication and role-based access control.
- Receipt expiration.
- Better laptop webcam compatibility.
- Improved error handling and network recovery.
- Production payment configuration.
- Database-level transaction guarantees for concurrent receipt verification.
- Performance optimization and frontend code splitting.
- Accessibility improvements.

## 14. Project Objective

QueueLess demonstrates how barcode scanning, QR-based identification, digital payments, and server-side receipt verification can be combined to create an alternative checkout experience for physical retail stores.

The project focuses on reducing checkout friction while maintaining a verification process at the store exit.

---

**Project:** QueueLess
**Repository:** https://github.com/Divyansh-soni797/QueueLess
**Frontend:** React + Vite
**Backend:** Node.js + Express
**Deployment:** Vercel + Render

### Database Architecture

QueueLess uses Supabase as its database layer for storing and managing application data. The backend communicates with Supabase through dedicated repository modules, keeping database operations separate from the main business logic.

The database contains five main tables: `shops`, `products`, `orders`, `order_items`, and `receipts`.

- **Shops:** Stores shop information such as name, logo URL, UPI ID, and tagline.
- **Products:** Maintains product details, including barcode, name, price, and image URL. Products are associated with their respective shops.
- **Orders:** Stores order information, total amount, payment status, and creation time.
- **Order Items:** Contains individual products included in each order, along with their prices and quantities.
- **Receipts:** Stores receipt tokens, associated order and shop IDs, payment status, and exit verification status.

Two PostgreSQL database functions support important operations. The `create_order_with_items` function handles order creation along with its associated items. The `verify_and_consume_receipt` function checks a receipt against the shop and updates its usage status to prevent repeated verification.

The backend uses repository modules to perform database operations. This approach separates data access from application logic and makes the codebase easier to maintain.
