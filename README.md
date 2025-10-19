# Time Tracker

A modern time tracking SaaS application for after-the-fact time reporting. Built with Next.js 15, PostgreSQL, and Better Auth.

## Features

- **Smart Duration Parsing** - Enter time as "2.5h", "2h 30m", "150m", "1:30" with real-time validation
- **Week View** - Visual grid layout to see and manage time entries by week
- **Auto-calculations** - Automatically calculate end time from start + duration, or duration from start + end
- **Client Management** - Full CRUD for clients with company info and default rates
- **Project Management** - Create projects with budgets, rates, and team member assignment
- **Project Teams** - Add team members to projects with individual hourly rates
- **Time Entry Tracking** - Log time entries with project, client, billable status, and descriptions
- **Dashboard Stats** - Real-time stats for today's hours, weekly hours, billable hours, and active projects
- **User Authentication** - Secure email/password authentication with Better Auth
- **Access Control** - Users can only log time to projects they're assigned to as active members

## Quick Start

```bash
# 1. Start PostgreSQL
brew services start postgresql@14

# 2. Create database and user (see detailed instructions below)
psql postgres
CREATE DATABASE timetracker;
CREATE USER timetracker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE timetracker TO timetracker_user;
ALTER USER timetracker_user CREATEDB;
\q

# 3. Grant schema permissions
psql -d timetracker
GRANT ALL ON SCHEMA public TO timetracker_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO timetracker_user;
\q

# 4. Install dependencies and setup
npm install
cp .env.example .env.local
# Edit .env.local with your database password

# 5. Run migrations
npx prisma generate
npx prisma migrate dev --name init

# 6. Start the app
npm run dev
```

Visit http://localhost:3000, create an account, and start tracking time!

## Tech Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Email**: Resend with React Email templates (not yet implemented)
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Deployment**: Firebase App Hosting

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14.x or higher (tested with PostgreSQL 14 and 16)
- npm or yarn

## Local Development Setup

### 1. Install and Start PostgreSQL

#### macOS (via Homebrew)

```bash
# Install PostgreSQL (version 14 or higher)
brew install postgresql@14
# or
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@14
# or
brew services start postgresql@16

# Verify it's running
brew services list
# You should see postgresql@14 (or @16) with status "started"
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

#### Windows

Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql postgres

# In the psql prompt, run these commands:
CREATE DATABASE timetracker;
CREATE USER timetracker_user WITH PASSWORD 'your_secure_password';

# Grant permissions (IMPORTANT: these are required for migrations)
GRANT ALL PRIVILEGES ON DATABASE timetracker TO timetracker_user;
ALTER USER timetracker_user CREATEDB;

# Exit psql
\q
```

**Grant Schema Permissions** (Required for Prisma migrations):

```bash
# Connect to the timetracker database
psql -d timetracker

# Grant schema permissions
GRANT ALL ON SCHEMA public TO timetracker_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timetracker_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timetracker_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO timetracker_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO timetracker_user;

# Exit psql
\q
```

### 3. Clone and Install Dependencies

```bash
# Install dependencies
npm install
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://timetracker_user:your_secure_password@localhost:5432/timetracker"

# Better Auth - Generate a secure random string for production
BETTER_AUTH_SECRET="your-random-secret-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Resend) - Get your API key from resend.com
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

**Generate a secure secret:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 5. Run Database Migrations

**Important:** Make sure you've completed step 2 (database setup with proper permissions) before running migrations.

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create all database tables
npx prisma migrate dev --name init
```

