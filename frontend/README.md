# CampusFix frontend

SvelteKit frontend connected to the ASP.NET Core API and PostgreSQL. The student design, mobile layouts, signup role routing, and optional Leaflet picker are retained.

## Run the complete application

Start Docker Desktop, then run from the repository root with the .NET 10 SDK installed:

```powershell
dotnet run --project .\CampusFix.AppHost\CampusFix.AppHost.csproj --launch-profile http
```

Aspire starts PostgreSQL, object storage, the API, and Vite. Open the frontend URL listed by Aspire. `/` opens signup; the demo role selector opens `/student`, `/technician`, or `/admin`.

For a separate frontend terminal with the API already running, use this folder:

```powershell
npm.cmd ci
npm.cmd run dev
```

Requests to `/api` are proxied to Aspire's `services__server__http__0` address, then `CAMPUSFIX_API_URL`, then `http://localhost:5528`. For a custom standalone backend, set `$env:CAMPUSFIX_API_URL` before starting Vite. The backend's `/health` endpoint reports health.

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run build
```

Stop the AppHost with Ctrl+C. Browser-only data is tied to the full origin, including the frontend port.

Stop an existing AppHost before starting another copy. If the backend is already healthy, reuse it and start only the frontend in a separate terminal to avoid rebuilding a running server executable.

## Structure

- `src/routes/+page.ts`: redirects `/` to `/signup` while preserving legacy hash bookmarks.
- `src/routes/+layout.svelte`: shared student navigation and toast messages.
- `src/routes/student/+page.svelte`: student dashboard.
- `src/routes/report/+page.svelte`: report form with optional building, room, and estimated map pin.
- `src/routes/my-tickets`, `profile`, `map`, and `tickets/[id]`: student pages.
- `src/routes/admin` and `technician`: staff dashboards and ticket pages.
- `src/routes/technician/profile`: J. Delgado's demo profile with workload statistics from the ticket API.
- `src/routes/signup`, `login`, and `request-access`: demo access screens.
- `src/lib/demo-access.ts`: temporary role-to-dashboard mapping.
- `src/lib/api.ts`: typed HTTP client and local map-pin metadata.
- `src/lib/api.js`: compatibility re-export for older imports; no mock ticket implementation remains.
- `src/lib/types/ticket-location.ts`: estimated map-location types.
- `src/app.css`: shared styles, including the scoped student mobile layout.

## Database and browser-only pins

Tickets and comments now come exclusively from the API. Creating, loading, editing, cancelling, and commenting on reports wait for HTTP responses. A failed request shows an error rather than falling back to mock tickets. Existing browser tickets under `campusfix_mock_tickets_v1` are left untouched and are not automatically imported into PostgreSQL.

The supported create fields are title, category, building, room, and description. Ticket updates use the server's supported fields. Technician updates and repair notes use `/api/tickets/{id}/comments`; resolving a repair PATCHes its status. History reads technician comments beginning with `Repair completed: ` as repair notes, and does not invent a dedicated completion timestamp.

Map coordinates are not supported by the backend yet. Pins are intentionally saved only in this browser under `campusfix_local_ticket_pins_v1`, associated with the server-returned ticket ID and identifying fields. They are not sent as unsupported fields. The report form and ticket detail explain that pins are not shared with other devices. Changing the frontend port or clearing browser data makes these local estimates unavailable. Failed server saves do not cache pins; successful deletion or reset clears corresponding local metadata.

## Account integration and backend coordination

Signup and login select a demo workspace. Student opens `/student`, Technician opens `/technician`, and Admin opens `/admin`. Only the role is stored for the current browser tab. A refresh keeps the selection. Opening another role's screen returns the user to their dashboard, and opening a workspace without a role leads to login. Use **Log out** on any role's profile to select another role. Demo credentials can be left blank. Production authorization still requires the backend to verify the user's identity and role on API requests.

Notify the backend engineer about the remaining contracts before enabling them: ticket latitude/longitude and `isApproximate`, image uploads, dedicated completion notes/timestamps, comment IDs in comment responses, and authenticated user identity/role authorization. Current comment responses omit numeric IDs, so editing/deleting comments by ID is not exposed in this UI. Keep future generated API integration in or re-exported by `$lib/api.ts`.

No backend implementation is changed by this frontend integration. The static adapter writes to `dist/`; coordinate production deep-link fallback and `/api` routing with the backend engineer. Vite's proxy applies only during development.

## Administrator ticket management

Administrator ticket links open `/admin/tickets/[id]` and retain the admin navigation. The detail page saves technician assignment and Low/Medium/High urgency through `PATCH /api/tickets/{id}` using the existing `technician`, `priority`, and `status` fields. Assigning an open ticket changes its status to Assigned; unassigning an Assigned ticket returns it to Open. Reassigning an in-progress repair preserves its progress. Finished tickets show their saved assignment, comments, and repair notes as history.

J. Delgado is a typed demo selection, matching the technician dashboard. Saving an assignment stores that name on the database ticket. No separate technician account is created: the current API does not expose a technician directory or technician-account creation. Notify the backend engineer that a directory with stable technician identities is needed to replace this demo option.

## Technician self-assignment

The technician dashboard lists open, unassigned tickets. Open one and choose **Manage repair → Assign to me** to claim it as the current demo technician, J. Delgado. The map uses the same availability check. Both views read the latest ticket before saving its technician and status.

Backend handoff: please notify the backend engineer that multi-user use requires an authenticated self-claim operation. It must use the caller's technician identity, accept only a still-open and unassigned ticket in one atomic update, and report a conflict if someone else claims it first. The current general ticket PATCH cannot guarantee this across concurrent clients or enforce technician permissions.

## Campus map

Leaflet and OpenStreetMap display backend reports grouped by building. Active reports are shown by default; All reports includes resolved and closed tickets. Select a building pin or list item to open its reports. Building pins locate buildings, not rooms or individual browser-only estimates.

`src/lib/campus.js` contains confirmed positions for Lupton, Nold, Roosevelt, and Gleeson. Other locations are listed separately. Internet access is needed for imagery; ticket lists remain usable when imagery fails. Attribution stays visible. Choose an appropriate tile provider before public deployment.

Coordinate references:

- https://www.openstreetmap.org/way/470067577 (Lupton)
- https://www.openstreetmap.org/way/470067576 (Nold)
- https://www.openstreetmap.org/way/470065741 (Roosevelt)
- https://www.openstreetmap.org/way/470064987 (Gleeson)
- https://map.farmingdale.edu/ (official campus reference)
