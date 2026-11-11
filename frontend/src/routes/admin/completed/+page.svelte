
<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.js';
  import { CATEGORIES, STATUS_COLOR } from '$lib/shared.js';

  const statuses = ['All', 'Resolved', 'Closed'];

  let tickets = $state([]);
  let loading = $state(true);
  let error = $state('');

  // Search and filter states
  let search = $state('');
  let category = $state('All');
  let status = $state('All');
  let technician = $state('All');
  let sort = $state('newest');

  // All completed tickets across campus
  let completed = $derived(
    tickets.filter(ticket =>
      ['Resolved', 'Closed'].includes(ticket.status)
    )
  );

  // Administrator statistics
  let resolvedCount = $derived(
    completed.filter(ticket =>
      ticket.status === 'Resolved'
    ).length
  );

  let closedCount = $derived(
    completed.filter(ticket =>
      ticket.status === 'Closed'
    ).length
  );

  let completedCount = $derived(completed.length);

  // Unique technicians with completed tickets
  let technicians = $derived(
    [...new Set(
      completed
        .map(ticket => ticket.technician)
        .filter(Boolean)
    )].sort()
  );

  // Parse completion dates safely
  function completionTime(ticket) {
    if (!ticket.completedAt) return null;

    const time = Date.parse(ticket.completedAt);
    return Number.isNaN(time) ? null : time;
  }

  function completionDate(ticket) {
    const time = completionTime(ticket);

    if (time === null) {
      return 'Not recorded';
    }

    return new Date(time).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Sort by completion date when available,
  // otherwise by the most recent ticket update.
  function sortTime(ticket) {
    return completionTime(ticket) ??
      (Date.parse(ticket.updated || '') || 0);
  }

  // Search, filter and sort completed tickets
  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();

    const results = completed.filter(ticket => {
      const searchable = [
        ticket.id,
        ticket.title,
        ticket.building,
        ticket.room,
        ticket.category,
        ticket.asset,
        ticket.technician,
        ticket.completionNotes
      ]
        .map(value => String(value ?? ''))
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesCategory =
        category === 'All' ||
        ticket.category === category;

      const matchesStatus =
        status === 'All' ||
        ticket.status === status;

      const matchesTechnician =
        technician === 'All' ||
        (technician === 'Unassigned'
          ? !ticket.technician
          : ticket.technician === technician);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesTechnician
      );
    });

    return [...results].sort((a, b) => {
      const aTime = sortTime(a);
      const bTime = sortTime(b);

      if (sort === 'oldest') {
        return aTime - bTime;
      }

      return bTime - aTime;
    });
  });

  // Load data from CampusFix mock API
  onMount(() => {
    try {
      const result = CampusFixAPI.getTickets();

      if (!Array.isArray(result)) {
        throw new Error('Invalid ticket data');
      }

      tickets = result;
    } catch (err) {
      console.error('Unable to load completed tickets:', err);
      error =
        'Unable to load completed tickets. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  function statusColors(value) {
    return STATUS_COLOR[value] ?? STATUS_COLOR.Open;
  }

  // Reset all filters
  function clearFilters() {
    search = '';
    category = 'All';
    status = 'All';
    technician = 'All';
    sort = 'newest';
  }
</script>

<svelte:head>
  <title>Completed Tickets | CampusFix Administrator</title>
</svelte:head>

<main class="content">

  <!-- Page Heading -->
  <div class="page-heading">
    <div>
      <h1 class="headline">Completed tickets</h1>

      <p class="secondary-text">
        Review resolved and closed maintenance requests
        completed across campus.
      </p>
    </div>

    <span class="workspace-label">
      Administrator workspace
    </span>
  </div>

  {#if loading}
    <div class="empty-state" role="status">
      Loading completed tickets…
    </div>

  {:else if error}
    <div class="notice-box" role="alert">
      {error}
    </div>

  {:else}

    <!-- Statistics -->
    <div class="stat-grid admin-stats">

      <div class="stat-card">
        <div class="stat-num">{completedCount}</div>
        <div class="stat-label">Completed tickets</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{resolvedCount}</div>
        <div class="stat-label">Resolved</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{closedCount}</div>
        <div class="stat-label">Closed</div>
      </div>

    </div>

    <!-- Search and Filter Panel -->
    <section
      class="filter-panel"
      aria-label="Search and filter completed tickets"
    >

      <div class="field-block">
        <label
          class="field-label"
          for="completed-search"
        >
          Search completed tickets
        </label>

        <input
          id="completed-search"
          type="text"
          placeholder="Search by ID, title, location, technician, asset or notes"
          bind:value={search}
        />
      </div>

      <!-- Filter Controls -->
      <div class="filter-controls">

        <!-- Category -->
        <div>
          <label
            class="field-label"
            for="category-filter"
          >
            Category
          </label>

          <select
            id="category-filter"
            bind:value={category}
          >
            <option value="All">All categories</option>

            {#each CATEGORIES as item}
              <option value={item.label}>
                {item.label}
              </option>
            {/each}
          </select>
        </div>

        <!-- Status -->
        <div>
          <label
            class="field-label"
            for="status-filter"
          >
            Status
          </label>

          <select
            id="status-filter"
            bind:value={status}
          >
            {#each statuses as value}
              <option value={value}>
                {value === 'All' ? 'All completed' : value}
              </option>
            {/each}
          </select>
        </div>

        <!-- Technician -->
        <div>
          <label
            class="field-label"
            for="technician-filter"
          >
            Technician
          </label>

          <select
            id="technician-filter"
            bind:value={technician}
          >
            <option value="All">All technicians</option>
            <option value="Unassigned">
              Unassigned
            </option>

            {#each technicians as name}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <!-- Sort -->
        <div>
          <label
            class="field-label"
            for="completed-sort"
          >
            Sort by
          </label>

          <select
            id="completed-sort"
            bind:value={sort}
          >
            <option value="newest">
              Most recent
            </option>
            <option value="oldest">
              Oldest first
            </option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button
          class="btn-secondary clear-button"
          type="button"
          onclick={clearFilters}
        >
          Clear filters
        </button>

      </div>
    </section>

    <!-- Results Heading -->
    <div class="results-heading">
      <h2 class="section-title">Campus repair history</h2>

      <span class="secondary-text" role="status">
        Showing {filtered.length} of {completedCount}
      </span>
    </div>

    <!-- Completed Ticket Cards -->
    {#each filtered as ticket (ticket.id)}

      <article
        class="ticket-row completed-ticket"
        style:border-left={
          '4px solid ' + statusColors(ticket.status)[0]
        }
      >

        <!-- Ticket Heading -->
        <div class="ticket-heading">

          <div>
            <div class="ticket-id">
              {ticket.id}
            </div>

            <div class="ticket-title">
              {ticket.title}
            </div>
          </div>

          <span
            class="status-badge"
            style:color={statusColors(ticket.status)[0]}
            style:background={statusColors(ticket.status)[1]}
          >
            {ticket.status}
          </span>
        </div>

        <!-- Location -->
        <div class="ticket-meta">
          {ticket.building || 'Unknown building'}
          ·
          {ticket.room || 'Unknown room'}
        </div>

        <!-- Repair Information -->
        <div class="history-meta">

          <div>
            <span class="meta-label">Category</span>
            <span>{ticket.category || 'Other'}</span>
          </div>

          <div>
            <span class="meta-label">
              Assigned technician
            </span>

            <span class:unassigned={!ticket.technician}>
              {ticket.technician || 'Not assigned'}
            </span>
          </div>

          <div>
            <span class="meta-label">Completed</span>
            <span>{completionDate(ticket)}</span>
          </div>

          <div>
            <span class="meta-label">Asset</span>
            <span>{ticket.asset || 'Not specified'}</span>
          </div>

        </div>

        <!-- Completion Notes -->
        <div class="repair-notes">
          <div class="notes-label">
            Work completed
          </div>

          <p>
            {ticket.completionNotes ||
              'No completion notes recorded.'}
          </p>
        </div>

        <!-- Footer -->
        <div class="ticket-footer">

          <span class="ticket-meta">
            Last updated {ticket.updated || 'Unknown'}
          </span>

          <a
            class="details-button"
            href={'/tickets/' + encodeURIComponent(ticket.id)}
            aria-label={'View details for ticket ' + ticket.id}
          >
            View repair details
          </a>

        </div>

      </article>

    {:else}
      <div class="empty-state">
        {#if completedCount === 0}
          No completed maintenance tickets have been recorded.
        {:else}
          No completed tickets match your search or filters.
        {/if}
      </div>
    {/each}

  {/if}

</main>

<style>
  .page-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
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

  .workspace-label {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 10px;
    color: var(--secondary);
    font-size: 11px;
    white-space: nowrap;
  }

  /* Statistics */

  .admin-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .admin-stats .stat-card {
    background: var(--bg-alt);
    padding: 16px 10px;
  }

  .admin-stats .stat-label {
    color: var(--secondary);
  }

  /* Filter Panel */

  .filter-panel {
    padding: 16px;
    margin-bottom: 22px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-alt);
  }

  .filter-controls {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr)) auto;
    align-items: end;
    gap: 12px;
  }

  .clear-button {
    width: auto;
    min-height: 38px;
    padding: 9px 14px;
  }

  /* Results */

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

  /* Completed Ticket Cards */

  .completed-ticket {
    padding: 18px;
    margin-bottom: 14px;
    cursor: default;
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

  /* Repair Information */

  .history-meta {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin: 16px 0;
    font-size: 13px;
  }

  .history-meta > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .meta-label {
    display: block;
    margin-bottom: 4px;
    color: var(--secondary);
    font-size: 11px;
  }

  .unassigned {
    color: var(--warning);
  }

  /* Repair Notes */

  .repair-notes {
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-alt);
  }

  .notes-label {
    font-size: 12px;
    font-weight: 600;
  }

  .repair-notes p {
    margin: 6px 0 0;
    color: var(--secondary);
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Footer */

  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }

  .details-button {
    display: inline-block;
    padding: 9px 14px;
    border-radius: var(--radius);
    background: var(--green);
    color: #EAF2EF;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
  }

  .details-button:hover {
    background: var(--green-accent);
  }

  .completed-ticket:hover {
    background: var(--bg-alt);
  }

  /* Responsive */

  @media (max-width: 900px) {
    .filter-controls {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

    .clear-button {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .page-heading {
      flex-direction: column;
    }

    .filter-controls {
      grid-template-columns: 1fr;
    }

    .ticket-heading {
      flex-wrap: wrap;
    }

    .history-meta {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .admin-stats {
      grid-template-columns: 1fr;
    }
  }
</style>
