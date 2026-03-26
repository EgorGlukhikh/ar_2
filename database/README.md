# Database

Purpose: storage access and repository-style reads/writes.

Current production slice:
- `src/public-home/public-home.repository.ts`

Rules:
- database layer only talks to Prisma/storage
- no UI logic
- no page composition or frontend formatting concerns
