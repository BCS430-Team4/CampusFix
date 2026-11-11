# CampusFix frontend

SvelteKit frontend for the ASP.NET Core backend. The student pages retain the existing design and local mock ticket data.

## Development

From this folder:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the URL printed in the terminal. Stop with Ctrl+C.

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run preview
```

## Structure

- `src/routes/+layout.svelte`: shared navigation and toast messages.
- `src/routes/+page.svelte`: dashboard at `/`.
- `src/routes/my-tickets/+page.svelte`: `/my-tickets`.
- `src/routes/report/+page.svelte`: `/report`.
- `src/routes/profile/+page.svelte`: `/profile`.
- `src/routes/tickets/[id]/+page.svelte`: `/tickets/CF-1042`, for example.
- `src/lib/pages/`: page components.
- `src/lib/components/`: shared topbar and ticket rows.
- `src/lib/api.js`: mock ticket storage.
- `src/app.css`: shared styles.
- `src/app.html`: the HTML shell SvelteKit uses.
- `static/`: static files served directly, when needed.

Old hash bookmarks are translated when the app starts. Ticket storage still uses `campusfix_mock_tickets_v1`, so data remains available on the same browser origin.

## Backend

During development, requests to `/api` are proxied to Aspire's `services__server__http__0` address, or `CAMPUSFIX_API_URL`, or `http://localhost:5528`. For standalone development, copy `.env.example` to `.env` and set the backend address. With the server running, `/api/weatherforecast` is the available sample endpoint.

Ticket operations remain local mock operations until the backend implements its ticket endpoints. Authentication and image uploads are not implemented. Alex Rivera remains the placeholder user.

The app currently renders in the browser because its mock data uses localStorage. The static adapter writes to `dist/`, which can be served by ASP.NET Core. Production must route frontend page requests such as `/tickets/CF-1042` to `index.html` when no physical file matches. In ASP.NET Core, add `app.MapFallbackToFile("index.html")` after mapping API routes. Keep unmatched `/api` requests as API errors, rather than returning the frontend shell. The Vite proxy only applies during development.


## Campus map

The `/map` page uses Leaflet and OpenStreetMap tiles. Pins group the visible mock reports by building. Active reports are shown by default; All reports includes resolved and closed tickets. Select a pin or a building in the list to open its reports.

`src/lib/campus.js` stores building positions computed from OpenStreetMap outlines. Locations cover Lupton, Nold, Roosevelt, and Gleeson. Buildings without confirmed coordinates are listed separately and are not pinned. Pins locate buildings rather than rooms.

This preview uses the same local mock tickets as the other student pages. A future campus-wide map needs a backend endpoint that exposes only the report information each user is allowed to see.

Map imagery requires an internet connection. Ticket lists remain usable if map tiles fail. Attribution is displayed on the map. Before public deployment, choose a tile provider suitable for the expected usage and follow its usage policy.

Coordinate sources:
- https://www.openstreetmap.org/way/470067577 (Lupton)
- https://www.openstreetmap.org/way/470067576 (Nold)
- https://www.openstreetmap.org/way/470065741 (Roosevelt)
- https://www.openstreetmap.org/way/470064987 (Gleeson)
- https://map.farmingdale.edu/ (official campus building reference)

## App window

Run npm.cmd run dev:app from this folder to start Vite and open CampusFix in a separate Microsoft Edge app window. Code changes still update live. Close the window and press Ctrl+C in the terminal when finished. This uses the browser engine and the same site storage as Edge; it is not a packaged desktop installer.

