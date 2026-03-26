# Backend

Purpose: business orchestration, validation-ready service layer and API-facing logic.

Current production slice:
- `src/public-home/get-public-home-payload.ts`
- `src/public-catalog/get-public-catalog-payload.ts`
- `src/public-checkout/get-public-checkout-payload.ts`
- `src/auth/register-credentials-user.ts`
- `src/public-auth/get-public-auth-screen-payload.ts`

Rules:
- backend depends on database and shared layers
- backend does not contain UI logic
- route/page entrypoints should call backend services instead of aggregating data inline
