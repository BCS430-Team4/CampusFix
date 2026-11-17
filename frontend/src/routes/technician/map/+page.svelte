<script lang="ts">
	import { onMount } from 'svelte';
	import { CampusFixAPI } from '$lib/api.js';
	import { CAMPUS_BUILDINGS, CAMPUS_BOUNDS } from '$lib/campus.js';
    import { STATUS_COLOR } from '$lib/shared.js';
	import 'leaflet/dist/leaflet.css';

	const technicianName = 'J. Delgado';
	const activeStatuses = new Set(['Open', 'Assigned', 'In progress']);

	let mapElement: HTMLDivElement;
	let leaflet: any;
	let map: any;
	let markerLayer: any;

	let tickets = $state<any[]>([]);
	let viewMode = $state<'mine' | 'all'>('mine');
	let selectedBuilding = $state('');
	let loading = $state(true);
	let error = $state('');
	let busyTicketId = $state<string | number | null>(null);

	function normalize(value: unknown) {
		return String(value ?? '').trim().toLowerCase();
	}

	function getVisibleTickets() {
		const activeTickets = tickets.filter((ticket) => activeStatuses.has(ticket.status));

		if (viewMode === 'mine') {
			return activeTickets.filter(
				(ticket) => normalize(ticket.technician) === normalize(technicianName)
			);
		}

		return activeTickets;
	}

	function getBuildingTickets(buildingName: string) {
		return getVisibleTickets().filter(
			(ticket) => normalize(ticket.building) === normalize(buildingName)
		);
	}

	function getUnmappedTickets() {
		return getVisibleTickets().filter(
			(ticket) =>
				!CAMPUS_BUILDINGS.some(
					(building) => normalize(building.name) === normalize(ticket.building)
				)
		);
	}

	async function loadTickets() {
		try {
			error = '';

			const result = await CampusFixAPI.getTickets();

			if (Array.isArray(result)) {
				tickets = result;
			} else if (Array.isArray(result?.tickets)) {
				tickets = result.tickets;
			} else if (Array.isArray(result?.data)) {
				tickets = result.data;
			} else {
				tickets = [];
			}

			drawMarkers();
		} catch (err) {
			console.error('Could not load tickets:', err);
			error = 'Could not load tickets. Please try again.';
		} finally {
			loading = false;
		}
	}

	function drawMarkers() {
		if (!leaflet || !map || !markerLayer) return;

		markerLayer.clearLayers();

		for (const building of CAMPUS_BUILDINGS) {
			const count = getBuildingTickets(building.name).length;

			if (count === 0) continue;

			const icon = leaflet.divIcon({
				className: 'ticket-count-marker',
				html: `<span>${count}</span>`,
				iconSize: [42, 42],
				iconAnchor: [21, 21]
			});

			leaflet
				.marker(building.position, { icon })
				.addTo(markerLayer)
				.on('click', () => selectBuilding(building.name));
		}
	}

	function selectBuilding(buildingName: string) {
		selectedBuilding = buildingName;

		const building = CAMPUS_BUILDINGS.find(
			(item) => normalize(item.name) === normalize(buildingName)
		);

		if (building && map) {
			map.panTo(building.position);
		}
	}

	function changeView(mode: 'mine' | 'all') {
		viewMode = mode;
		selectedBuilding = '';
		drawMarkers();
	}

	async function claimTicket(ticket: any) {
		try {
			busyTicketId = ticket.id;
			error = '';
			await CampusFixAPI.claimTicket(ticket.id, technicianName);
			await loadTickets();
		} catch (err) {
			console.error('Could not claim ticket:', err);
			error = 'Could not claim this ticket. Please try again.';
		} finally {
			busyTicketId = null;
		}
	}

	async function unclaimTicket(ticket: any) {
		try {
			busyTicketId = ticket.id;
			error = '';
			await CampusFixAPI.unclaimTicket(ticket.id, technicianName);
			await loadTickets();
		} catch (err) {
			console.error('Could not unclaim ticket:', err);
			error = 'Could not unclaim this ticket. Please try again.';
		} finally {
			busyTicketId = null;
		}
	}

	onMount(async () => {
		await loadTickets();

		try {
			leaflet = await import('leaflet');

			map = leaflet
				.map(mapElement, {
					scrollWheelZoom: true
				})
				.fitBounds(CAMPUS_BOUNDS);

			leaflet
				.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap contributors',
					maxZoom: 19
				})
				.addTo(map);

			markerLayer = leaflet.layerGroup().addTo(map);
			drawMarkers();
		} catch (err) {
			console.error('Could not load the map:', err);
			error = 'Could not load the campus map.';
		}

		return () => {
			map?.remove();
		};
	});
</script>

<svelte:head>
	<title>Technician Map | CampusFix</title>
</svelte:head>

