# Time Tracker

A modern time tracking SaaS application for after-the-fact time reporting. Built with Next.js 15, PostgreSQL, and Better Auth.

## Features

- **After-the-fact time entry** - Log time after work is completed, no clock in/out
- **Smart duration parsing** - Enter time as "2.5h", "2h 30m", "150m", etc.
- **Project management** - Create projects and assign team members with individual rates
- **Client management** - Track clients and associate projects with them
- **Billable tracking** - Mark entries as billable and track billing status
- **Reports & analytics** - View time summaries and generate reports
- **User authentication** - Secure email/password authentication with Better Auth
- **Role-based access** - Admin and member roles for user management

## Tech Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Email**: Resend with React Email templates
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Firebase App Hosting

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16.x or higher
- npm or yarn

## Local Development Setup

### 1. Install PostgreSQL

#### macOS (via Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows

Download and install from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Login as postgres user
psql postgres

# In psql, create database and user
CREATE DATABASE timetracker;
CREATE USER timetracker_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE timetracker TO timetracker_user;

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

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

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

- Email/password authentication
- Session management with httpOnly cookies
- Email verification (configure RESEND_API_KEY)
- Password reset flow
- Role-based access control (admin, member)

### Creating the First User

1. Navigate to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in the registration form
3. The first user is created with the "member" role
4. To make a user admin, update the database directly:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
```

## Database Schema

The application uses the following main models:

- **User** - User accounts with authentication
- **Session** - User sessions
- **Account** - OAuth accounts (future)
- **Verification** - Email verification tokens
- **TimeEntry** - Time entries logged by users
- **Project** - Projects with team members
- **ProjectMember** - Project team members with individual rates
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

### Database Connection Issues

If you can't connect to the database:

1. Ensure PostgreSQL is running: `brew services list` (macOS) or `systemctl status postgresql` (Linux)
2. Check your DATABASE_URL in `.env.local`
3. Verify the database and user exist in PostgreSQL
4. Test connection: `psql "postgresql://timetracker_user:password@localhost:5432/timetracker"`

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

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
