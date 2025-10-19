# Create a MyHours Time Tracking SaaS Replacement - Initial Setup

## Project Overview

I need to create a time tracking SaaS application for after-the-fact time reporting (no clock in/clock out). Users will log their time entries after completing work, with duration as the primary field. This will be used internally initially but needs to be architected for future commercialization.

## Tech Stack (Decided)

-   **Framework**: Next.js 15 with App Router and Server Components
-   **Database**: PostgreSQL (Local Installation) with Prisma ORM
-   **Authentication**: Better Auth (simple mode, no organizations needed)
-   **Styling**: Tailwind CSS with shadcn/ui components
-   **Email**: Resend with React Email templates
-   **Deployment**: Firebase App Hosting
-   **Architecture**: Single-tenant initially (can add multi-tenancy later)

## Initial Project Setup Requirements

### 1. Create Next.js Project Structure

```
time-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── entries/
│   │   ├── projects/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── auth/
│   ├── entries/
│   └── ui/ (shadcn components)
├── lib/
│   ├── auth/
│   ├── db/
│   └── email/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── middleware.ts
```

### 2. Database Schema

Create a Prisma schema with these core models:

```prisma
// Base tables for Better Auth (will be auto-generated)
// User, Session, Account, Verification

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  role          String    @default("member") // admin, member

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  timeEntries   TimeEntry[]
  projects      Project[]
}

model TimeEntry {
  id           String    @id @default(uuid())
  userId       String
  projectId    String?
  clientId     String?
  date         DateTime  @db.Date // The day this entry is for
  duration     Int       // Required: duration in minutes
  startTime    String?   // Optional: "09:00" format
  endTime      String?   // Optional: "17:30" format
  description  String?
  billable     Boolean   @default(false)
  billed       Boolean   @default(false) // Has been included in an invoice

  // Relations
  user         User      @relation(fields: [userId], references: [id])
  project      Project?  @relation(fields: [projectId], references: [id])
  client       Client?   @relation(fields: [clientId], references: [id])

  // Audit fields
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId, date])
  @@index([projectId, date])
  @@index([clientId, date])
  @@unique([userId, date, startTime]) // Prevent overlapping entries if times are provided
}

model Project {
  id           String    @id @default(uuid())
  name         String
  clientId     String?
  description  String?
  budgetHours  Float?    // Optional budget in hours
  hourlyRate   Decimal?  @db.Decimal(10, 2)
  status       String    @default("active") // active, archived, completed
  color        String    @default("#6366f1") // For UI display
  userId       String    // Project owner

  // Relations
  client       Client?   @relation(fields: [clientId], references: [id])
  user         User      @relation(fields: [userId], references: [id])
  timeEntries  TimeEntry[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId, status])
  @@index([clientId])
}

model Client {
  id           String    @id @default(uuid())
  name         String
  email        String?
  company      String?
  hourlyRate   Decimal?  @db.Decimal(10, 2) // Default rate for this client

  // Relations
  projects     Project[]
  timeEntries  TimeEntry[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

### 3. Authentication Setup with Better Auth

Implement Better Auth with simple configuration:

-   Email/password authentication
-   Session management with httpOnly cookies
-   Email verification
-   Password reset flow
-   Basic roles: admin, member

### 4. Core Features to Implement

#### Time Entry Form (`components/entries/TimeEntryForm.tsx`)

-   **Date picker** (defaults to today)
-   **Duration input** (required) - can enter as:
    -   Hours and minutes (e.g., "2h 30m")
    -   Decimal hours (e.g., "2.5")
    -   Total minutes (e.g., "150")
-   **Time inputs** (optional):
    -   Start time (HH:MM format)
    -   End time (HH:MM format)
    -   Auto-calculate duration if both times provided
    -   Auto-calculate end time if start + duration provided
-   **Project selector** (only shows projects where user is active member)
-   **Description** textarea
-   **Billable** toggle
-   Form validation:
    -   No negative duration
    -   End > start if both provided
    -   User must be active on selected project

#### Time Entry List (`components/entries/TimeEntryList.tsx`)

-   Default view: Current week grouped by day
-   Display format: Date | Project | Description | Duration | Actions
-   Inline editing capability
-   Batch operations (mark billable, delete)
-   Filters:
    -   Date range picker
    -   Project filter (from user's active projects)
    -   Billable/Non-billable
    -   Billed/Not billed
-   Daily and weekly totals with calculated revenue
-   Export to CSV

#### Quick Entry Component (`components/entries/QuickEntry.tsx`)

-   Single-line entry for power users
-   Natural language input: "2.5h ProjectName description of work"
-   Keyboard shortcuts for common projects
-   Auto-save on Enter
-   Parse variations like "2h30m", "2:30", "150m"

#### Weekly View (`components/entries/WeeklyView.tsx`)

-   Grid view with days as columns
-   Projects as rows (only shows projects user is assigned to)
-   Click to add/edit entry in cell
-   Drag to copy entries
-   Weekly totals by project
-   Visual indication of days with 8+ hours

#### Project Management (`components/projects/ProjectForm.tsx`)

-   Create/edit project details
-   Add/remove project members with:
    -   Individual pay rates per user
    -   Active/inactive status toggle
    -   Role assignment (owner, manager, member)
-   Budget tracking against sum of (user hours × user rate)
-   Only show projects where user is an active member

### 5. Reports Dashboard (`app/(dashboard)/reports/page.tsx`)

-   Weekly/Monthly/Custom date range
-   Total hours and billable hours
-   Hours by project with individual rates calculated
-   Revenue calculation: Sum of (user hours × user rate) per project
-   Client invoice preview showing:
    -   Hours per user on project
    -   Individual rates
    -   Total billable amount
-   Unbilled time report with revenue projections
-   Export functionality (CSV, PDF)
-   Simple charts using Recharts

### 6. Server Actions for CRUD Operations

Create type-safe server actions for:

-   Creating time entries (validate user is active on project)
-   Updating time entries
-   Deleting time entries (soft delete pattern)
-   Managing project members:
    -   Adding users to projects with pay rates
    -   Updating user rates on projects
    -   Activating/deactivating project members
-   Fetching user's active projects only
-   Calculating project totals with individual rates
-   Generating invoice data with rate breakdowns
-   Bulk operations (mark as billed, copy week)
-   Exporting data with calculated revenues

### 7. Local PostgreSQL Setup

#### Installation

Install PostgreSQL on your local machine:

**macOS (via Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

#### Database Creation

```bash
# Login as postgres user
psql postgres

