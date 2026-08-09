# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system for wholesale/distribution companies — managing customers, products, stock, purchase orders, sales challans, and CRM follow-ups.

![Tech Stack](https://img.shields.io/badge/Node.js-Express-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791) ![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748)

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Local Setup Instructions](#local-setup-instructions)
- [Environment Variables](#environment-variables)
- [Test Credentials](#test-credentials)
- [API Documentation](#api-documentation)
- [Deployment Guide](#deployment-guide)
- [Docker Setup](#docker-setup)
- [Known Limitations](#known-limitations)
- [Assumptions](#assumptions)

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   React SPA     │────▶│  Express.js REST API  │────▶│  PostgreSQL  │
│   (Vite + TS)   │     │  (Node.js + TS)       │     │  (Prisma ORM)│
│   Port: 5173    │     │  Port: 5000           │     │  Port: 5432  │
└─────────────────┘     └──────────────────────┘     └──────────────┘
```

- **Frontend**: React 18 + Vite + TypeScript — Single-page application with role-based routing
- **Backend**: Express.js + TypeScript — REST API with JWT auth, Zod validation, Prisma ORM
- **Database**: PostgreSQL — Relational database with Prisma migrations
- **Auth**: JWT-based with 4 roles (Admin, Sales, Warehouse, Accounts)

---

## Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, React Router v6, Axios |
| Backend    | Node.js, Express.js, TypeScript                  |
| Database   | PostgreSQL, Prisma ORM                           |
| Auth       | JSON Web Tokens (JWT), bcryptjs                  |
| Validation | Zod (backend), HTML5 + custom (frontend)         |
| Styling    | Vanilla CSS (dark theme, glassmorphism, responsive) |
| Icons      | react-icons (Heroicons v2)                       |
| Toasts     | react-hot-toast                                  |

---

## Features

### 1. Authentication & Roles
- JWT-based login with role-based access control (RBAC)
- 4 roles: **Admin** (full access), **Sales** (customers + challans), **Warehouse** (products + stock), **Accounts** (view customers + challans)
- Protected routes on both frontend and backend

### 2. Customer CRM Module
- Full CRUD: Add, Edit, View, Search customers
- Customer fields: name, mobile, email, business name, GST, type, status, address, follow-up date, notes
- Customer types: Retail, Wholesale, Distributor
- Status tracking: Lead → Active → Inactive
- Follow-up notes with date scheduling
- Search across name, email, business, mobile
- Pagination and filtering by status/type

### 3. Product & Inventory Module
- Full CRUD: Add, Edit, View products
- Product fields: name, SKU (unique), category, unit price, stock, min stock alert, warehouse location
- Low stock alert highlighting
- Stock movement log tracking all IN/OUT movements
- Movement records: product, quantity, direction (IN/OUT), reason, user, timestamp

### 4. Sales Challan Module
- Multi-product challan creation with customer selection
- Auto-generated challan number (CH-YYYYMMDD-XXXX format)
- Draft → Confirmed → Cancelled workflow
- **Business logic**:
  - Stock reduction on confirmation (atomic transaction)
  - Negative stock prevention with error messages
  - Product snapshot data stored in challan items (name, SKU, price at time of creation)
  - Stock restoration on cancellation of confirmed challans
- Summary view with total quantity and amount

### 5. Dashboard
- Overview stats: total customers, active customers, products, low stock alerts, pending challans
- Recent customers and challans tables

---

## Project Structure

```
Funds/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # Axios API layer (auth, customers, products, stock, challans, dashboard)
│   │   ├── components/
│   │   │   ├── common/       # Reusable: DataTable, Modal, StatusBadge, SearchBar, StatCard, etc.
│   │   │   └── layout/       # Sidebar, Header, DashboardLayout, ProtectedRoute
│   │   ├── context/          # AuthContext with JWT management
│   │   ├── pages/            # Login, Dashboard, customers/, products/, stock/, challans/
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Route definitions
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Design system (dark theme, glassmorphism)
│   ├── .env                  # Frontend env vars
│   └── package.json
│
├── server/                    # Express backend
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (7 models, 5 enums)
│   │   └── seed.ts           # Test data seeder
│   ├── src/
│   │   ├── middleware/       # auth (JWT+RBAC), validate (Zod), errorHandler
│   │   ├── routes/           # auth, customer, product, stock, challan, dashboard
│   │   ├── validators/       # Zod schemas for all endpoints
│   │   ├── utils/            # AppError, helpers, Prisma singleton
│   │   └── index.ts          # Express app entry point
│   ├── .env                  # Backend env vars
│   └── package.json
│
├── docker-compose.yml         # Docker setup for local dev
└── README.md                  # This file
```

---

## Local Setup Instructions

### Prerequisites
- **Node.js** v18+ and npm
- **PostgreSQL** v13+ running locally (or use Docker)

### Option A: Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd Funds

# 2. Start PostgreSQL with Docker
docker-compose up -d postgres

# 3. Set up Backend
cd server
npm install
cp .env.example .env            # Edit .env if needed
npx prisma migrate dev --name init
npm run prisma:seed             # Seeds 4 users, 10 customers, 15 products
npm run dev                     # Starts on http://localhost:5000

# 4. Set up Frontend (new terminal)
cd client
npm install
npm run dev                     # Starts on http://localhost:5173
```

### Option B: Manual PostgreSQL Setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE erp_crm;"

# 2. Set up Backend
cd server
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection string:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/erp_crm
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev

# 3. Set up Frontend (new terminal)
cd client
npm install
npm run dev
```

### Verifying Setup
1. Open http://localhost:5173 in your browser
2. Login with `admin@erp.com` / `Password@123`
3. You should see the Dashboard with stats

---

## Environment Variables

### Backend (`server/.env`)

| Variable       | Description                          | Default                                          |
|----------------|--------------------------------------|--------------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://postgres:postgres@localhost:5432/erp_crm` |
| `JWT_SECRET`   | Secret key for JWT signing           | `super-secret-jwt-key-for-dev-2024`              |
| `JWT_EXPIRES_IN` | JWT token expiry duration          | `24h`                                            |
| `PORT`         | Server port                          | `5000`                                           |
| `NODE_ENV`     | Environment mode                     | `development`                                    |
| `CORS_ORIGIN`  | Allowed CORS origin                  | `http://localhost:5173`                          |

### Frontend (`client/.env`)

| Variable       | Description                          | Default                              |
|----------------|--------------------------------------|--------------------------------------|
| `VITE_API_URL` | Backend API base URL                 | `http://localhost:5000/api`          |

---

## Test Credentials

| Role      | Email              | Password      | Access                           |
|-----------|--------------------|---------------|----------------------------------|
| Admin     | admin@erp.com      | Password@123  | Full access to all modules       |
| Sales     | sales@erp.com      | Password@123  | Customers, Challans              |
| Warehouse | warehouse@erp.com  | Password@123  | Products, Stock                  |
| Accounts  | accounts@erp.com   | Password@123  | View Customers, View Challans    |

---

## API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint          | Auth | Roles | Description          |
|--------|-------------------|------|-------|----------------------|
| POST   | `/auth/login`     | No   | —     | Login, returns JWT   |
| GET    | `/auth/me`        | Yes  | All   | Get current user     |

### Customers
| Method | Endpoint                        | Auth | Roles         | Description          |
|--------|---------------------------------|------|---------------|----------------------|
| GET    | `/customers?page=&limit=&search=&status=&type=` | Yes | All | List with filters |
| GET    | `/customers/:id`                | Yes  | All           | Detail + follow-ups  |
| POST   | `/customers`                    | Yes  | Admin, Sales  | Create customer      |
| PUT    | `/customers/:id`                | Yes  | Admin, Sales  | Update customer      |
| POST   | `/customers/:id/follow-ups`     | Yes  | Admin, Sales  | Add follow-up note   |

### Products
| Method | Endpoint                        | Auth | Roles             | Description          |
|--------|---------------------------------|------|-------------------|----------------------|
| GET    | `/products?page=&limit=&search=&category=` | Yes | All | List with filters |
| GET    | `/products/low-stock`           | Yes  | All               | Below min stock      |
| GET    | `/products/:id`                 | Yes  | All               | Detail + movements   |
| POST   | `/products`                     | Yes  | Admin, Warehouse  | Create product       |
| PUT    | `/products/:id`                 | Yes  | Admin, Warehouse  | Update product       |

### Stock
| Method | Endpoint                        | Auth | Roles             | Description          |
|--------|---------------------------------|------|-------------------|----------------------|
| POST   | `/stock/movement`               | Yes  | Admin, Warehouse  | Record IN/OUT        |
| GET    | `/stock/movements?page=&limit=&productId=` | Yes | All | Movement log    |

### Challans
| Method | Endpoint                        | Auth | Roles         | Description          |
|--------|---------------------------------|------|---------------|----------------------|
| GET    | `/challans?page=&limit=&status=` | Yes | All          | List with filters    |
| GET    | `/challans/:id`                 | Yes  | All           | Detail with items    |
| POST   | `/challans`                     | Yes  | Admin, Sales  | Create challan       |
| PUT    | `/challans/:id/confirm`         | Yes  | Admin, Sales  | Confirm → stock ↓   |
| PUT    | `/challans/:id/cancel`          | Yes  | Admin         | Cancel challan       |

### Dashboard
| Method | Endpoint                        | Auth | Roles | Description          |
|--------|---------------------------------|------|-------|----------------------|
| GET    | `/dashboard/stats`              | Yes  | All   | Overview statistics  |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": {
    "customers": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]  // Validation errors if applicable
}
```

---

## Deployment Guide

### Frontend Deployment (Vercel)

```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel, Netlify, or any static hosting
```

**Vercel settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_URL=https://your-backend-url.com/api`

### Backend Deployment (Render)

1. Push to GitHub
2. Create a new Web Service on Render
3. Connect your repo, set root directory to `server`
4. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Start Command: `npm run build && npm start`
6. Add environment variables (DATABASE_URL, JWT_SECRET, etc.)

### Database (Neon / Supabase)

1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Copy the connection string
3. Set as `DATABASE_URL` in your backend environment

### AWS Deployment (Bonus)

For AWS deployment:
1. **EC2**: Set up a t2.micro instance with Node.js
2. **RDS**: Create a PostgreSQL RDS instance (free tier)
3. **S3 + CloudFront**: Host the React frontend as a static site
4. Use PM2 or systemd to manage the Node.js process
5. Set up Nginx as reverse proxy for the API

---

## Docker Setup

```bash
# Start all services (DB + Backend + Frontend)
docker-compose up --build

# Start only the database
docker-compose up -d postgres

# Run migrations
docker-compose exec server npx prisma migrate dev --name init

# Seed data
docker-compose exec server npm run prisma:seed
```

---

## Known Limitations

1. **No file uploads** — Product images and document attachments are not implemented
2. **No invoice PDF export** — Challan/Invoice PDF generation is not implemented in this version
3. **No email notifications** — Follow-up reminders and alerts are display-only
4. **No real-time updates** — Dashboard stats require page refresh
5. **No password reset** — Users cannot reset their passwords
6. **No audit log** — Beyond stock movements, general audit logging is not implemented
7. **Single warehouse** — Products have a location field but multi-warehouse logic is not enforced
8. **No unit tests** — API endpoints are tested manually, not with automated tests

---

## Assumptions

1. All users are internal employees — no customer-facing portal
2. GST number is optional (some customers may not have one)
3. Products have a single SKU (no variants)
4. Stock quantities are integers (no fractional units)
5. Challan cancellation by Admin restores stock for confirmed challans
6. All monetary values are in INR (₹)
7. A single admin user is sufficient for initial setup
8. Follow-up dates are optional — users can add notes without scheduling
9. Challan numbers are auto-generated and cannot be customized
