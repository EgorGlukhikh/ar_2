# Academy Platform

Learning platform for "Akademiya rieltorov".

## Stack

- Next.js 15
- React 19
- Prisma 7
- Auth.js credentials auth
- PostgreSQL via Docker Compose
- Modular monolith structure with workspace packages

## Current scope

- Email/password authentication
- Admin area for courses, modules, lessons, students, enrollments, and progress
- Student learning area with course access and lesson progress
- Video foundation with provider abstraction, embed support, and managed video asset model
- Demo billing flow with catalog, checkout, and enrollment after successful payment

## Local bootstrap

1. Start Docker Desktop.
2. Run `npm install`.
3. Run `npm run db:start`.
4. Run `npm run db:generate`.
5. Run `npm run db:push`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

## Test admin

- Email: `test@mail.ru`
- Password: `12345`

These credentials are for local development only and are seeded from the root `.env`.

## Project tracking

- Product roadmap: `docs/current-implementation-roadmap.md`
- GitHub work log: one rolling issue with chronological updates for all major tasks