<section class="page">
	<header class="page-header">
		<div>
			<p class="eyebrow">Technician workspace</p>
			<h1>Ticket Map</h1>
			<p class="intro">View active maintenance tickets by campus building.</p>
		</div>
	</header>

	<div class="toolbar">
		<div class="view-switch" aria-label="Ticket map filter">
			<button
				class:active={viewMode === 'mine'}
				onclick={() => changeView('mine')}
				aria-pressed={viewMode === 'mine'}
			>
				My assignments
			</button>

			<button
				class:active={viewMode === 'all'}
				onclick={() => changeView('all')}
				aria-pressed={viewMode === 'all'}
			>
				All active tickets
			</button>
		</div>

		<p class="ticket-count">
			<strong>{getVisibleTickets().length}</strong>
			active {getVisibleTickets().length === 1 ? 'ticket' : 'tickets'}
		</p>
	</div>

	{#if error}
		<p class="message error" role="alert">{error}</p>
	{/if}

	{#if loading}
		<p class="message">Loading tickets…</p>
	{/if}

	<div class="map" bind:this={mapElement} aria-label="Campus ticket map"></div>

	<div class="content">
		<section class="building-panel">
			<div class="section-heading">
				<div>
					<h2>Buildings</h2>
					<p>Select a building to see its active tickets.</p>
				</div>
			</div>

			<div class="building-list">
				{#each CAMPUS_BUILDINGS as building}
					{@const buildingTickets = getBuildingTickets(building.name)}
					<button
						class="building-row"
						class:selected={selectedBuilding === building.name}
						onclick={() => selectBuilding(building.name)}
					>
						<span>{building.name}</span>
						<span class="count">{buildingTickets.length}</span>
					</button>
				{/each}
			</div>
		</section>

		<section class="ticket-panel">
			{#if selectedBuilding}
				{@const buildingTickets = getBuildingTickets(selectedBuilding)}
				<div class="section-heading">
					<div>
						<h2>{selectedBuilding}</h2>
						<p>{buildingTickets.length} active ticket(s)</p>
					</div>
					<button class="text-button" onclick={() => (selectedBuilding = '')}>
						Clear selection
					</button>
				</div>

				{#if buildingTickets.length === 0}
					<p class="empty">No active tickets at this building.</p>
				{:else}
					<div class="ticket-list">
						{#each buildingTickets as ticket (ticket.id)}
							<article class="ticket-card">
								<div class="ticket-top">
									<div>
										<p class="ticket-id">Ticket #{ticket.id}</p>
										<h3>{ticket.title}</h3>
									</div>

									<span
										class="status"
										style={`--status-color: ${STATUS_COLOR[ticket.status] ?? '#64748b'}`}
									>
										{ticket.status}
									</span>
								</div>

								<p class="ticket-meta">
									{ticket.category ?? 'General'}
									{#if ticket.room} · Room {ticket.room}{/if}
								</p>

								{#if ticket.priority}
									<p class="ticket-meta">Priority: {ticket.priority}</p>
								{/if}

								{#if ticket.technician}
									<p class="ticket-meta">Assigned to: {ticket.technician}</p>
								{/if}

								{#if !ticket.technician && ticket.status === 'Open'}
									<button
										class="action-button"
										disabled={busyTicketId === ticket.id}
										onclick={() => claimTicket(ticket)}
									>
										{busyTicketId === ticket.id ? 'Claiming…' : 'Claim ticket'}
									</button>
								{:else if
									normalize(ticket.technician) === normalize(technicianName) &&
									ticket.status === 'Assigned'}
									<button
										class="action-button secondary"
										disabled={busyTicketId === ticket.id}
										onclick={() => unclaimTicket(ticket)}
									>
										{busyTicketId === ticket.id ? 'Unclaiming…' : 'Unclaim ticket'}
									</button>
								{/if}
							</article>
						{/each}
					</div>
				{/if}
			{:else}
				<div class="section-heading">
					<div>
						<h2>Choose a building</h2>
						<p>Click a map marker or building name to view its tickets.</p>
					</div>
				</div>
			{/if}
		</section>
	</div>

	{#if getUnmappedTickets().length > 0}
		<section class="unmapped">
			<h2>Tickets without a mapped building</h2>
			<p>
				These active tickets have a building name that is not listed in the campus map data.
			</p>

			<div class="ticket-list">
				{#each getUnmappedTickets() as ticket (ticket.id)}
					<article class="ticket-card">
						<div class="ticket-top">
							<div>
								<p class="ticket-id">Ticket #{ticket.id}</p>
								<h3>{ticket.title}</h3>
							</div>
							<span class="status">{ticket.status}</span>
						</div>

						<p class="ticket-meta">
							Building: {ticket.building || 'Not provided'}
							{#if ticket.room} · Room {ticket.room}{/if}
						</p>

						{#if !ticket.technician && ticket.status === 'Open'}
							<button
								class="action-button"
								disabled={busyTicketId === ticket.id}
								onclick={() => claimTicket(ticket)}
							>
								{busyTicketId === ticket.id ? 'Claiming…' : 'Claim ticket'}
							</button>
						{/if}
					</article>
				{/each}
			</div>
		</section>
	{/if}
</section>

<style>
	.page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 28px;
		color: #17231f;
	}

	.page-header {
		margin-bottom: 22px;
	}

	.eyebrow {
		margin: 0 0 6px;
		color: #176b52;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		margin-bottom: 6px;
		font-size: clamp(1.8rem, 3vw, 2.4rem);
	}

	.intro,
	.section-heading p,
	.ticket-meta {
		color: #61706a;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 14px;
	}

	.view-switch {
		display: flex;
		gap: 8px;
		padding: 5px;
		border: 1px solid #dce4dd;
		border-radius: 12px;
		background: #fff;
	}

	.view-switch button,
	.text-button {
		border: 0;
		background: transparent;
		cursor: pointer;
		font: inherit;
	}

	.view-switch button {
		padding: 9px 13px;
		border-radius: 8px;
		color: #46564f;
	}

	.view-switch button.active {
		background: #176b52;
		color: #fff;
	}

	.ticket-count {
		margin: 0;
		color: #61706a;
	}

	.map {
		z-index: 0;
		width: 100%;
		height: 430px;
		border: 1px solid #dce4dd;
		border-radius: 16px;
		background: #e8efea;
	}

	.content {
		display: grid;
		grid-template-columns: minmax(220px, 0.8fr) minmax(0, 1.7fr);
		gap: 18px;
		margin-top: 18px;
	}

	.building-panel,
	.ticket-panel,
	.unmapped {
		padding: 20px;
		border: 1px solid #dce4dd;
		border-radius: 16px;
		background: #fff;
		box-shadow: 0 8px 24px rgba(26, 46, 37, 0.05);
	}

	.section-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.section-heading h2,
	.unmapped h2 {
		margin-bottom: 5px;
		font-size: 1.1rem;
	}

	.section-heading p,
	.unmapped > p {
		margin-bottom: 14px;
		font-size: 0.9rem;
	}

	.building-list {
		display: grid;
		gap: 7px;
	}

	.building-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 11px 12px;
		border: 1px solid #e3e9e4;
		border-radius: 9px;
		background: #fff;
		color: #17231f;
		text-align: left;
		cursor: pointer;
	}

	.building-row:hover,
	.building-row.selected {
		border-color: #176b52;
		background: #f0f7f2;
	}

	.count {
		display: grid;
		min-width: 25px;
		height: 25px;
		place-items: center;
		border-radius: 999px;
		background: #e8f3ec;
		color: #10543f;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.ticket-list {
		display: grid;
		gap: 12px;
	}

	.ticket-card {
		padding: 15px;
		border: 1px solid #e3e9e4;
		border-radius: 12px;
	}

	.ticket-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	.ticket-top h3 {
		margin-bottom: 8px;
		font-size: 1rem;
	}

	.ticket-id {
		margin-bottom: 4px;
		color: #61706a;
		font-size: 0.78rem;
	}

	.ticket-meta {
		margin-bottom: 5px;
		font-size: 0.88rem;
	}

	.status {
		flex: 0 0 auto;
		padding: 5px 9px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--status-color, #64748b) 12%, white);
		color: var(--status-color, #64748b);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.action-button {
		margin-top: 9px;
		padding: 9px 12px;
		border: 0;
		border-radius: 8px;
		background: #176b52;
		color: #fff;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.action-button.secondary {
		border: 1px solid #dce4dd;
		background: #fff;
		color: #34443c;
	}

	.action-button:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.text-button {
		color: #176b52;
		font-weight: 700;
	}

	.empty,
	.message {
		color: #61706a;
	}

	.message.error {
		color: #aa3d38;
	}

	.unmapped {
		margin-top: 18px;
	}

	:global(.ticket-count-marker) {
		display: grid;
		place-items: center;
		border: 3px solid #fff;
		border-radius: 50%;
		background: #176b52;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
		color: #fff;
		font-size: 0.95rem;
		font-weight: 800;
	}

	:global(.ticket-count-marker span) {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
	}

	@media (max-width: 800px) {
		.page {
			padding: 18px;
		}

		.content {
			grid-template-columns: 1fr;
		}

		.map {
			height: 350px;
		}
	}

	@media (max-width: 520px) {
		.toolbar {
			align-items: flex-start;
			flex-direction: column;
		}

		.view-switch {
			width: 100%;
		}

		.view-switch button {
			flex: 1;
			padding-inline: 8px;
		}
	}
</style>