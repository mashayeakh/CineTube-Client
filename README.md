# CineTube (Client)

A feature-rich frontend for a movie and TV streaming community platform built with Next.js, React, TypeScript, Tailwind CSS, and React Query.

## Overview

CineTube is a multi-role frontend application designed for:

- Public visitors: discover trending movies, popular collections, TV series, and leaderboards.
- Authenticated users: browse content, manage subscriptions, view profiles, and save watchlists.
- Premium users: access subscription-specific pages, watch history, reviews, and contributions.
- Admin users: manage movies, series, categories, users, subscriptions, and bookings.

The project uses server actions, client-side React Query hydration, and a shared Axios HTTP client to interact with an external backend API.

## Key Features

- Next.js 16 app router
- React 19 + TypeScript
- Tailwind CSS v4 and shadcn-style component directories
- MUI charts (`@mui/x-charts`) for analytics and dashboards
- Global theme switching with `next-themes`
- Axios-based API layer with cookie and bearer token forwarding
- Remote image loading from Cloudinary via Next.js `remotePatterns`
- Prefetch + hydration of movie data for the home page

## Supported Routes

### Public routes

- `/` — main landing page
- `/leaderboard` — leaderboard pages
- `/movie/*` — movie detail pages
- `/movies` — movie catalog
- `/popular` — popular items
- `/series` — TV series pages
- `/tv` — TV listing pages
- `/signup` — sign-up page
- `/subscription` — subscription details
- `/verify-email` — email verification flow

### Auth and user routes

- `/user` — authenticated user dashboard and profile
- `/premium_user` — premium user experience pages
- `/payment/success` and `/payment/cancel` — payment callbacks

### Admin routes

- `/admin` — admin dashboard
- `/admin/movie-management` — manage movies
- `/admin/series-management` — manage series
- `/admin/category-management` — manage categories
- `/admin/user-management` — manage users
- `/admin/subscription-management` — manage subscriptions
- `/admin/view-bookings` — booking overview

## Project Structure

- `src/app/` — Next.js app router pages, layouts, and route groups
- `src/components/` — shared UI components and module sections
- `src/lib/` — utilities, API helpers, auth helpers, and token utilities
- `src/providers/` — React Query and theme provider wrappers
- `src/service/` — feature-specific service wrappers and API wrappers
- `src/types/` — shared TypeScript API and domain types
- `src/zod/` — request validation schemas

## Environment Variables

The client requires one main environment variable to connect to the backend API:

- `NEXT_PUBLIC_API_BASE_URL` or `NEXT_PUBLIC_BACKEND_URL` or `NEXT_PUBLIC_API_URL`

Example:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

> `src/lib/axios/httpClient.ts` resolves the backend base URL and forwards cookies and bearer tokens with requests.

## Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Build and Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Linting

Run ESLint checks:

```bash
npm run lint
```

## Backend Integration Notes

- `src/app/(public)/public/_actions.ts` fetches movies with `httpClient.get('/movies')`.
- `src/lib/axios/httpClient.ts` builds requests from the configured API base URL and attaches stored cookies and `Authorization` headers.
- `next.config.ts` rewrites `/api/auth/:path*` to the configured backend URL, enabling auth route forwarding.
- Remote image loading is configured for Cloudinary domains.

## Conventions

- The project uses the App Router with route groups such as `(public)` and `(dashboard)`.
- `QueryProviders` wraps the app to provide React Query and theme support.
- Components follow a modular pattern under `src/components/ui/modules/`.

## Notes

- There is no `.env.example` file included in this repo, so create your own local environment config before running the app.
- Ensure the backend API is reachable and supports the same route contract expected by the client.

## Recommended Next Steps

1. Add a local `.env` file with the backend URL.
2. Confirm backend auth and movie endpoints match the frontend expectations.
3. Use the admin and premium route groups to test role-based navigation.

---

If you want to improve this README further, we can add specific backend endpoint examples and user flow diagrams.
