# JobFinder Job Portal – Detailed System Architecture

## Project Overview

Build a scalable, production-grade job finding portal:

* **Job seeker platform**
* **Employer / recruiter dashboard**
* **Admin management system**
* **Real-time chat & notifications**
* **Resume builder & profile management**
* **Job recommendations engine**
* **Application tracking system (ATS)**
* **Subscription / premium plans**
* **SEO-optimized public job pages**
* **Mobile-first responsive UI**

---

# 🏗️ Architecture & Application Flow

```mermaid
flowchart LR
User["Job Seeker / Employer / Admin"] --> Web["Next.js Web App"]
subgraph Frontend["Frontend Layer"]
Web --> Pages["App Router Pages"]
Pages --> Store["Zustand State"]
Pages --> Client["API Client"]
Pages --> UI["ShadCN/UI Components"]
end
Client -->|"HTTPS + JSON"| Routes
subgraph Backend["Next.js API Routes"]
Routes["Route Handlers"] --> Services["Business Services"]
Services --> Prisma["Prisma ORM"]
Auth["Auth.js Middleware"] -.-> Routes
end
Prisma --> Database[("PostgreSQL")]
Services -.->|"Queue Jobs"| Queue["BullMQ + Redis"]
Services -.->|"Real-time"| Socket["Socket.IO"]
Services -.->|"Search"| Search["Elasticsearch"]
User -->|"Browse Jobs"| Pages
User -->|"Apply / Post"| Routes
Routes -->|"Job Data"| Web
```

### Typical User Journey

1. **Job Seeker**: Searches jobs → Views details → Applies → Tracks applications → Receives notifications
2. **Employer**: Registers → Posts jobs → Views applicants → Manages dashboard → Accesses analytics
3. **Admin**: Reviews platform data → Manages users → Monitors analytics → Controls premiums

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| **UI Components** | ShadCN/UI, Radix UI, Lucide Icons |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form, Zod |
| **Data Fetching** | TanStack Query, Axios |
| **Backend** | Next.js Route Handlers, Server Actions |
| **ORM** | Prisma |
| **Database** | PostgreSQL 18 |
| **Authentication** | Auth.js (NextAuth.js) |
| **Search** | Elasticsearch / OpenSearch |
| **Real-time** | Socket.IO or Pusher |
| **Job Queue** | BullMQ + Redis |
| **File Storage** | AWS S3 / Cloudflare R2 |
| **Payments** | Stripe |
| **Email** | Resend / SendGrid |
| **SMS** | Twilio |
| **Monitoring** | Sentry, PostHog |
| **DevOps** | Vercel, Docker, GitHub Actions |

---

