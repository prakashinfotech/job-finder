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

# Core Technology Stack

## Frontend

### Primary Stack

* **React 19**
* **Next.js 15+ (App Router)**
* **TypeScript 5**
* **Tailwind CSS 4**
* **ShadCN/UI**
* **Radix UI**
* **Lucide Icons**
* **Framer Motion**
* **React Hook Form**
* **Zod**
* **TanStack Query (React Query)**
* **Zustand** (lightweight client state)
* **NextAuth.js / Auth.js**
* **Axios / Fetch API**
* **React Dropzone**
* **Draft.js / Tiptap** (rich text editor)

## Backend

### API Layer

* **Next.js Server Actions**
* **Route Handlers (REST APIs)**
* **tRPC (recommended for type-safe APIs)**
* **Node.js runtime**

### Database

* **PostgreSQL 18**
* **Prisma ORM**
* **Prisma Accelerate / Connection Pooling**

### Search Engine

* **Elasticsearch / OpenSearch**

### Queue & Background Jobs

* **BullMQ**
* **Redis**

### Realtime Features

* **Socket.IO** or **Pusher**

### File Storage

* **AWS S3 / Cloudflare R2**
* Resume uploads
* Company logos
* Verification documents

### Payments

* **Stripe**

### Notifications

* **Resend / SendGrid** (email)
* **Twilio** (SMS/WhatsApp)
* **Firebase Cloud Messaging**

### Analytics & Monitoring

* **PostHog**
* **Sentry**
* **Vercel Analytics**
* **Logtail / Datadog**

### DevOps

* **Vercel** (frontend)
* **Railway / AWS ECS / Docker** (backend workers)
* **GitHub Actions CI/CD**
* **Turborepo**

---

# High-Level Architecture

## System Architecture Diagram

