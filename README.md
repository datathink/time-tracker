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

## Licensing

This project is owned by DataThink.
