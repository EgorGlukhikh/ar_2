# Frontend

Purpose: UI, layout and user interaction only.

Current production slice:
- `src/landing/components/landing-experience.tsx`
- `src/landing/components/landing-course-carousel.tsx`
- `src/catalog/components/catalog-page-content.tsx`
- `src/auth/components/sign-in-page-content.tsx`
- `src/checkout/components/checkout-page-content.tsx`

Rules:
- no direct database access
- no business aggregation in page components
- reusable components receive props and stay presentation-focused