```txt
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Web Browser    │  │  Mobile Browser  │  │  Native Mobile   │          │
│  │   (Candidate)    │  │   (Employer)     │  │   (Future)       │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
┌─────────────────────────────────┼─────────────────────────────────────────────┐
│                         EDGE & CDN LAYER                                     │
├─────────────────────────────────┼─────────────────────────────────────────────┤
│                                  │                                             │
│                    ┌─────────────▼─────────────┐                             │
│                    │  Cloudflare CDN / Edge    │                             │
│                    │  Middleware & Caching     │                             │
│                    └─────────────┬─────────────┘                             │
│                                  │                                             │
└──────────────────────────────────┼──────────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────────────────┐
│                       FRONTEND LAYER (Vercel)                                  │
├──────────────────────────────────┼──────────────────────────────────────────────┤
│                                  │                                              │
│         ┌────────────────────────▼────────────────────────┐                   │
│         │     Next.js 15+ Frontend (SSR/CSR/ISR)         │                   │
│         │                                                │                   │
│         │  ┌─────────────────────────────────────────┐  │                   │
│         │  │  Pages & Components                    │  │                   │
│         │  │  - Home & Job Listings                 │  │                   │
│         │  │  - Candidate Profile & Dashboard       │  │                   │
│         │  │  - Employer Onboarding & Dashboard     │  │                   │
│         │  │  - Admin Console                       │  │                   │
│         │  │  - SEO Landing Pages                   │  │                   │
│         │  └─────────────────────────────────────────┘  │                   │
│         │                                                │                   │
│         │  ┌─────────────────────────────────────────┐  │                   │
│         │  │  Client State & Data Fetching           │  │                   │
│         │  │  - Zustand (Global State)              │  │                   │
│         │  │  - React Query (Server State)          │  │                   │
│         │  │  - Server Actions                      │  │                   │
│         │  │  - API Routes (REST & tRPC)            │  │                   │
│         │  └─────────────────────────────────────────┘  │                   │
│         │                                                │                   │
│         │  ┌─────────────────────────────────────────┐  │                   │
│         │  │  UI Components                         │  │                   │
│         │  │  - ShadCN/UI                           │  │                   │
│         │  │  - Radix UI                            │  │                   │
│         │  │  - Tailwind CSS                        │  │                   │
│         │  │  - Framer Motion (Animations)          │  │                   │
│         │  └─────────────────────────────────────────┘  │                   │
│         └────────────────────────┬─────────────────────┘                   │
│                                  │                                          │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────────────┐
│                    API & MIDDLEWARE LAYER                                   │
├──────────────────────────────────┼──────────────────────────────────────────┤
│                                  │                                          │
│         ┌────────────────────────▼─────────────────────┐                  │
│         │    API Gateway & Middleware                 │                  │
│         │                                             │                  │
│         │  ┌──────────────────────────────────────┐  │                  │
│         │  │  Authentication & Authorization      │  │                  │
│         │  │  - NextAuth.js / Auth.js            │  │                  │
│         │  │  - JWT Sessions                     │  │                  │
│         │  │  - RBAC Middleware                  │  │                  │
│         │  └──────────────────────────────────────┘  │                  │
│         │                                             │                  │
│         │  ┌──────────────────────────────────────┐  │                  │
│         │  │  Security & Rate Limiting           │  │                  │
│         │  │  - Helmet.js                        │  │                  │
│         │  │  - Arcjet / Upstash Rate Limit      │  │                  │
│         │  │  - CSRF Protection                  │  │                  │
│         │  │  - DOMPurify (XSS Protection)       │  │                  │
│         │  │  - Zod Validation                   │  │                  │
│         │  └──────────────────────────────────────┘  │                  │
│         │                                             │                  │
│         │  ┌──────────────────────────────────────┐  │                  │
│         │  │  Service Routes                     │  │                  │
│         │  │  - /api/auth/*                      │  │                  │
│         │  │  - /api/jobs/*                      │  │                  │
│         │  │  - /api/applications/*              │  │                  │
│         │  │  - /api/candidate/*                 │  │                  │
│         │  │  - /api/recruiter/*                 │  │                  │
│         │  │  - /api/employer/*                  │  │                  │
│         │  │  - /api/admin/*                     │  │                  │
│         │  └──────────────────────────────────────┘  │                  │
│         │                                             │                  │
│         └────────────┬────────────────────────────────┘                  │
│                      │                                                   │
└──────────────────────┼───────────────────────────────────────────────────┘
                       │
┌──────────────────────┼───────────────────────────────────────────────────┐
│              BUSINESS LOGIC & SERVICE LAYER                              │
├──────────────────────┼───────────────────────────────────────────────────┤
│                      │                                                   │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│   │  Auth        │  │  User        │  │  Job         │  │  Application │ │
│   │  Service     │  │  Service     │  │  Service     │  │  Service     │ │
│   │              │  │              │  │              │  │              │ │
│   │ - Register   │  │ - Profile    │  │ - Posting    │  │ - Submit     │ │
│   │ - Login      │  │ - Resume     │  │ - Drafts     │  │ - Update     │ │
│   │ - OTP        │  │ - Skills     │  │ - Boost      │  │ - Shortlist  │ │
│   │ - OAuth      │  │ - Exp/Edu    │  │ - Search     │  │ - Interview  │ │
│   │ - KYC        │  │ - Settings   │  │ - Analytics  │  │ - Hire       │ │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│   │  Chat        │  │  Notification│  │  Payment     │  │  Recommendation│
│   │  Service     │  │  Service     │  │  Service     │  │  Service       │
│   │              │  │              │  │              │  │                │
│   │ - Messages   │  │ - Email      │  │ - Subscriptions
│   │ - Threads    │  │ - SMS        │  │ - Invoices   │  │ - Job Feed     │
│   │ - Typing     │  │ - Push       │  │ - Webhooks   │  │ - Candidates   │
│   │ - Reactions  │  │ - In-app     │  │ - Refunds    │  │ - Scoring      │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                            │
└────────────────┬───────────────────────┬──────────────────────────────────┘
                 │                       │
┌────────────────┼───────────────────────┼──────────────────────────────────┐
│            DATA & PERSISTENCE LAYER                                       │
├────────────────┼───────────────────────┼──────────────────────────────────┤
│                │                       │                                  │
│     ┌──────────▼─────────┐  ┌─────────▼────────┐  ┌──────────────────┐ │
│     │  PostgreSQL 18     │  │  Redis Cache     │  │  Elasticsearch   │ │
│     │  (Primary DB)      │  │  (Sessions &     │  │  (Search Index)  │ │
│     │                    │  │   Cache Layer)   │  │                  │ │
│     │  ┌────────────────┐│  │                  │  │  ┌──────────────┐ │ │
│     │  │ Users          ││  │  ┌────────────┐  │  │  │ Jobs Index   │ │ │
│     │  │ Profiles       ││  │  │ Sessions   │  │  │  │ Candidates   │ │ │
│     │  │ Companies      ││  │  │ Auth Cache │  │  │  │ Companies    │ │ │
│     │  │ Jobs           ││  │  │ Job Counts │  │  │  │ Skills       │ │ │
│     │  │ Applications   ││  │  │ Messages   │  │  │  └──────────────┘ │ │
│     │  │ Messages       ││  │  │ Sockets    │  │  │                  │ │
│     │  │ Subscriptions  ││  │  └────────────┘  │  └──────────────────┘ │
│     │  │ Notifications  ││  │                  │                       │ │
│     │  │ Audit Logs     ││  │  (Prisma        │  (Search              │ │
│     │  │ Transactions   ││  │   Accelerate)   │   Indexing)           │ │
│     │  └────────────────┘│  │                  │                       │ │
│     └────────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│          ASYNC & REAL-TIME LAYER (Worker Services)                     │
├────────────────────────────────┼────────────────────────────────────────┤
│                                │                                        │
│     ┌──────────────────────────▼────────────────────────┐              │
│     │        BullMQ Queue & Background Jobs             │              │
│     │        (Deployed on Railway / AWS ECS)            │              │
│     │                                                   │              │
│     │  ┌─────────────────────────────────────────────┐ │              │
│     │  │  Job Processors                           │ │              │
│     │  │  - Email sending (Resend/SendGrid)        │ │              │
│     │  │  - SMS/WhatsApp (Twilio)                  │ │              │
│     │  │  - Resume parsing (AI)                    │ │              │
│     │  │  - Interview reminders                    │ │              │
│     │  │  - Analytics aggregation                 │ │              │
│     │  │  - Elasticsearch indexing                │ │              │
│     │  │  - Recommendation computation            │ │              │
│     │  │  - Report generation                     │ │              │
│     │  │  - Cleanup & maintenance                 │ │              │
│     │  │  - Webhook retries                       │ │              │
│     │  └─────────────────────────────────────────────┘ │              │
│     │                                                   │              │
│     └──────────────────────────────────────────────────┘              │
│                                                                        │
│     ┌──────────────────────────────────────────────────┐              │
│     │      Socket.IO / Pusher Real-time Service        │              │
│     │      (WebSocket connections)                     │              │
│     │                                                   │              │
│     │  ┌─────────────────────────────────────────────┐ │              │
│     │  │  Real-time Features                        │ │              │
│     │  │  - Live chat messaging                     │ │              │
│     │  │  - Notification broadcasts                │ │              │
│     │  │  - Application status updates              │ │              │
│     │  │  - Typing indicators                       │ │              │
│     │  │  - Online presence                         │ │              │
│     │  │  - Dashboard updates                       │ │              │
│     │  └─────────────────────────────────────────────┘ │              │
│     │                                                   │              │
│     └──────────────────────────────────────────────────┘              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│           EXTERNAL SERVICES & INTEGRATIONS                              │
├────────────────────────────────┼────────────────────────────────────────┤
│                                │                                        │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐  ┌───────┐│
│  │ AWS S3 / R2   │  │ Stripe Payments│  │ OAuth Providers  │  │Monitoring
│  │ File Storage  │  │ Subscriptions  │  │ - Google OAuth   │  │ - Sentry
│  │               │  │ - Plans        │  │ - LinkedIn OAuth │  │ - PostHog
│  │ - Resumes     │  │ - Webhooks     │  │ - GitHub OAuth   │  │ - DataDog
│  │ - Logos       │  │ - Invoices     │  │                  │  │ - Vercel
│  │ - Docs        │  │ - Coupons      │  └──────────────────┘  │Analytics
│  └───────────────┘  └────────────────┘                         └───────┘
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ AI & ML Services                                                 │ │
│  │ - OpenAI / Claude API (Resume parsing, recommendations)          │ │
│  │ - Pinecone / pgvector (Vector embeddings for matching)           │ │
│  │ - Firebase ML (Future: skill detection)                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT & ORCHESTRATION                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  CI/CD Pipeline (GitHub Actions)                                         │
│  ├─ Lint & Format                                                        │
│  ├─ Type Checking                                                        │
│  ├─ Unit Tests                                                           │
│  ├─ E2E Tests (Playwright)                                               │
│  ├─ Security Scans (Snyk)                                                │
│  └─ Deploy                                                               │
│                                                                            │
│  Frontend: Vercel (Auto-deploy on push)                                 │
│  Backend: Railway / AWS ECS (Docker containers)                         │
│  Infrastructure: Terraform (IaC)                                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Layers Breakdown

### 1. Client Layer
- Web browsers (job seekers, recruiters, admins)
- Mobile browsers (responsive design)
- Future: React Native apps

### 2. Edge & CDN Layer
- Cloudflare CDN for static asset delivery
- Edge middleware for request routing
- Geographic request optimization

### 3. Frontend Layer (Vercel)
- Next.js 15+ with App Router
- Server-side rendering (SSR) for SEO
- Client-side rendering (CSR) for interactivity
- Incremental Static Regeneration (ISR) for job pages
- Built-in caching and deployment

### 4. API & Middleware Layer
- Authentication & authorization
- Security middleware (Helmet, rate limiting, CSRF)
- Validation layer (Zod schemas)
- Business logic routing
- Error handling

### 5. Business Logic & Service Layer
- Modular microservices within monolith
- Each service handles specific domain
- Shared utilities and helpers
- Cross-service communication

### 6. Data & Persistence Layer
- PostgreSQL: Primary transactional database
- Redis: Cache, sessions, real-time data
- Elasticsearch: Full-text search and indexing
- Prisma ORM: Database abstraction

### 7. Async & Real-time Layer
- BullMQ: Background job queue
- Socket.IO/Pusher: WebSocket connections
- Background worker processes
- Asynchronous task processing

### 8. External Services
- AWS S3/Cloudflare R2: File storage
- Stripe: Payment processing
- OAuth providers: Third-party auth
- AI services: Resume parsing, recommendations
- Monitoring & analytics: Sentry, PostHog, DataDog

### 9. Deployment & Orchestration
- GitHub Actions: CI/CD automation
- Vercel: Frontend hosting & deployment
- Railway/AWS ECS: Backend services
- Terraform: Infrastructure as Code

---

# Monorepo Structure

```txt
jobfinder/
│
├── apps/
│   ├── web/                # Next.js frontend
│   ├── admin/              # Admin dashboard
│   ├── worker/             # BullMQ jobs
│
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── config/             # ESLint, TSConfig
│   ├── db/                 # Prisma schema + client
│   ├── auth/               # Auth logic
│   ├── utils/              # Shared utilities
│   ├── validations/        # Zod schemas
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│
├── docs/
│   ├── architecture.md
│
└── turbo.json
```

---

# User Roles

## 1. Job Seeker

* Register/Login
* Create profile
* Upload resume
* Search jobs
* Apply jobs
* Save jobs
* Chat with recruiters
* Track applications
* Skill assessments
* Premium subscription

## 2. Recruiter / Employer

* Company onboarding
* Post jobs
* Manage applicants
* Candidate search
* Messaging
* Subscription billing
* Analytics dashboard

## 3. Admin

* User moderation
* Job approval
* Fraud detection
* Payment oversight
* CMS management
* Reports

---

# Core Modules

## Authentication & Authorization

### Features

* Email OTP login
* Mobile OTP login
* Google OAuth
* LinkedIn OAuth
* Recruiter KYC
* Role-based access control
* JWT + session refresh
* Multi-device sessions

### Packages

* Auth.js
* Prisma adapter
* bcrypt
* jsonwebtoken
* otplib

---

## User Profile System

### Components

* Personal details
* Work experience
* Education
* Skills
* Resume parsing
* Portfolio links
* Video intro
* Certifications

### Resume Parsing

* PDF extraction
* AI skill extraction
* Suggested improvements

### Tools

* pdf-parse
* OpenAI API / Claude API

---

## Job Management System

### Features

* Job creation wizard
* Draft jobs
* Approval workflows
* Job boosting
* Featured jobs
* Geo-targeting
* Salary ranges
* Category tagging
* Application limits
* Urgent hiring badges

### Job Search Filters

* Location
* Remote
* Salary
* Experience
* Job type
* Category
* Skills
* Company
* Freshness

### Search Tech

* PostgreSQL for transactional data
* Elasticsearch for search indexing

---

## Application Tracking System (ATS)

### States

* Applied
* Viewed
* Shortlisted
* Interview Scheduled
* Rejected
* Hired

### Features

* Recruiter notes
* Interview scheduling
* Automated reminders
* Candidate scoring

---

## Messaging System

### Features

* Real-time chat
* Attachments
* Read receipts
* Push notifications
* Spam detection
* Recruiter outreach

### Recommended Stack

* Socket.IO
* Redis pub/sub
* PostgreSQL message history

---

## Application Flow

### Candidate Application Journey

#### Pre-Application Stage

1. **Job Discovery**
   * Browse job listings
   * Apply search filters (location, salary, skills, company)
   * View job details & company info
   * Save job for later

2. **Pre-Application Checks**
   * System validates candidate profile completeness
   * Resume availability check
   * Skill match scoring
   * Eligibility verification

#### Application Submission

3. **Application Creation**
   * Quick apply with resume
   * Optional cover letter
   * Skills confirmation
   * Expected salary (optional)
   * Availability (notice period)
   * Application timestamp recording

4. **Post-Application**
   * Confirmation notification sent to candidate
   * Application added to candidate dashboard
   * Auto-save to "Applied Jobs"
   * Real-time status update

### Employer Application Management

#### Recruiter Workflow

1. **View Applications**
   * Real-time application feed
   * Filter by status (applied, viewed, shortlisted, rejected, hired)
   * Sorting options (newest, best match, experience level)
   * Bulk actions

2. **Candidate Evaluation**
   * View candidate profile
   * Review resume
   * Check skill match score
   * Read cover letter
   * Previous interaction history

3. **Application Actions**
   * **View**: Mark as viewed
   * **Shortlist**: Move to shortlist pool
   * **Message**: Direct messaging with candidate
   * **Schedule Interview**: Calendar integration
   * **Reject**: With optional feedback
   * **Hire**: Mark as hired
   * **Add Notes**: Internal recruiter notes

4. **Candidate Communication**
   * In-app notifications
   * Email notifications
   * SMS updates (premium feature)
   * Interview scheduling links
   * Rejection feedback

### Application States & Transitions

```
Applied → Viewed → {Shortlisted OR Rejected}
  ↓
