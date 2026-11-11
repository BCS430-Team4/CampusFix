<script>
  import { CampusFixAPI } from '../api.js';
  import TicketRow from '../components/TicketRow.svelte';
  const filters = ['All', 'Open', 'Assigned', 'In progress', 'Resolved', 'Closed'];
  const tickets = CampusFixAPI.getTickets();
  let filter = $state('All');
  let search = $state('');
  let filtered = $derived(tickets.filter(t =>
    (filter === 'All' || t.status === filter) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.building.toLowerCase().includes(search.toLowerCase()))
  ));
</script>

<input type="text" aria-label="Search your tickets" placeholder="Search your tickets" bind:value={search} style="margin-bottom:12px;" />
<div class="filter-row" aria-label="Ticket status filters">
  {#each filters as value}<button class="chip" class:active={filter === value} aria-pressed={filter === value} onclick={() => filter = value}>{value}</button>{/each}
</div>
{#each filtered as ticket (ticket.id)}<TicketRow {ticket} />
{:else}<div class="empty-state">No tickets match this view.</div>{/each}

