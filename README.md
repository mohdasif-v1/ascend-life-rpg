# ASCEND — Life RPG

Turn your real life into an RPG.

## Current Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v3
- **Runtime**: Node.js
- **Deployment**: Vercel

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

4. **Verify Health Endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Expected response:
   ```json
   { "ok": true }
   ```

## Production Build

To test the production build locally:

```bash
npm run build
npm run start
```

## Current Project Status

- **Phase**: Hour 0–0.5 (Skeleton + Initial Deployment)
- **Implemented**: Next.js 14 App Router skeleton, Tailwind CSS v3 setup, dark placeholder landing page, `/api/health` route handler.
- **Upcoming**: Authentication (NextAuth Credentials/JWT), MongoDB/Mongoose database integration, core RPG attributes, quests, progression, and economy engine.
