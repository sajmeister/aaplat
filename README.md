# AI Agent Deployment Platform

A modern SaaS platform for deploying and managing AI agents, built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Current Status

**✅ Week 1 - Project Setup & Database** (COMPLETED)
- ✅ Next.js 15 with TypeScript and App Router
- ✅ Tailwind CSS v4 configured
- ✅ shadcn/ui v2 components installed
- ✅ Database schema with Drizzle ORM
- ✅ Project structure following the development plan
- ✅ Essential dependencies installed

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui v2
- **Database**: Turso (SQLite) with Drizzle ORM
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js v5 (planned)
- **Deployment**: Railway.app (planned)
- **Storage**: Cloudflare R2 (planned)

## 📁 Project Structure

```
ai-agent-platform/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # User dashboard (planned)
│   │   ├── marketplace/     # Agent marketplace (planned)
│   │   ├── deploy/          # Deployment interface (planned)
│   │   ├── auth/            # Authentication pages (planned)
│   │   └── api/             # API routes (planned)
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/              # shadcn/ui components ✅
│   │   ├── forms/           # Form components (planned)
│   │   ├── layouts/         # Layout components (planned)
│   │   ├── agent/           # Agent-specific components (planned)
│   │   ├── deployment/      # Deployment components (planned)
│   │   └── dashboard/       # Dashboard components (planned)
│   │
│   ├── lib/                 # Utilities and configurations
│   │   ├── db/              # Database utilities ✅
│   │   │   ├── schema.ts    # Drizzle schema ✅
│   │   │   └── index.ts     # Database connection ✅
│   │   ├── services/        # External service integrations (planned)
│   │   ├── validations/     # Zod schemas (planned)
│   │   ├── utils.ts         # General utilities ✅
│   │   └── constants.ts     # Application constants ✅
│   │
│   ├── stores/              # Zustand stores (planned)
│   ├── hooks/               # Custom React hooks (planned)
│   └── types/               # TypeScript types ✅
│       ├── agent.ts         # Agent types ✅
│       ├── deployment.ts    # Deployment types ✅
│       ├── user.ts          # User types ✅
│       └── api.ts           # API types ✅
│
├── docs/                    # Documentation (planned)
├── docker/                  # Docker configurations (planned)
├── scripts/                 # Utility scripts (planned)
└── tests/                   # Test files (planned)
```

## 🗃️ Database Schema

The platform includes a comprehensive database schema with:

- **Users**: Authentication and user management
- **Agents**: Agent registry with metadata and versioning
- **Deployments**: Deployment tracking and configuration
- **Deployment Logs**: Centralized logging system
- **Agent Reviews**: Marketplace rating system

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Turso database account (for production)

### Development Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `env.example` to `.env.local` and configure:
   ```bash
   cp env.example .env.local
   ```

3. **Configure database**:
   - Set up Turso database
   - Add `DATABASE_URL` and `DATABASE_AUTH_TOKEN` to `.env.local`

4. **Run database migrations**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## 🎯 Next Steps (Week 2)

**Week 2: Authentication & Core API**
- [ ] Implement NextAuth.js v5 with GitHub + Google providers
- [ ] Set up Zustand store for client state management
- [ ] Create protected API routes structure
- [ ] Implement proper error handling with Sentry
- [ ] Deploy to Vercel with database connection

## 🤝 Development Workflow

This project follows the development plan in `ai_agent_platform_plan.md`. Each week focuses on specific milestones:

- **Phase 1** (Weeks 1-4): MVP Foundation
- **Phase 2** (Weeks 5-8): Essential SaaS Features  
- **Phase 3** (Weeks 9-12): Scale & Monetization

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using AI coding agents**
