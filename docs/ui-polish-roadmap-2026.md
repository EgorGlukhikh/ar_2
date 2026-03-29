# UI Polish Roadmap 2026

## Visual Thesis

Calm premium operator workspace: soft luminous surfaces, cleaner depth hierarchy, stronger typography, tighter state language, and less "utility-raw" chrome without changing product structure.

## Priorities

### Wave 1 - Safe Cosmetic Upgrades

1. Refine lesson editor hero block with stronger hierarchy and clearer status chips.
2. Upgrade lesson block cards with softer depth, cleaner handles, and more deliberate header rhythm.
3. Redesign video manager into a clearer two-lane media control surface.
4. Replace legacy audio player re-export with native `apps/web` component.
5. Improve upload status feedback for audio and video with clearer success and loading states.
6. Modernize empty states in the content editor so they feel product-grade, not placeholder-grade.
7. Improve action bars for "save / preview / delete" with stronger separation and calmer emphasis.
8. Polish modal block picker with stronger visual grouping and more premium spacing.

### Wave 2 - Product Surface Quality

9. Unify admin shell spacing rhythm across analytics, courses, homework, team, and students.
10. Add consistent section intro patterns for admin pages instead of one-off headers.
11. Standardize destructive action styling across module, lesson, and asset deletion flows.
12. Improve lesson preview surfaces in learning mode to match the upgraded media blocks.
13. Replace direct Prisma page data access with feature-service composition for lint-debt reduction.
14. Remove `@frontend` re-export seams from `apps/web` components incrementally.

### Wave 3 - Trust, Feedback, and Operations

15. Add inline file metadata summaries for managed media assets.
16. Add stronger playback-state messaging for pending, processing, and failed media.
17. Add upload progress UI for large managed video files.
18. Add protected media smoke tests for author/enrolled/non-enrolled scenarios.
19. Move binary media storage off Postgres for production-scale media.
20. Create a shared design token note for admin workspace visual rules so future changes stay consistent.

## Implementation Order Chosen Now

This pass implements a subset from Wave 1:

- 1. Lesson editor hero polish
- 2. Lesson block card polish
- 3. Video manager polish
- 4. Native audio player in `apps/web`
- 5. Better media feedback
- 7. Better action bar polish
- 8. Better block picker polish
