# Database

Purpose: storage access and repository-style reads/writes.

Current production slice:
- `src/public-home/public-home.repository.ts`
- `src/public-catalog/public-catalog.repository.ts`
- `src/public-checkout/public-checkout.repository.ts`
- `src/auth/auth.repository.ts`

Rules:
- database layer only talks to Prisma/storage
- no UI logic
- no page composition or frontend formatting concerns