Shortlisted → Interview Scheduled → {Hired OR Rejected}
  ↓
Interview Rejected → Rejected
```

### ATS Features

1. **Pipeline Management**
   * Kanban board view
   * Drag-and-drop application moves
   * Stage-based filtering
   * Bulk status updates

2. **Automation & Workflows**
   * Auto-rejection for incomplete profiles
   * Skill-based auto-shortlisting
   * Interview reminder emails
   * Offer letter generation

3. **Analytics**
   * Time-to-hire metrics
   * Application sources
   * Conversion funnel
   * Recruiter productivity
   * Drop-off rates

4. **Candidate Scoring**
   * Resume match score (0-100%)
   * Skill alignment
   * Experience level match
   * Salary expectation fit
   * Overall recommendation score

### Data Model

```prisma
model Application {
  id                String      @id @default(cuid())
  jobId             String
  job               Job         @relation(fields: [jobId], references: [id])
  userId            String
  candidate         User        @relation(fields: [userId], references: [id])
  status            ApplicationStatus  @default(APPLIED)
  coverLetter       String?
  expectedSalary    Int?
  noticePeriodDays  Int?
  matchScore        Int?        // 0-100
  recruiterNotes    String?
  appliedAt         DateTime    @default(now())
  viewedAt          DateTime?
  shortlistedAt     DateTime?
  interviewAt       DateTime?
  rejectedAt        DateTime?
  hiredAt           DateTime?
  updatedAt         DateTime    @updatedAt
  
  interviews        Interview[]
  communications    Message[]
}

