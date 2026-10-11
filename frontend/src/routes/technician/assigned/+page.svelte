<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.js';
  import { STATUS_COLOR } from '$lib/shared.js';

  const technicianName = 'J. Delgado';
  const statuses = ['All', 'Assigned', 'In progress', 'Open'];
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  let tickets = $state([]);
  let loading = $state(true);
  let error = $state('');

  let search = $state('');
  let status = $state('All');
  let priority = $state('All');
  let sort = $state('priority');

  let assigned = $derived(
    tickets.filter(ticket =>
      ticket.technician === technicianName &&
      ['Open', 'Assigned', 'In progress'].includes(ticket.status)
    )
  );

  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();

    const results = assigned.filter(ticket => {
      const searchable = [
        ticket.id,
        ticket.title,
        ticket.building,
        ticket.room,
        ticket.category
      ].join(' ').toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (status === 'All' || ticket.status === status) &&
        (priority === 'All' || ticket.priority === priority)
      );
    });

    return results.sort((a, b) => {
      if (sort === 'newest') {
        return Date.parse(b.created) - Date.parse(a.created);
      }

      if (sort === 'oldest') {
        return Date.parse(a.created) - Date.parse(b.created);
      }

      return (
        (priorityOrder[a.priority] ?? 3) -
        (priorityOrder[b.priority] ?? 3)
      );
    });
  });

  onMount(() => {
    try {
      tickets = CampusFixAPI.getTickets();
    } catch {
      error = 'Unable to load assigned tickets. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  function statusColors(value) {
    return STATUS_COLOR[value] || STATUS_COLOR.Open;
  }

  function clearFilters() {
    search = '';
    status = 'All';
    priority = 'All';
    sort = 'priority';
  }
</script>

<svelte:head>
  <title>Assigned Tickets | CampusFix</title>
</svelte:head>

<main class="content">
  <div class="page-heading">
    <h1 class="headline">Assigned tickets</h1>
    <p class="secondary-text">
      Find and organize your active repair assignments.
    </p>
  </div>

  {#if loading}
    <div class="empty-state" role="status">Loading assigned tickets…</div>
  {:else if error}
    <div class="notice-box" role="alert">{error}</div>
  {:else}
    <section class="filter-panel" aria-label="Search and filter tickets">
      <div class="field-block">
        <label class="field-label" for="ticket-search">Search tickets</label>
        <input
          id="ticket-search"
          type="text"
          placeholder="Search by ID, title, location, or category"
          bind:value={search}
        />
      </div>

      <div class="filter-row" aria-label="Status filters">
        {#each statuses as value}
          <button
            type="button"
            class="chip"
            class:active={status === value}
            aria-pressed={status === value}
            onclick={() => status = value}
          >
            {value === 'All' ? 'All active' : value}
          </button>
        {/each}
      </div>

      <div class="filter-controls">
        <div>
          <label class="field-label" for="priority-filter">Priority</label>
          <select id="priority-filter" bind:value={priority}>
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label class="field-label" for="ticket-sort">Sort by</label>
          <select id="ticket-sort" bind:value={sort}>
            <option value="priority">Highest priority</option>
            <option value="newest">Newest reported</option>
            <option value="oldest">Oldest reported</option>
          </select>
        </div>

        <button
          class="btn-secondary clear-button"
          type="button"
          onclick={clearFilters}
        >
          Clear filters
        </button>
      </div>
    </section>

    <div class="results-heading">
      <h2 class="section-title">Active assignments</h2>
      <span class="secondary-text" role="status">
        Showing {filtered.length} of {assigned.length}
      </span>
    </div>

    {#each filtered as ticket (ticket.id)}
      <a
        class="ticket-row assigned-ticket"
        style:border-left={'4px solid ' + statusColors(ticket.status)[0]}
        href={'/technician/tickets/' + encodeURIComponent(ticket.id)}
      >
        <div class="ticket-heading">
          <div>
            <div class="ticket-id">{ticket.id}</div>
            <div class="ticket-title">{ticket.title}</div>
          </div>

          <span
            class="status-badge"
            style:color={statusColors(ticket.status)[0]}
            style:background={statusColors(ticket.status)[1]}
          >
            {ticket.status}
          </span>
        </div>

        <div class="ticket-meta">
          {ticket.building} · {ticket.room}
        </div>

        <p class="ticket-description secondary-text">
          {ticket.description || 'No description provided.'}
        </p>

        <div class="ticket-footer">
          <div class="ticket-labels">
            <span class="category-label">{ticket.category}</span>
            <span
              class="priority-label"
              class:high={ticket.priority === 'High'}
              class:medium={ticket.priority === 'Medium'}
            >
              {ticket.priority
                ? `${ticket.priority} priority`
                : 'Not prioritized'}
            </span>
          </div>

          <span class="ticket-meta">Reported {ticket.created}</span>
        </div>
      </a>
    {:else}
      <div class="empty-state">
        {#if assigned.length === 0}
          You have no active assignments.
        {:else}
          No tickets match your search or filters.
        {/if}
      </div>
    {/each}
  {/if}
</main>

<style>
  .page-heading {
    margin-bottom: 22px;
  }

  h1 {
    margin: 0;
    font-size: 28px;
  }

  .page-heading p {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.5;
  }

  .filter-panel {
    padding: 16px;
    margin-bottom: 22px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-alt);
  }

  .filter-controls {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    align-items: end;
    gap: 12px;
  }

  .clear-button {
    width: auto;
    min-height: 38px;
    padding: 9px 14px;
  }

  .results-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .results-heading h2 {
    margin: 0;
    font-size: 19px;
  }

  .results-heading span {
    font-size: 12px;
  }

  .assigned-ticket {
    padding: 16px;
    margin-bottom: 12px;
  }

  .ticket-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
  }

  .ticket-heading .ticket-title {
    margin-top: 5px;
    font-size: 16px;
  }

  .status-badge {
    flex-shrink: 0;
  }

  .ticket-description {
    margin: 12px 0;
    font-size: 13px;
    line-height: 1.5;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }

  .ticket-labels {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 11px;
  }

  .category-label {
    color: var(--secondary);
    background: var(--bg-alt);
    border-radius: 999px;
    padding: 4px 9px;
  }

  .priority-label {
    color: var(--secondary);
    font-weight: 600;
  }

  .priority-label.high {
    color: var(--danger);
  }

  .priority-label.medium {
    color: var(--warning);
  }

  .assigned-ticket:hover {
    background: var(--bg-alt);
  }

  @media (max-width: 600px) {
    .filter-controls {
      grid-template-columns: 1fr;
    }

    .clear-button {
      width: 100%;
    }

    .ticket-heading {
      flex-wrap: wrap;
    }
  }
</style>
