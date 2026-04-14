# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Build for production
npm run preview      # Preview production build

# Code quality
npm run lint         # Check with ESLint
npm run lint:fix     # Auto-fix ESLint issues

# Database
npx prisma migrate dev   # Apply migrations and regenerate client
npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma studio        # Open Prisma Studio

# Docker (PostgreSQL for development)
docker-compose up -d     # Start PostgreSQL on localhost:5432
```

No test suite is configured.

## Environment

Copy `.env.example` to `.env`. The only required variable:

```
DATABASE_URL="postgresql://azimuth:azimuth@localhost:5432/azimuth"
```

## Architecture

**Azimuth** is a Nuxt 4 SPA (SSR disabled) for planning underwater navigation routes on an interactive map.

### Frontend (`app/`)

`app/app.vue` is the root — it owns the Leaflet map instance, fetches all data on mount (`/api/routeGroups`, `/api/routes`, `/api/spots` in parallel), and manages two overlapping sidebars:
- `TheSidebar` — edits waypoints of a selected route
- `TheManagementSidebar` — CRUD for routes, route groups, and spots

After any mutation, components emit `@refresh` which triggers `useAsyncData` re-fetch, then `render()` redraws all Leaflet layers from scratch via `app/utils/render.ts`.

`app/utils/render.ts` contains all Leaflet rendering logic (routes, waypoints, route groups, spots). It uses `RouteGroupProxy` objects (in `app/utils/routeGroupProxy.ts`) that pair a `RouteGroup` DB record with a Leaflet `FeatureGroup`.

### Backend (`server/`)

Nitro API handlers under `server/api/` follow file-system routing:
- `routes.get.ts` — `GET /api/routes` (with nested waypoints)
- `routes/index.post.ts` — `POST /api/routes`
- `routes/[id].patch.ts` — `PATCH /api/routes/:id`
- `routes/[id].delete.ts` — `DELETE /api/routes/:id`
- Same pattern for `routeGroups/`, `waypoints/`, `spots/`
- `waypoints/reorder.patch.ts` — special endpoint for drag-and-drop reordering

All handlers use the Prisma singleton from `server/utils/prisma.ts` (PrismaPg adapter for connection pooling).

### Shared (`shared/`)

- `shared/types/api.d.ts` — interfaces for API responses (`IAPIRoute`, `IAPIWaypoint`, `IAPIRouteGroup`, `IAPISpot`). These are auto-imported globally by Nuxt.
- `shared/utils/consts.ts` — constants like `DIVER_SPEED_MULTIPLIER`

### Database (Prisma + PostgreSQL)

Models in `prisma/schema.prisma`:
- `RouteGroup` — groups of related routes (color/weight styling)
- `Route` — navigation path; `guideline: true` means it's a compass bearing reference; has an optional `anchorWaypointId` that points to another route's waypoint as its spatial origin
- `Waypoint` — point on a route; `poi: true` means it's a point-of-interest marker; `targetWaypointId` links to another waypoint; `order` (Float) used for fractional ordering; stores `azimuth`, `seconds`, `distance`
- `Spot` — standalone emoji marker with fixed lat/lng

Generated Prisma client outputs to `prisma/generated/` (imported as `~~/prisma/generated/client`).
