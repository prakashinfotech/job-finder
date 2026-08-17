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

## Clone the Repository

```bash
git clone https://github.com/your-org/jobfinder.git
cd jobfinder
```

---

## Set Up the Database

### 1. Create PostgreSQL Database

```bash
# Using PostgreSQL CLI
createdb jobfinder
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobfinder"

```

### 3. Run Prisma Migrations

```bash
pnpm install
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

---

## Set Up the Backend

The backend runs as part of the Next.js application using Route Handlers and Server Actions.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build Configuration

Ensure `next.config.ts` is configured for API routes:

```typescript
const nextConfig = {
  typescript: {
    strictNullChecks: true,
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
```

### 3. Set Up Workers (Optional)

For background job processing:

```bash
cd apps/worker
pnpm install
pnpm run dev
```

---

## Run the Backend

```bash
# Development mode
pnpm run dev

# Production build
pnpm run build
pnpm run start
```

The API will be available at `http://localhost:3000/api`.

API documentation (Swagger) will be available at `http://localhost:3000/api/docs` (if configured).

---

## Set Up the Frontend

The frontend is built with Next.js and runs on the same port as the backend during development.

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Ensure `.env.local` is set up (same as database setup):

```bash
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Run Development Server

```bash
pnpm run dev
```

The application will start at `http://localhost:3000`.

### 4. Build for Production

```bash
pnpm run build
pnpm run start
```

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