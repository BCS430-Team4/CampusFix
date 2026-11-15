# Connect Feature Branch to Backend Implementation Plan

> **For agentic workers:** Execute inline with checkpoints for the merge, API contract, and running application. Steps use checkbox syntax for tracking.

**Goal:** Connect `add-ticket-location-picker-Aneudys` to master's backend while retaining signup routing, mobile pages, and the optional map picker.

**Architecture:** Import master without editing backend code. Keep HTTP integration in `$lib/api.ts` and re-export it for legacy imports. Store map pins separately in this browser, attached to server-returned ticket IDs.

**Tech Stack:** SvelteKit, TypeScript, Leaflet, ASP.NET Core, PostgreSQL, Aspire/Docker.

## Global Constraints

- Keep the user's original feature branch active; preserve temporary dashboard work in its named stash.
- Backend implementation is read-only; document unsupported fields for the backend engineer.
- Keep demo signup/login role routing; account authorization is outside this integration.
- Pins remain browser-only with a clear notice, as the user selected.

### Task 1: Merge and preserve the frontend

**Files:** shared layout, campus map, `frontend/src/lib/api.js`.

- [x] Stop the previous AppHost, stash temporary work, switch to the original branch, and merge master without committing.
- [x] Resolve conflicts with the feature branch's shell and map tile settings. Replace mock storage with `export { CampusFixAPI } from './api.ts';`.

### Task 2: Complete the HTTP integration

**Files:** `frontend/src/lib/api.ts`, ticket-location types, student dashboard/report/map, MyTickets/Profile/Ticket components, technician dashboard/detail, API tests, frontend README.

**Interfaces:** `getTickets(): Promise<Ticket[]>`; `getTicket(id): Promise<Ticket | null>`; `addTicket(input): Promise<Ticket>`; `updateTicket(id, patch): Promise<Ticket | null>`; `addComment(id, body, author?, role?): Promise<Ticket | null>`; browser-only `Ticket.location: TicketLocation | null`.

- [x] Write fetch/storage tests for the JSON contract, failed requests, local pin persistence, and delete/reset cleanup; run `npm.cmd test` before and after adapting the client.
- [x] Send only the supported create/update fields. Cache a pin after the server returns its saved ticket ID; never mask a failed HTTP request as success.
- [x] Await requests throughout the UI. Preserve entered form text on errors and prevent duplicate submissions while saving.
- [x] Use the comments endpoint for technician updates and repair notes, and PATCH for resolution status. Derive repair-history notes from saved comments.
- [x] Retain distinct loading, error, missing-ticket, and empty states and the existing mobile layout.
- [x] Document missing coordinate, upload, completion-timestamp, and real account contracts for backend coordination.

### Task 3: Verify and finish

- [x] Run `npm.cmd test`, targeted ESLint, production build, and type check; record unrelated existing diagnostics.
- [x] Confirm backend files equal master with `git diff origin/master -- CampusFix.Server CampusFix.AppHost`.
- [x] Start the AppHost and verify API health and role dashboards. Create/reload/edit/comment on reports with and without pins; exercise technician repair updates and mobile layout.
- [x] Resolve the merge and prepare the validated changes for a local merge commit on the original branch without pushing.

**Validation:** 8 API tests passed; targeted ESLint and production build passed. Browser verification passed 19 functional checks and 32 route/viewport combinations. Full type checking still reports 43 errors and 4 warnings in 13 legacy files. The two agent-created test reports were removed; the user's existing database reports remain. Backend files match imported master exactly. The application is left running; the final handoff records the local merge commit.