enum ApplicationStatus {
  APPLIED
  VIEWED
  SHORTLISTED
  INTERVIEW_SCHEDULED
  REJECTED
  HIRED
}

model Interview {
  id                String      @id @default(cuid())
  applicationId     String
  application       Application @relation(fields: [applicationId], references: [id])
  scheduledAt       DateTime
  duration          Int         // minutes
  interviewType     InterviewType
  zoomLink          String?
  feedbackScore     Int?        // 0-10
  recruiterFeedback String?
  candidateRating   Int?        // 0-5
  createdAt         DateTime    @default(now())
}

enum InterviewType {
  PHONE
  VIDEO
  IN_PERSON
  GROUP
}
```

### Application API Endpoints

#### Candidate Endpoints

```
POST   /api/applications              # Submit application
GET    /api/applications              # View my applications
GET    /api/applications/:id          # Application details
PUT    /api/applications/:id          # Withdraw application
GET    /api/applications/stats        # Application statistics
```

#### Recruiter Endpoints

```
GET    /api/recruiter/jobs/:id/applications     # Job applications
PUT    /api/recruiter/applications/:id/status   # Update status
POST   /api/recruiter/applications/:id/notes    # Add notes
POST   /api/recruiter/applications/:id/message  # Send message
GET    /api/recruiter/applications/:id/history  # Interaction history
POST   /api/recruiter/applications/bulk-action  # Bulk operations
```

### Notifications & Triggers

**Candidate Notifications:**
* Application submitted confirmation
* Application viewed by recruiter
* Shortlisted alert
* Interview scheduled
* Interview reminder (24h before)
* Rejection with feedback
* Hired notification

**Recruiter Notifications:**
* New application received
* Bulk application summary (daily/weekly)
* Interview reminders
* Candidate messaging
* Job expiration warnings

### Performance Optimizations

* Indexed queries on (jobId, status, createdAt)
* Cached application counts per job
* Asynchronous notification dispatch
* Search indexing for candidate matching
* Batch processing for bulk operations

---

## Recommendation Engine

### Inputs

* Skills
* Resume
* Search history
* Saved jobs
* Applied jobs
* Recruiter trends
* Application match scores

### Outputs

* Personalized job feed
* Similar jobs
* Upskill suggestions
* Candidate recommendations (for recruiters)

### Future AI Layer

* Embedding-based matching
* Vector DB (Pinecone/pgvector)
* LLM-based job descriptions and cover letter suggestions

---

## Subscription & Monetization

### Job Seekers

* Premium profile boost
* Priority applications
* Resume review
* Certification access

### Employers

* Job posting packages
* Featured listings
* Resume database unlock
* Sponsored campaigns

### Billing

* Stripe subscriptions
* Coupons
* GST invoices
* Payment retries

---

# Database Architecture (Prisma)

## Core Tables

### Users

* id
* role
* name
* email
* phone
* passwordHash
* isVerified
* profileCompletion
* createdAt

### Profiles

* userId
* bio
* location
* resumeUrl
* experienceYears
* salaryExpectation

### Companies

* id
* ownerId
* name
* industry
* logo
* verificationStatus

### Jobs

* id
* companyId
* title
* description
* skills
* salaryMin
* salaryMax
* location
* type
* status
* expiresAt

### Applications

* id
* userId
* jobId
* status
* coverLetter
* createdAt

### Messages

* id
* senderId
* receiverId
* content
* attachmentUrl

### Subscriptions

* id
* userId/companyId
* stripeCustomerId
* plan
* status

### Notifications

* id
* userId
* type
* payload
* readStatus

---

# Suggested Prisma Enhancements

* Soft delete support
* Audit logs
* Activity tracking
* JSON metadata fields
* pgvector support
* Full-text search indexes

---

# API Design

## Public APIs

* /jobs
* /jobs/[slug]
* /companies/[slug]
* /auth/register
* /auth/login

## Protected User APIs

* /profile
* /applications
* /saved-jobs
* /messages

## Recruiter APIs

* /recruiter/jobs
* /recruiter/applicants
* /recruiter/billing

## Admin APIs

* /admin/users
* /admin/jobs
* /admin/reports

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

# SEO Strategy

## Critical for Growth

* SSR job pages
* Dynamic metadata
* Structured schema markup
* XML sitemap
* Canonical URLs
* JobPosting schema
* City/category landing pages
* Pagination indexing

### Pages to Optimize

* /jobs-in-ahmedabad
* /remote-jobs
* /sales-jobs
* /company/google-jobs

---

# Performance Optimization

## Frontend

* Server components
* Partial prerendering
* Image optimization
* Route-based code splitting
* Edge middleware
* CDN caching

## Backend

* Query optimization
* Redis caching
* Search indexing
* Async processing
* Connection pooling

---

# DevOps & Deployment

## Recommended Environments

### Development

* Docker Compose
* PostgreSQL
* Redis
* Mailhog

### Staging

* Vercel Preview
* Railway DB
* Stripe test mode

### Production

* Vercel
* AWS RDS PostgreSQL
* Redis Cloud
* S3/R2
* Cloudflare CDN

---

# CI/CD Pipeline

## GitHub Actions

* Lint
* Type check
* Unit tests
* E2E tests
* Prisma migration checks
* Security scans
* Deploy preview
* Production deployment

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

# Recommended Packages Summary

## Essential

* next
* react
* typescript
* tailwindcss
* prisma
* @prisma/client
* next-auth/auth.js
* zod
* react-hook-form
* @tanstack/react-query
* zustand
* stripe
* bullmq
* redis
* socket.io
* axios
* framer-motion
* shadcn/ui
* lucide-react
* sentry
* posthog

---

# Future Scalability Roadmap

## Phase 2

* Native mobile app (React Native)
* AI resume scoring
* Video interviews
* Referral programs
* Learning marketplace
* Skill tests
* Employer branding pages
* Multi-language support

## Phase 3

* Microservices extraction
* Kubernetes
* Event-driven architecture
* Recommendation ML pipelines
* International expansion

---

# Development Priorities

## MVP

* Auth
* User profiles
* Job posting
* Job applications
* Recruiter dashboard
* Search
* Notifications

## Growth Phase

* Premium plans
* Chat
* AI recommendations
* Resume parsing
* Analytics

## Enterprise Phase

* Advanced ATS
* Multi-region infra
* AI hiring tools

---

# Claude Implementation Prompt Guidance

When giving this project to Claude, instruct it to:

1. Build using strict TypeScript.
2. Use modular architecture.
3. Follow scalable folder conventions.
4. Prioritize security best practices.
5. Use reusable component systems.
6. Implement complete database schema.
7. Add seed scripts.
8. Include CI/CD configs.
9. Generate production-ready code.
10. Focus on performance + SEO.

---

# Final Technical Recommendation

## Best Architectural Pattern

### Hybrid Modular Monolith (Recommended)

Why:

* Faster MVP development
* Easier maintenance
* Lower infrastructure complexity
* Scales well to millions with search + queues
* Easier migration to microservices later

---

# Success Metrics

* Fast page loads (<2s)
* High SEO rankings
* Recruiter retention
* Application conversion rates
* Secure auth system
* Scalable search
* Reliable notifications
* Premium monetization

---

# End Goal

A production-ready, highly scalable Indian job marketplace platform capable of competing with:

* JobFinder.co
* Naukri
* Indeed
* LinkedIn Jobs
* Foundit

with strong SEO, recruiter tools, premium monetization, and future AI capabilities.
