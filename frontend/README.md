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

## Structure

- `src/routes/+page.ts`: redirects `/` to `/signup` while preserving legacy hash bookmarks.
- `src/routes/+layout.svelte`: shared student navigation and toast messages.
- `src/routes/student/+page.svelte`: student dashboard.
- `src/routes/report/+page.svelte`: report form with optional building, room, and estimated map pin.
- `src/routes/my-tickets`, `profile`, `map`, and `tickets/[id]`: student pages.
- `src/routes/admin` and `technician`: staff dashboards and ticket pages.
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

Signup and login are still demo navigation: Student opens `/student`, Technician `/technician`, and Admin `/admin`. Any field contents, including blank credentials, short passwords, and mismatched confirmations, are accepted. These handlers do not read, store, or transmit credentials, create accounts, or establish authenticated sessions. Names remain placeholders. The dropdown does not enforce server authorization.

Notify the backend engineer about the remaining contracts before enabling them: ticket latitude/longitude and `isApproximate`, image uploads, dedicated completion notes/timestamps, comment IDs in comment responses, and authenticated user identity/role authorization. Current comment responses omit numeric IDs, so editing/deleting comments by ID is not exposed in this UI. Keep future generated API integration in or re-exported by `$lib/api.ts`.

No backend implementation is changed by this frontend integration. The static adapter writes to `dist/`; coordinate production deep-link fallback and `/api` routing with the backend engineer. Vite's proxy applies only during development.

## Campus map

Leaflet and OpenStreetMap display backend reports grouped by building. Active reports are shown by default; All reports includes resolved and closed tickets. Select a building pin or list item to open its reports. Building pins locate buildings, not rooms or individual browser-only estimates.

`src/lib/campus.js` contains confirmed positions for Lupton, Nold, Roosevelt, and Gleeson. Other locations are listed separately. Internet access is needed for imagery; ticket lists remain usable when imagery fails. Attribution stays visible. Choose an appropriate tile provider before public deployment.

Coordinate references:

- https://www.openstreetmap.org/way/470067577 (Lupton)
- https://www.openstreetmap.org/way/470067576 (Nold)
- https://www.openstreetmap.org/way/470065741 (Roosevelt)
- https://www.openstreetmap.org/way/470064987 (Gleeson)
- https://map.farmingdale.edu/ (official campus reference)