# 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v20+ | [nodejs.org](https://nodejs.org/) |
| **npm** or **pnpm** | Latest | Included with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | 18+ | [postgresql.org](https://www.postgresql.org/) |

### Optional Service Accounts

| Service | When It Is Needed |
|---|---|
| **Stripe Account** | For payment processing |
| **AWS S3 / R2** | For file uploads (resumes, logos) |
| **Vercel** | For frontend deployment |
| **SendGrid / Resend** | For email notifications |
| **Twilio** | For SMS/WhatsApp notifications |

---

# 🚀 Getting Started

## Prerequisites

- Node.js (v20+)
- pnpm
- PostgreSQL 18+ (running locally)
- Git

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/jobfinder.git
cd jobfinder
```

## Step 2: Install Dependencies

Install dependencies for the entire monorepo:

```bash
pnpm install
```

## Step 3: Create the Database

Create a PostgreSQL database for the project:

```bash
createdb jobfinder
```

Or using psql:

```bash
psql -U postgres -c "CREATE DATABASE jobfinder;"
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/jobfinder"

# Frontend Apps
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Authentication (NextAuth/Auth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Optional: Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Optional: AWS S3 / File Storage
AWS_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"

# Optional: Email Service
RESEND_API_KEY="your-resend-key"

# Optional: Redis (for queues)
REDIS_URL="redis://localhost:6379"
```

## Step 5: Run Database Migrations and Seed

Initialize the database schema and seed with sample data:

```bash
pnpm prisma migrate dev --skip-generate
pnpm prisma db seed
```

If you haven't generated the Prisma client yet, run:

```bash
pnpm prisma generate --schema ./prisma/schema.prisma
```

## Step 6: Start All Services

Start the development server from the root directory. This will run all apps in the monorepo:

```bash
pnpm run dev
```

This command starts:
- **Frontend (Web)** on port 3000
- **Admin Dashboard** on port 3001
- **API** on port 3000 (same as web, under `/api` route)
- **Worker** on a separate process (for background jobs)

---

## Services & URLs

Once `pnpm run dev` is running, access the services at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend (Web)** | http://localhost:3000 | Job seeker & employer portal |
| **Admin Dashboard** | http://localhost:3001 | Admin management panel |
| **API (REST)** | http://localhost:3000/api | Backend API endpoints |

---

### Frontend URLs

**Web Application** (http://localhost:3000):

| Page | URL | Role |
|------|-----|------|
| Home | http://localhost:3000 | All users |
| Job Search | http://localhost:3000/jobs/search | Job seekers |
| Freshers Jobs | http://localhost:3000/jobs/freshers-jobs | Job seekers |
| Full-time Jobs | http://localhost:3000/jobs/full-time-jobs | Job seekers |
| Part-time Jobs | http://localhost:3000/jobs/part-time-jobs | Job seekers |
| Work from Home | http://localhost:3000/jobs/work-from-home-jobs | Job seekers |
| Jobs for Women | http://localhost:3000/jobs/jobs-for-women | Job seekers |
| Job Detail | http://localhost:3000/job/[city] | All users |
| Sign In | http://localhost:3000/signin | All users |
| Employer Portal | http://localhost:3000/employer | Employers |
| Employer Sign In | http://localhost:3000/employer/signin | Employers |
| Employer Onboarding | http://localhost:3000/employer/onboarding | New employers |
| Employer Dashboard | http://localhost:3000/employer/dashboard | Authenticated employers |
| Post New Job | http://localhost:3000/employer/jobs/new | Authenticated employers |
| Contact Us | http://localhost:3000/contact-us | All users |

**Admin Dashboard** (http://localhost:3001):

| Page | URL | Role |
|------|-----|------|
| Dashboard | http://localhost:3001/dashboard | Admins only |
| User Management | http://localhost:3001/users | Admins only |
| Job Moderation | http://localhost:3001/jobs | Admins only |

---

### API Endpoints

**Base URL**: http://localhost:3000/api

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Auth** | /api/auth/register | POST | Register new user |
| | /api/auth/login | POST | User login |
| | /api/auth/logout | POST | User logout |
| **Jobs** | /api/jobs | GET | List all jobs |
| | /api/jobs/[id] | GET | Get job details |
| | /api/jobs | POST | Create job (employer) |
| | /api/jobs/[id] | PUT | Update job (employer) |
| | /api/jobs/[id] | DELETE | Delete job (employer) |
| **Applications** | /api/applications | GET | Get user applications |
| | /api/applications | POST | Submit application |
| | /api/applications/[id] | GET | Get application details |
| **Candidate** | /api/candidate/resume | POST | Upload resume |
| | /api/candidate/profile | GET | Get candidate profile |
| | /api/candidate/profile | PUT | Update candidate profile |
| **Employer** | /api/employer/dashboard | GET | Employer dashboard data |
| | /api/employer/applications | GET | Employer's applications |
| | /api/employer/candidates | GET | Employer's candidates |
| | /api/employer/analytics | GET | Employer analytics |

---

## Step 7 (Optional): Start Services Separately

If you need to run services individually:

### Start only the Web App

```bash
cd apps/web
pnpm install
pnpm run dev
```

Web runs on: http://localhost:3000

### Start only the Admin Dashboard

```bash
cd apps/admin
pnpm install
pnpm run dev
```

Admin runs on: http://localhost:3001

### Start only the Background Worker

```bash
cd apps/worker
pnpm install
pnpm run dev
```

Worker processes background jobs (email, resume processing, etc.)

---

## Step 8: Build for Production

### Build All Apps

```bash
pnpm run build
```

### Start Production Server

```bash
pnpm run start
```

---

## Docker Setup (Optional)

Build and run the application in Docker:

```bash
docker-compose up -d
```

Services will be available at:
- Frontend: http://localhost:3000
- Admin: http://localhost:3001
- API: http://localhost:3000/api

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Runtime Error: "@prisma/client did not initialize yet"** | Run `pnpm prisma generate --schema ./prisma/schema.prisma` from root, then restart dev server |
| **Port 3000 already in use** | PowerShell: `Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process -Force` |
| **Port 3001 already in use** | PowerShell: `Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess \| Stop-Process -Force` |
| **Database connection error** | Verify PostgreSQL is running and `DATABASE_URL` in `.env` is correct. Test: `psql -U postgres -d jobfinder_clone` |
| **pnpm install fails** | Clear cache: `pnpm store prune` then retry: `pnpm install` |
| **Prisma migration error** | Run `pnpm prisma migrate dev --skip-generate` or `pnpm prisma db push` |
| **Module not found errors** | Run `pnpm install` from root and ensure workspace is linked: `pnpm run build` |
| **@jobfinder/db import error** | Generate Prisma client: `pnpm prisma generate --schema ./prisma/schema.prisma` |
| **Build fails with TypeScript errors** | Ensure `@types/node` is installed: `pnpm add -w -D @types/node` |
| **Next.js 404 on API endpoints** | Ensure `.next` folder is deleted and run `pnpm run dev` again |

---

# 📁 Project Structure

```txt
jobfinder/
│
├── apps/
│   ├── web/                           # Next.js full-stack app
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   │   ├── api/               # Route handlers
│   │   │   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   │   ├── jobs/          # Job endpoints
│   │   │   │   │   ├── applications/  # Application endpoints
│   │   │   │   │   ├── candidate/     # Candidate endpoints
│   │   │   │   │   └── employer/      # Employer endpoints
│   │   │   │   ├── (candidate)/       # Candidate pages
│   │   │   │   ├── (employer)/        # Employer pages
│   │   │   │   ├── admin/             # Admin pages
│   │   │   │   ├── job/[id]/          # Job detail page
│   │   │   │   └── page.tsx           # Home page
│   │   │   ├── components/            # Reusable React components
│   │   │   │   ├── auth/              # Auth components
│   │   │   │   ├── job-posting/       # Job posting form
│   │   │   │   ├── job-search/        # Search filters
│   │   │   │   ├── dashboard/         # Dashboard components
│   │   │   │   └── ui/                # ShadCN/UI base components
│   │   │   ├── lib/                   # Utilities & helpers
│   │   │   │   ├── api.ts             # API client
│   │   │   │   ├── stores/            # Zustand stores
│   │   │   │   ├── types.ts           # TypeScript interfaces
│   │   │   │   └── utils.ts           # Helper functions
│   │   │   └── public/                # Static assets
│   │   └── next.config.ts
│   │
│   ├── admin/                         # Admin dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── dashboard/         # Admin dashboard
│   │   │   │   ├── users/             # User management
│   │   │   │   └── jobs/              # Job moderation
│   │   │   └── components/
│   │   └── next.config.ts
│   │
│   └── worker/                        # BullMQ job workers
│       ├── src/
│       │   ├── jobs/                  # Job definitions
│       │   │   ├── email-notification.ts
│       │   │   ├── resume-processing.ts
│       │   │   └── job-recommendations.ts
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── ui/                            # Shared UI components library
│   │   ├── components/
│   │   └── package.json
│   │
│   ├── config/                        # Shared config
│   │   ├── eslint-config/
│   │   ├── tsconfig/
│   │   └── package.json
│   │
│   ├── db/                            # Prisma schema & client
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── package.json
│   │
│   ├── auth/                          # Auth utilities
│   │   ├── src/
│   │   │   ├── auth-config.ts
│   │   │   └── providers/
│   │   └── package.json
│   │
│   ├── utils/                         # Shared utilities
│   │   ├── src/
│   │   └── package.json
│   │
│   └── validations/                   # Zod schemas
│       ├── src/
│       │   ├── job.ts
│       │   ├── user.ts
│       │   └── application.ts
│       └── package.json
│
├── prisma/
│   ├── schema.prisma                  # Database schema
│   └── migrations/                    # Migration history
│
├── .github/
│   └── workflows/                     # CI/CD pipelines
│       ├── lint.yml
│       ├── test.yml
│       └── deploy.yml
│
├── docs/
│   ├── README.md                      # This file
│   ├── architecture.md
│   └── api.md
│
├── turbo.json                         # Turborepo config
├── pnpm-workspace.yaml                # Workspace config
└── .env.example                       # Example env vars
```

---

# 📚 Key Directories Explained

| Directory | Purpose |
|---|---|
| `apps/web` | Main Next.js application (frontend + API) |
| `apps/admin` | Separate Next.js app for admin panel |
| `apps/worker` | Background job processing (BullMQ) |
| `packages/db` | Prisma schema & migrations |
| `packages/auth` | Auth.js configuration & providers |
| `packages/ui` | Shared UI component library |
| `packages/validations` | Zod validation schemas |
| `packages/utils` | Shared TypeScript utilities |

---

# Security Architecture

## Must-Have Security

* CSRF protection
* Rate limiting
* DDoS protection
* Helmet
* Secure headers
* File validation
* SQL injection prevention (Prisma)
* XSS sanitization
* CAPTCHA
* OTP throttling
* Device fingerprinting
* Audit logs

### Packages

* Arcjet / Upstash Rate Limit
* DOMPurify
* Zod validation
* Sentry

---

# Testing Strategy

## Unit Testing

* Vitest
* Jest

## Integration Testing

* Prisma test DB
* API tests

## E2E Testing

* Playwright

## Performance

* Lighthouse
* k6 load testing

---
