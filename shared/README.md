# Shared

Purpose: types, DTOs and cross-layer constants safe to reuse in frontend/backend/database boundaries.

Current production slice:
- `src/public-home/types.ts`
- `src/public-home/copy.ts`
- `src/public-catalog/types.ts`

Rules:
- no database calls
- no React rendering
- no side effects