# Create database and user
CREATE DATABASE timetracker;
CREATE USER timetracker_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE timetracker TO timetracker_user;

# Exit psql
\q
```

#### Environment Variables

```env
# .env.local
DATABASE_URL="postgresql://timetracker_user:your_secure_password@localhost:5432/timetracker"
BETTER_AUTH_SECRET="generate-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_development_key"
```

### 8. Firebase Setup Files

```json
// firebase.json
{
    "hosting": {
        "source": ".",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "frameworksBackend": {
            "region": "us-central1"
        }
    }
}
```

### 9. Package.json Dependencies

Install these packages:

```json
{
    "dependencies": {
        "next": "15.x",
        "react": "^19.0.0",
        "react-dom": "^19.0.0",
        "@prisma/client": "latest",
        "better-auth": "latest",
        "resend": "latest",
        "@react-email/components": "latest",
        "tailwindcss": "latest",
        "@radix-ui/react-*": "latest (for shadcn)",
        "recharts": "latest",
        "date-fns": "latest",
        "lucide-react": "latest",
        "zod": "latest",
        "react-hook-form": "latest",
        "@tanstack/react-query": "latest"
    },
    "devDependencies": {
        "prisma": "latest",
        "@types/node": "latest",
        "@types/react": "latest",
        "typescript": "latest"
    }
}
```

## Implementation Instructions

1. **Setup local PostgreSQL**: Install PostgreSQL locally, create the database and user, then configure the DATABASE_URL in .env.local.

2. **Start with authentication**: Get Better Auth working with basic email/password authentication. Users should be able to sign up, verify email, and log in.

3. **Create time entry form**: Focus on the duration input with smart parsing (2.5h, 2h 30m, 150m). Optional time fields should auto-calculate. Validate user is active on selected project.

4. **Build entry list**: Display entries grouped by day with inline editing. Only show projects where user is an active member.

5. **Add projects with team management**:

    - Allow project creation with client assignment
    - Add team members with individual pay rates
    - Implement project access control through ProjectMember table
    - Users only see/enter time for projects they're assigned to

6. **Create reports with accurate billing**:

    - Calculate revenue using individual user rates
    - Show breakdown of hours × rate per user
    - Generate client-ready invoice summaries

7. **Add export functionality**: CSV export with calculated amounts for integration with invoicing tools.

## Code Style Preferences

-   Use Server Components by default, Client Components only when needed
-   Implement Server Actions for mutations (no API routes for CRUD)
-   Use react-hook-form with Zod validation for forms
-   Keep components small and focused
-   Implement proper TypeScript types (no `any`)
-   Use Tailwind for styling (no CSS files)
-   Follow Next.js 15 best practices with App Router
-   Use date-fns for date manipulation

## Input Handling Examples

The duration field should accept multiple formats:

-   "2.5" or "2.5h" → 150 minutes
-   "2h 30m" or "2h30m" → 150 minutes
-   "90m" or "90 min" → 90 minutes
-   "1:30" → 90 minutes
-   "150" → 150 minutes (if no unit, assume minutes)

If start and end times provided:

-   Start: "09:00", End: "11:30" → Duration: 150 minutes
-   Start: "09:00", Duration: "2h" → End: "11:00" (calculated)

## Initial Deliverables

Create a working application with:

1. User authentication (sign up, login, password reset)
2. Time entry creation with smart duration parsing
3. Time entry list with filtering and inline editing (filtered by user's projects)
4. Project management with team member assignment and individual rates
5. Client management
6. Reports with accurate billing calculations based on individual rates
7. Client invoice preview with user/rate breakdown
8. CSV export functionality with calculated revenues
9. Local PostgreSQL setup instructions in README
10. Firebase deployment configuration
11. README with complete setup instructions including PostgreSQL installation

## Important Architecture Decisions

-   **DO** use Firebase App Hosting for simple deployment
-   **DO** use local PostgreSQL for development
-   **DO** focus on after-the-fact time entry (no timers)
-   **DO** make duration the primary field
-   **DO** implement smart parsing for duration input
-   **DO** enforce project access through ProjectMember table
-   **DO** calculate billing using individual user rates per project
-   **DO NOT** allow time entry on projects where user is not active member
-   **DO NOT** implement real-time features initially
-   **DO NOT** add multi-tenancy in v1 (can add later)
-   **DO NOT** implement payments initially
-   **DO** use optimistic updates for better UX
-   **DO** implement proper error boundaries and loading states

## Key Business Logic

-   **Project Access**: Users can only see and log time to projects where they are active members
-   **Individual Rates**: Each user has their own pay rate per project (stored in ProjectMember)
-   **Client Billing**: Total = Sum of (each user's hours × their rate) for all users on project
-   **Budget Tracking**: Compare project budget against total calculated cost
-   **Team Management**: Project owners/managers can add/remove members and set rates

Generate the initial boilerplate code with a focus on getting a working time entry system with smart duration parsing as quickly as possible. The user experience should be optimized for quick entry of time after work is completed, not real-time tracking.
