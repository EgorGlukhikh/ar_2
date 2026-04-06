# UI Consistency Contract

## Goal

The interface must feel like one product across `public`, `learning`, and `admin`. A user should not land on a different button scale, spacing rhythm, or card style just because a different screen was opened.

## Sources Of Truth

- Tokens: `apps/web/src/app/globals.css`
- Base controls: `apps/web/src/components/ui/*`
- System helpers: `apps/web/src/components/system/system-ui.tsx`
- Workspace shells: `apps/web/src/components/workspace/workspace-primitives.tsx`
- Public shells: `apps/web/src/components/marketing/public-primitives.tsx`

If the right pattern does not exist yet, add a shared primitive first and only then build the screen.

## Mandatory Rules

### 1. Do not hand-roll standard surfaces

Use the shared primitives for ordinary cards, panels, page headers, notices, and empty states:

- `Card`
- `WorkspacePageHeader`
- `WorkspacePanel`
- `WorkspaceStatCard`
- `WorkspaceEmptyState`
- `SystemInfoItem`
- `SystemNotice`

Do not create a new shell from ad-hoc combinations like `bg-white`, `rounded-*`, `shadow-sm`, and `p-*` if an equivalent shared surface already exists.

### 2. One button role, one button size

- Topbars, nav rows, segmented switchers, and compact service actions use `Button size="sm"`
- Primary form actions and page-level CTAs use the default `Button` size
- Large hero CTAs belong only to public marketing flows that already use `PublicButton`

Buttons with the same meaning should never sit next to each other at different heights.

### 3. Action rows use shared layout

- Regular action rows use `SystemActionRow`
- Dense service rows use `SystemActionRow dense`
- Topbar actions use `systemTopbarActionsClassName`

Avoid inventing a new `flex gap-*` recipe for every action group when a shared pattern already exists.

### 4. Typography stays on one scale

- Eyebrow / section label: `systemEyebrowClassName`
- Standard panel titles: `systemTitleClassName` or `CardTitle`
- Hero titles: `systemHeroTitleClassName`
- Supporting copy: `systemBodyTextClassName` or `CardDescription`

Do not introduce a new local text scale without a product reason.

### 5. Topbars and service chrome share one pattern

Internal layouts and service headers should use the shared topbar tokens from `system-ui.tsx`:

- `systemTopbarClassName`
- `systemTopbarInnerClassName`
- `systemTopbarPrimaryRowClassName`
- `systemTopbarSecondaryRowClassName`
- `systemTopbarActionsClassName`
- `systemBrandMarkShellClassName`

This keeps admin and learning aligned on density, spacing, and control height.

## Decision Flow For A New Screen

1. Pick the shell family: `Workspace*`, `public-*`, or `Card/System*`
2. Assemble actions with shared action-row primitives
3. Check that buttons with the same role share the same `size` and `variant`
4. Check that titles, helper text, and badges stay on the system scale
5. If a reusable pattern is missing, promote it into a shared component

## What Counts As A Defect

- A topbar button that is taller than its siblings
- A local card with its own radii and shadows when a system primitive already exists
- Form controls that change height without an intentional product exception
- A screen that introduces its own heading/helper scale
- A service switcher that looks like a random stack of CTAs instead of a system control

## Merge Checklist

- The screen is built from shared primitives or from a newly added shared primitive
- Controls in the same action row match in size and visual weight
- Surface, spacing, and typography follow the system defaults
- `typecheck`, `lint`, and `build` pass
