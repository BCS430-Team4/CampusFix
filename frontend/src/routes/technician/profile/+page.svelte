<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { CampusFixAPI, type Ticket } from '$lib/api';

	const technicianName = 'J. Delgado';
	let tickets = $state<Ticket[]>([]);
	let loading = $state(true);
	let error = $state('');
	let assigned = $derived(tickets.filter((ticket) => ticket.technician === technicianName));
	let active = $derived(
		assigned.filter((ticket) => ['Open', 'Assigned', 'In progress'].includes(ticket.status))
	);
	let statistics = $derived([
		{ label: 'Active assignments', value: active.length },
		{
			label: 'In progress',
			value: active.filter((ticket) => ticket.status === 'In progress').length
		},
		{ label: 'High priority', value: active.filter((ticket) => ticket.priority === 'High').length },
		{
			label: 'Resolved tickets',
			value: assigned.filter((ticket) => ticket.status === 'Resolved').length
		}
	]);

	onMount(async () => {
		try {
			tickets = await CampusFixAPI.getTickets();
		} catch {
			error = 'Unable to load technician statistics. Please refresh and try again.';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head><title>Technician Profile | CampusFix</title></svelte:head>

<main class="content technician-profile">
	<h1 class="headline">Technician profile</h1>
	<section class="profile-card" aria-labelledby="technician-name">
		<div class="profile-avatar" aria-hidden="true">JD</div>
		<div>
			<h2 id="technician-name" class="headline">{technicianName}</h2>
			<p class="secondary-text">Technician</p>
			<p class="secondary-text">Demo profile. Account information is not connected yet.</p>
		</div>
	</section>
	<section aria-labelledby="workload-title">
		<h2 id="workload-title" class="section-title">Your workload</h2>
		{#if loading}
			<p class="empty-state" role="status">Loading your statistics…</p>
		{:else if error}
			<p class="notice-box" role="alert">{error}</p>
		{:else}
			<div class="stat-grid profile-stats">
				{#each statistics as statistic (statistic.label)}
					<div class="stat-card">
						<div class="stat-num">{statistic.value}</div>
						<div class="stat-label">{statistic.label}</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
	<nav class="profile-links" aria-label="Technician workload">
		<a href={resolve('/technician/assigned')}>View assigned tickets</a>
		<a href={resolve('/technician/completed')}>View completed tickets</a>
	</nav>
</main>

<style>
	.technician-profile {
		max-width: 960px;
		margin: 0 auto;
	}
	h1 {
		margin: 0 0 22px;
		font-size: 28px;
	}
	.profile-card {
		display: flex;
		align-items: center;
		gap: 18px;
		padding: 22px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		margin-bottom: 26px;
	}
	.profile-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--green);
		color: #eaf2ef;
		font-size: 22px;
		font-weight: 600;
	}
	h2 {
		margin: 0;
		font-size: 24px;
	}
	.profile-card p {
		margin: 6px 0 0;
		font-size: 13px;
		line-height: 1.5;
	}
	.profile-stats {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
	.stat-card {
		background: var(--bg);
	}
	.profile-links {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 24px;
		margin-top: 24px;
	}
	.profile-links a {
		color: var(--green-accent);
		font-size: 14px;
		text-underline-offset: 3px;
	}
	@media (max-width: 600px) {
		.profile-stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.profile-card {
			align-items: flex-start;
			padding: 16px;
		}
	}
</style>
