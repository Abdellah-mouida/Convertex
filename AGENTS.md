# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Convertex is a file conversion service built with Next.js 15 (App Router), Prisma 7, and Supabase. Users upload files, which are stored in Supabase Storage, while conversion job metadata is tracked in PostgreSQL.

## Commands

```powershell
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Prisma
npx prisma generate  # Generate Prisma client (outputs to generated/prisma/)
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio    # Open database GUI
```

## Architecture

### Data Flow
1. Client uploads file via `POST /api/upload` with file + target format
2. File stored in Supabase Storage bucket (`uploads/<uuid>.<ext>`)
3. Conversion record created in PostgreSQL with PENDING status
4. Conversion ID returned to client for polling

### Key Files
- `lib/prisma.ts` - Prisma client singleton using `@prisma/adapter-pg` for direct PostgreSQL connection
- `lib/supabase.ts` - Supabase client (server-side, uses service role key)
- `generated/prisma/` - Prisma client output (custom location, do not edit manually)

### Database Schema
Multi-tenant architecture:
- **Tenant** → has many Users and Conversions (supports FREE/PRO plans)
- **User** → belongs to Tenant, has many Conversions
- **Conversion** → tracks file conversion jobs with status (PENDING → IN_PROGRESS → COMPLETED/FAILED)

All IDs use prefixed UUIDs (e.g., `tnt_`, `usr_`, `cnv_`).

### API Routes (`app/api/`)
- `upload/route.ts` - File upload + conversion job creation (fully implemented)
- `status/route.ts` - Check conversion status (stub)
- `download/route.ts` - Download converted file (stub)

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `SUPABASE_BUCKET` - Storage bucket name

## Code Conventions

- Prisma enums imported from `@prisma/client` (e.g., `Conversion_Status`)
- Prisma client imported from `@/generated/prisma/client`
- Client components marked with `"use client"` directive
- Path alias `@/*` maps to project root
