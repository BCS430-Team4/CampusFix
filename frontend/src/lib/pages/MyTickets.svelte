<script lang="ts">
	import { CampusFixAPI, type Ticket } from '../api';
	import TicketRow from '../components/TicketRow.svelte';
	import { onMount } from 'svelte';
	const filters = ['All', 'Open', 'Assigned', 'In progress', 'Resolved', 'Closed'];
	let tickets = $state<Ticket[]>([]);
	let loading = $state(true);
	let error = $state('');
	let filter = $state('All');
	let search = $state('');
	let filtered = $derived(
		tickets.filter(
			(t) =>
				(filter === 'All' || t.status === filter) &&
				(!search ||
					t.title.toLowerCase().includes(search.toLowerCase()) ||
					t.building.toLowerCase().includes(search.toLowerCase()))
		)
	);

	onMount(async () => {
		try {
			tickets = await CampusFixAPI.getTickets();
		} catch {
			error = 'Unable to load your tickets. Please refresh and try again.';
		} finally {
			loading = false;
		}
	});
</script>

<input
	type="text"
	aria-label="Search your tickets"
	placeholder="Search your tickets"
	bind:value={search}
	style="margin-bottom:12px;"
/>
<div class="filter-row" aria-label="Ticket status filters">
	{#each filters as value (value)}<button
			class="chip"
			class:active={filter === value}
			aria-pressed={filter === value}
			onclick={() => (filter = value)}>{value}</button
		>{/each}
</div>
{#if loading}<div class="empty-state" role="status">Loading your tickets…</div>
{:else if error}<div class="notice-box" role="alert">{error}</div>
{:else}{#each filtered as ticket (ticket.id)}<TicketRow {ticket} />
	{:else}<div class="empty-state">No tickets match this view.</div>{/each}{/if}
