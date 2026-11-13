# Optional report location

The report form at `/report` keeps its category, title, description, building,
room/location, and photo fields. “Choose on map” opens a Leaflet dialog using the
same campus bounds, building coordinates, and OpenStreetMap tile configuration as
`/map`. Opening the dialog does not select a location. Confirm saves the draft;
Cancel or Escape discards it. A saved pin can be changed or removed. No device
geolocation is requested. The map also supports keyboard panning followed by
“Place pin at center.”

New mock tickets store either `location: null` or:

```json
{
	"location": {
		"latitude": 40.750924,
		"longitude": -73.431257,
		"isApproximate": true
	}
}
```

Coordinates describe a student's estimate, not measured GPS accuracy. Building
and room values are independent and are never inferred or overwritten by a pin.
Existing stored tickets without `location` remain supported. The campus overview
continues grouping reports by building; this feature does not change that view.

## Backend handoff

Notify the backend engineer that a future ticket create/read contract needs an
optional location with nullable latitude/longitude (present together) and an
approximate-location flag. The frontend uses decimal degrees (WGS84); retain the
numerical coordinates without implying verified accuracy. A report must remain
valid when location is absent. No backend or database files were changed.

When the ticket API is ready, expose its client through `$lib/api.ts` and replace
the current mock submission in the route with that client. The form input and
location types live in `src/lib/types/ticket-location.ts`.

## Verification

Run `npm test` for mock storage round trips and compatibility checks. In `/report`,
check click placement, dragging, keyboard center placement, confirm/reopen,
Cancel/Escape, removal, and submission with and without a pin. The picker uses
the existing OpenStreetMap attribution and lets students skip location when map
imagery is unavailable.
