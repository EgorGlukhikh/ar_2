# Service Handoff 2026-03-29

## Scope

This handoff captures the current application structure, deploy flow, access model, and the media fixes completed in the current working session.

Primary focus of this pass:

- portal lesson blocks
- managed video upload and playback
- audio block local upload
- access control around admin media APIs
- service-level stability checks for the current runtime

## Runtime Map

Active runtime:

- `apps/web` - Next.js app router entrypoint, pages, API routes, page composition
- `packages/auth` - Auth.js configuration, credentials and Yandex auth
- `packages/db` - Prisma schema, generated client, seed, db scripts
- `packages/shared` - shared enums and contracts, including roles
- `packages/video-domain` - provider contract for managed video

Legacy transition layer still exists:

- `frontend`
- `backend`
- `database`
- `shared`

Important note:

- New work is intended to follow `page/route -> feature service -> repository/db`.
- Some current pages still import `@academy/db` directly. This is a known migration debt and still shows up as lint warnings.

## Deploy Flow

Code flow:

- local changes -> git -> GitHub repo `EgorGlukhikh/ar_2`
- Railway pulls from GitHub integration
- deploy lifecycle uses `railway.json`

Railway commands:

- build: `npm run railway:build`
- release: `npm run railway:release`
- start: `npm run railway:start`

Operational facts discovered on this machine:

- `gh` is authenticated
- `railway` CLI is authenticated
- current linked Railway project: `serene-vitality`
- current linked environment: `production`
- current linked service: `@academy/web`

## Access Model

Roles from `packages/shared/src/roles.ts`:

- `ADMIN`
- `AUTHOR`
- `CURATOR`
- `SALES_MANAGER`
- `STUDENT`

Course content editing rule:

- `ADMIN` can edit any course
- `AUTHOR` can edit only their own course

Learning media access rule:

- elevated roles can access course media directly
- students can access course media only when enrolled in the course

## Lesson Content Blocks

Current lesson block types:

- `TEXT`
- `VIDEO`
- `FILE`
- `HOMEWORK`
- `AUDIO`

Core data path:

- editor UI: `apps/web/src/components/admin/lesson-block-studio.tsx`
- persistence and orchestration: `apps/web/src/features/admin/course-actions.ts`
- normalized lesson block model: `apps/web/src/lib/lesson-content.ts`
- learning render path: `apps/web/src/app/learning/courses/[courseId]/page.tsx`

## Media Fixes Completed

### 1. Audio block local upload

Implemented:

- admin-side local upload UI for audio block
- upload state, error state, and file summary in lesson block studio
- protected upload route: `POST /api/admin/lesson-audio`
- protected playback route: `GET /api/lesson-audio/[fileId]`
- orphan cleanup on lesson save for removed managed audio blocks

Storage model:

- `LessonAudioFile` in Prisma
- binary audio stored in Postgres

### 2. Managed video upload now works in mock/local mode

Problem before:

- local video upload only created a mock asset
- file bytes were never stored
- player had no usable URL
- result: video looked attached but did not play

Implemented:

- added `VideoAsset.fileData Bytes?`
- added local upload endpoint for mock-managed video:
  `POST /api/admin/video/upload`
- added protected playback endpoint with range support:
  `GET /api/lesson-video/[assetId]`
- updated admin video manager to upload selected file into the platform when provider returns `mock://...`
- updated video player to render native `<video>` when the resolved URL is a direct media source

Result:

- managed local file uploads can now be stored and played back in local/mock mode
- direct media links can also render natively when suitable

### 3. Video admin permissions aligned with course editor rules

Problem before:

- `/api/admin/video` allowed only `ADMIN`
- `AUTHOR` could edit lesson content elsewhere but not execute video actions on own courses

Implemented:

- route now resolves lesson or asset ownership
- route allows the same editor set as the content editor:
  `ADMIN` or owning `AUTHOR`

## Verification

Successful:

- `npm run db:generate`
- `npm run typecheck --workspace @academy/web`
- `npm run lint --workspace @academy/web`
- `npm run build --workspace @academy/web`

Build and lint still report existing migration warnings for pages that import `@academy/db` directly. No new errors remained after the media changes.

## Local DB Follow-up

Not completed in this session:

- `npm run db:push`

Reason:

- local PostgreSQL/Docker was not available from this machine during the run
- Docker daemon was not running

Required next step before local runtime testing against the changed schema:

1. start local database or Docker Desktop
2. run `npm run db:push`

## Known Risks / Debt

1. Media binaries are now stored in Postgres for both audio and local mock video.
This is acceptable for local/dev stability, but it is not the right long-term production storage strategy for large media volumes.

2. `apps/web/src/components/learning/audio-player.tsx` still re-exports from legacy `frontend`.
The runtime works, but this is still a migration seam.

3. Many app pages still import Prisma directly.
This is tracked by current lint warnings and remains architectural debt.

4. Cloud video and mock video now behave differently by design.
Cloud provider expects embed/player URLs from provider.
Mock provider now serves protected direct media from app routes.

## Recommended Next Steps

1. Run `db:push` locally and test the portal flow end-to-end with a real uploaded video and audio file.
2. Move audio player implementation fully into `apps/web` to remove the legacy re-export.
3. Add a lightweight integration test for:
   - author uploads video
   - student/enrolled user can play it
   - non-enrolled user gets `403`
4. Consider moving large media storage away from Postgres to object storage or video provider storage for production scale.

## Task Update

Latest completed pass:

- stabilized managed local video playback in portal lessons
- added local audio upload with protected playback
- aligned admin video permissions with course editor ownership rules
- moved learning audio player runtime fully into `apps/web`
- added `Range`-aware streaming helpers for media routes
- applied cosmetic-only UI polish to the admin lesson content editor, block cards, add-block flow, and video manager

Status:

- `typecheck` passed
- `build` passed
- `lint` returns only pre-existing migration warnings about direct `@academy/db` imports in page files

Intentional constraint for this pass:

- no business logic or information architecture changes beyond the media stability fixes already required for playback and upload support
