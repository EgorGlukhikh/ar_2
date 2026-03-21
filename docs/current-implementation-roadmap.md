# Academy Platform: current implementation roadmap

## 1. Completed foundation

### 1.1 Core architecture

- `Next.js 15` app in a workspace setup
- `Prisma` as the shared data model
- modular package structure for future scaling
- base UI system aligned with the current portal style

### 1.2 Authentication and roles

- sign-in via `email + password`
- `ADMIN` role
- `STUDENT` role
- dev admin for testing: `test@mail.ru / 12345`
- role-based redirect after sign-in

### 1.3 Admin area

- courses list
- create and edit course
- create and edit modules
- create and edit lessons
- manage lesson type, text, preview access, and delayed release
- manage students
- grant course access
- revoke access
- reset progress

### 1.4 Student area

- dashboard with available courses
- course structure view
- lesson opening flow
- lesson completion tracking
- delayed lesson access rules

### 1.5 Video

- dedicated `VideoAsset` entity
- `Rutube embed` support
- external `embed` support
- foundation for a managed video provider
- foundation for URL-based video import
- student player that reflects video processing state

### 1.6 Payments

- demo course catalog
- demo checkout
- demo successful payment
- demo failed payment
- automatic enrollment after successful payment
- abstraction layer for future real payment providers

## 2. Next priorities

### Phase 1. Homework and curator review

Goal: complete the core educational loop that the platform still lacks.

Scope:

- homework as an optional lesson-level feature
- multiple answer types:
  - text
  - link
  - file
- review statuses:
  - `not_submitted`
  - `submitted`
  - `in_review`
  - `needs_revision`
  - `approved`
- curator/admin review workspace
- review comments
- resubmission after revision

### Phase 2. Author and curator roles

Goal: prepare the platform for invited experts, not just a single admin.

Scope:

- `AUTHOR` role
- `CURATOR` role
- email invite flow
- clearer permission boundaries:
  - author manages own courses and lessons
  - curator sees assigned groups and homework
  - admin keeps global control

### Phase 3. Production-grade video

Goal: move the video layer from demo-foundation to commercial readiness.

Scope:

- provider webhooks
- processing status sync
- signed playback
- origin restrictions
- improved player UX
- normalized storage pipeline for author-uploaded media

### Phase 4. Real payment integrations

Goal: replace demo checkout with real payment flows.

Scope:

- first real provider on top of the existing `PaymentProvider`
- callback/webhook handling for payment statuses
- enrollment only after confirmed payment
- manual payment-link workflow through chat or direct messages
- follow-up adapters for `Robokassa`, `T-Bank`, and `Bank 131`

### Phase 5. Operational platform layer

Goal: make the system easier for the team to operate day to day.

Scope:

- student activity feed
- admin notes on users
- filters by courses, payments, and access
- action history for course and student records
- dashboard with key metrics

## 3. Immediate build order

### Next sprint

1. add Prisma models for homework and reviews
2. add server actions and access rules for student, curator, and admin
3. build homework submission UI in the lesson player
4. build review UI in the admin/curator area
5. add review comments and resubmission flow

### After that

1. add `AUTHOR` and `CURATOR` roles
2. build email invite flow
3. extract access control into a more explicit permission model

## 4. GitHub tracking rule

- the repository uses one primary `issue` as the chronological work log
- every major task or milestone is added there as a new comment
- code is shipped as separate commits to the repository
- this roadmap is updated whenever priorities change

## 5. What is already demo-ready

- email/password sign-in
- admin course management
- student access management
- student dashboard
- lesson progress tracking
- video lessons through embed and video asset foundation
- demo payment and automatic course access after successful payment
