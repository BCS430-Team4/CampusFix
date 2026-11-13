<script lang="ts">
	import { resolve } from '$app/paths';
	import { CampusFixAPI } from '$lib/api.js';
	import { greeting } from '$lib/shared.js';
	import TicketRow from '$lib/components/TicketRow.svelte';

	interface DashboardTicket {
		id: string;
		title: string;
		building: string;
		room: string;
		status: 'Open' | 'Assigned' | 'In progress' | 'Resolved' | 'Closed';
		updated: string;
	}

	const tickets: DashboardTicket[] = CampusFixAPI.getTickets();
	const active = tickets.filter((ticket) =>
		['Open', 'Assigned', 'In progress'].includes(ticket.status)
	);
	const resolved = tickets
		.filter((ticket) => ['Resolved', 'Closed'].includes(ticket.status))
		.slice(0, 2);
</script>

<svelte:head><title>Student dashboard — CampusFix</title></svelte:head>

<main class="content">
	<div style="margin-bottom:18px;">
		<h1 class="headline" style="font-size:22px;margin:0;">{greeting()}</h1>
		<div class="muted" style="font-size:13px;margin-top:2px;">
			You have {active.length} active report{active.length === 1 ? '' : 's'}
		</div>
	</div>
	<a class="card-cta" href={resolve('/report')}>
		<div class="cta-icon">+</div>
		<div>
			<div style="font-size:15px;font-weight:600;">Report an issue</div>
			<div class="muted" style="font-size:13px;">Takes about a minute</div>
		</div>
	</a>
	<h2 class="section-title">Active tickets</h2>
	{#each active.slice(0, 3) as ticket (ticket.id)}<TicketRow {ticket} />
	{:else}<div class="empty-state">No active tickets right now.</div>{/each}
	<h2 class="section-title" style="margin-top:18px;">Recently resolved</h2>
	{#each resolved as ticket (ticket.id)}
		<a class="resolved-row" href={resolve('/tickets/[id]', { id: ticket.id })}>
			<span><span class="ticket-id">{ticket.id}</span> &nbsp; {ticket.title}</span>
			<span class="muted">{ticket.status} · {ticket.updated}</span>
		</a>
	{:else}<div class="empty-state">Nothing resolved yet.</div>{/each}
</main>