If you encounter permission errors, refer to the [Troubleshooting](#troubleshooting) section below.

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

### 7. Create Your First User

1. Click "Sign up" or navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in your name, email, and password (minimum 8 characters)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

### 8. Start Using the App

**Recommended workflow:**

1. **Create a Client** - Go to `/clients` and add your first client
2. **Create a Project** - Go to `/projects`, create a project, and assign it to a client
3. **Add Yourself to the Project** - Click "Manage Team" on the project, add yourself as a member with your hourly rate
4. **Log Time** - Go to `/entries` and create your first time entry!

The dashboard at `/dashboard` will show your real-time statistics.

## Project Structure

```
time-tracker/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── entries/       # Time entries
│   │   │   ├── projects/      # Project management
│   │   │   ├── clients/       # Client management
│   │   │   ├── reports/       # Reports and analytics
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes
│   │   │   └── auth/[...all]/ # Better Auth API
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── entries/           # Time entry components
│   │   ├── projects/          # Project components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utilities and configurations
│   │   ├── auth/              # Auth configuration
│   │   ├── db/                # Database client
│   │   ├── email/             # Email templates
│   │   └── actions/           # Server actions
│   └── middleware.ts          # Route protection middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── public/                    # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations in development
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without migrations (dev only)
- `npx prisma db seed` - Run seed script

## Authentication

The app uses Better Auth for authentication with the following features:

- **Email/password authentication** - Secure signup and login
- **Session management** - HttpOnly cookies for security
- **Password validation** - Minimum 8 characters required
- **Auto-redirect** - Authenticated users redirected to dashboard, unauthenticated to login
- **Protected routes** - Middleware ensures only authenticated users access the app
- **Role support** - Admin and member roles (extensible for future features)

### User Management

**Creating the First User:**
1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in your name, email, and password
3. Click "Create Account"

**Making a User Admin:**
```sql
psql -d timetracker
UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
\q
```

## Features Overview

### Client Management (`/clients`)
- Create, edit, and delete clients
- Track company information and contact email
- Set default hourly rates per client
- View project and time entry counts for each client
- Fully responsive table interface

### Project Management (`/projects`)
- Create projects with client assignment
- Set project budgets (in hours) and hourly rates
- Choose custom color for each project
- Track project status (active, archived, completed)
- **Team Management:**
  - Add multiple team members to each project
  - Set individual hourly rates per member
  - Toggle member active/inactive status
  - Only active members can log time to the project

### Time Entry Tracking (`/entries`)
- **Week View**: Visual grid showing time entries by day
- **List View**: Traditional list view grouped by date
- **Smart Duration Input:**
  - "2.5h" or "2.5" → 2 hours 30 minutes
  - "2h 30m" → 2 hours 30 minutes
  - "150m" → 2 hours 30 minutes
  - "1:30" → 1 hour 30 minutes
- **Auto-calculations:**
  - Enter start time + duration → end time calculated
  - Enter start time + end time → duration calculated
- **Project filtering:** Only shows projects where you're an active member
- Mark entries as billable/non-billable
- Add descriptions to track what you worked on
- Edit and delete entries inline
- Daily and weekly totals automatically calculated

### Dashboard (`/dashboard`)
Real-time statistics:
- Today's total hours
- This week's total hours
- This week's billable hours
- Active projects count

### Access Control
- Users must be added as active members to projects before logging time
- Project owners control team membership
- Each user has their own isolated data
- Secure server-side validation for all operations

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Session** - User sessions
- **Account** - OAuth accounts (future)
- **Verification** - Email verification tokens
- **TimeEntry** - Time entries logged by users
- **Project** - Projects with budgets, rates, and team members
- **ProjectMember** - Join table for project team members with individual hourly rates
- **Client** - Clients associated with projects

## Deployment

### Firebase App Hosting

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project:

```bash
firebase init hosting
```

4. Deploy:

```bash
firebase deploy
```

### Environment Variables in Production

Make sure to set all environment variables in your hosting platform:

- `DATABASE_URL` - Production PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secure random string (32+ characters)
- `BETTER_AUTH_URL` - Your production URL
- `NEXT_PUBLIC_APP_URL` - Your production URL
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM_EMAIL` - Verified sender email

## Development Guidelines

### Code Style

- Use Server Components by default, Client Components only when needed
- Implement Server Actions for mutations (no API routes for CRUD)
- Use react-hook-form with Zod validation for forms
- Keep components small and focused
- Implement proper TypeScript types (no `any`)
- Use Tailwind for styling (no CSS files)
- Follow Next.js 15 best practices with App Router

### Duration Input Formats

The application accepts multiple duration formats:

- `2.5` or `2.5h` → 150 minutes
- `2h 30m` or `2h30m` → 150 minutes
- `90m` or `90 min` → 90 minutes
- `1:30` → 90 minutes
- `150` → 150 minutes (default unit)

## Troubleshooting

### PostgreSQL Not Running

**Error:** `connection to server on socket "/tmp/.s.PGSQL.5432" failed`

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list  # macOS
# or
systemctl status postgresql  # Linux

# If not running, start it
brew services start postgresql@14  # macOS
# or
sudo systemctl start postgresql  # Linux
```

### Wrong Port in DATABASE_URL

**Error:** `Can't reach database server at localhost:51214`

**Solution:** Delete the `.env` file (not `.env.local`) if it exists:
```bash
rm .env
```

The `.env` file was created by `npx prisma init` with default values. Use `.env.local` instead.

### Permission Denied to Create Database

**Error:** `ERROR: permission denied to create database`

**Solution:** Grant CREATEDB permission to the user:
```bash
psql postgres
ALTER USER timetracker_user CREATEDB;
\q
```

### Permission Denied for Schema Public

**Error:** `ERROR: permission denied for schema public`

**Solution:** Grant schema permissions:
```bash
psql -d timetracker

GRANT ALL ON SCHEMA public TO timetracker_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timetracker_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timetracker_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO timetracker_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO timetracker_user;

\q
```

### Database Connection Issues

If you can't connect to the database:

1. Ensure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
2. Check your DATABASE_URL in `.env.local`
3. Verify the database and user exist in PostgreSQL
4. Test connection: `psql "postgresql://timetracker_user:your_password@localhost:5432/timetracker"`

### Prisma Client Issues

If you get Prisma Client errors:

```bash
npx prisma generate
```

### Build Errors

Clear Next.js cache:

```bash
rm -rf .next
npm run build
```

### Can't Log Time to a Project

**Error:** "You must be an active member of this project to log time to it"

**Solution:** You need to add yourself as a team member to the project:
1. Go to `/projects`
2. Click the menu (three dots) on the project
3. Click "Manage Team"
4. Add yourself as a member with your hourly rate
5. Make sure "Active" is checked
6. Now you can log time to this project!

## Current Implementation Status

### ✅ Implemented
- **Authentication** - Full signup, login, session management
- **Client Management** - Complete CRUD with counts
- **Project Management** - Complete CRUD with team member assignment
- **Project Teams** - Add/remove members, set individual rates, active/inactive status
- **Time Entry Tracking** - Week view and list view with smart duration parsing
- **Dashboard Statistics** - Real-time stats display
- **Access Control** - Project membership validation
- **Smart Duration Parser** - Multiple input formats with auto-calculation
- **Responsive UI** - Works on desktop and mobile

### 🚧 Planned Features (from SPEC.md)
- **Reports & Analytics** - Time summaries, revenue calculations, client invoices
- **CSV Export** - Export time entries and reports
- **Email Notifications** - Password reset, verification (Resend integration)
- **Bulk Operations** - Mark multiple entries as billed, copy weeks
- **Quick Entry Component** - Natural language input for power users
- **Budget Tracking** - Visual budget progress per project
- **Invoice Generation** - Create client-ready invoices with rate breakdowns

## Development Roadmap

See [SPEC.md](SPEC.md) for the complete feature specification and implementation details.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
