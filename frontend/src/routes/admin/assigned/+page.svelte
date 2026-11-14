
<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.ts';
  import { STATUS_COLOR } from '$lib/shared.js';

  // Administrator can filter through every ticket status.
  const statuses = [
    'All',
    'Open',
    'Assigned',
    'In progress',
    'Resolved',
    'Closed'
  ];

  const priorityOrder = {
    High: 0,
    Medium: 1,
    Low: 2
  };

  let tickets = $state([]);
  let loading = $state(true);
  let error = $state('');

  // Search and filter states.
  let search = $state('');
  let status = $state('All');
  let priority = $state('All');
  let technician = $state('All');
  let sort = $state('newest');

  // Get technician names from existing tickets.
  let technicians = $derived(
    [...new Set(
      tickets
        .map(ticket => ticket.technician)
        .filter(Boolean)
    )].sort()
  );

  // Administrator statistics.
  let totalTickets = $derived(tickets.length);

  let openTickets = $derived(
    tickets.filter(ticket => ticket.status === 'Open')
  );

  let inProgressTickets = $derived(
    tickets.filter(ticket => ticket.status === 'In progress')
  );

  let completedTickets = $derived(
    tickets.filter(ticket =>
      ['Resolved', 'Closed'].includes(ticket.status)
    )
  );

  // Search, filter, and sort all campus tickets.
  let filtered = $derived.by(() => {
    const query = search.trim().toLowerCase();

    const results = tickets.filter(ticket => {
      const searchable = [
        ticket.id,
        ticket.title,
        ticket.building,
        ticket.room,
        ticket.category,
        ticket.description,
        ticket.technician
      ]
        .map(value => String(value ?? ''))
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesStatus =
        status === 'All' || ticket.status === status;

      const matchesPriority =
        priority === 'All' ||
        (priority === 'None'
          ? !ticket.priority
          : ticket.priority === priority);

      const matchesTechnician =
        technician === 'All' ||
        (technician === 'Unassigned'
          ? !ticket.technician
          : ticket.technician === technician);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesTechnician
      );
    });

    return [...results].sort((a, b) => {
      if (sort === 'newest') {
        return (
          (Date.parse(b.created) || 0) -
          (Date.parse(a.created) || 0)
        );
      }

      if (sort === 'oldest') {
        return (
          (Date.parse(a.created) || 0) -
          (Date.parse(b.created) || 0)
        );
      }

      if (sort === 'priority') {
        return (
          (priorityOrder[a.priority] ?? 3) -
          (priorityOrder[b.priority] ?? 3)
        );
      }

      return 0;
    });
  });

  // Load campus tickets when the page opens.
  onMount(async () => {
    try {
      const result = await CampusFixAPI.getTickets();

      if (!Array.isArray(result)) {
        throw new Error('Invalid ticket data');
      }

      tickets = result;
    } catch (err) {
      console.error('Unable to load campus tickets:', err);
      error =
        'Unable to load campus tickets. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  // Get the shared status color and background.
  function statusColors(value) {
    return STATUS_COLOR[value] ?? STATUS_COLOR.Open;
  }

  // Reset all search and filter settings.
  function clearFilters() {
    search = '';
    status = 'All';
    priority = 'All';
    technician = 'All';
    sort = 'newest';
  }
</script>

<svelte:head>
  <title>All Tickets | CampusFix Administrator</title>
</svelte:head>

<main class="content">

  <!-- Page Heading -->
  <div class="page-heading">
    <div>
      <h1 class="headline">All campus tickets</h1>
      <p class="secondary-text">
        View, search, and organize maintenance requests
        submitted across campus.
      </p>
    </div>

    <span class="workspace-label">
      Administrator workspace
    </span>
  </div>

  {#if loading}
    <div class="empty-state" role="status">
      Loading campus tickets…
    </div>

  {:else if error}
    <div class="notice-box" role="alert">
      {error}
    </div>

  {:else}

    <!-- Administrator Ticket Statistics -->
    <div class="stat-grid admin-stats">
      <div class="stat-card">
        <div class="stat-num">{totalTickets}</div>
        <div class="stat-label">Total tickets</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{openTickets.length}</div>
        <div class="stat-label">Open</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{inProgressTickets.length}</div>
        <div class="stat-label">In progress</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{completedTickets.length}</div>
        <div class="stat-label">Resolved / closed</div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <section
      class="filter-panel"
      aria-label="Search and filter campus tickets"
    >

      <div class="field-block">
        <label
          class="field-label"
          for="ticket-search"
        >
          Search tickets
        </label>

        <input
          id="ticket-search"
          type="text"
          placeholder="Search by ID, title, location, category, or technician"
          bind:value={search}
        />
      </div>

      <!-- Status Filters -->
      <div class="filter-row" aria-label="Status filters">
        {#each statuses as value}
          <button
            type="button"
            class="chip"
            class:active={status === value}
            aria-pressed={status === value}
            onclick={() => status = value}
          >
            {value === 'All' ? 'All tickets' : value}
          </button>
        {/each}
      </div>

      <!-- Additional Filters -->
      <div class="filter-controls">

        <div>
          <label
            class="field-label"
            for="priority-filter"
          >
            Priority
          </label>

          <select
            id="priority-filter"
            bind:value={priority}
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="None">Not prioritized</option>
          </select>
        </div>

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
            <option value="Unassigned">Unassigned</option>

            {#each technicians as name}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </div>

        <div>
          <label
            class="field-label"
            for="ticket-sort"
          >
            Sort by
          </label>

          <select
            id="ticket-sort"
            bind:value={sort}
          >
            <option value="newest">Newest reported</option>
            <option value="oldest">Oldest reported</option>
            <option value="priority">Highest priority</option>
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

    <!-- Ticket Results -->
    <div class="results-heading">
      <h2 class="section-title">Maintenance tickets</h2>

      <span class="secondary-text" role="status">
        Showing {filtered.length} of {totalTickets}
      </span>
    </div>

    <!-- All Tickets -->
    {#each filtered as ticket (ticket.id)}
      <article
        class="ticket-row admin-ticket"
        style:border-left={
          '4px solid ' + statusColors(ticket.status)[0]
        }
      >

        <!-- Ticket Heading -->
        <div class="ticket-heading">
          <div>
            <div class="ticket-id">{ticket.id}</div>

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

        <!-- Ticket Location -->
        <div class="ticket-meta">
          {ticket.building || 'Unknown building'}
          ·
          {ticket.room || 'Unknown room'}
        </div>

        <!-- Ticket Description -->
        <p class="ticket-description secondary-text">
          {ticket.description || 'No description provided.'}
        </p>

        <!-- Ticket Details -->
        <div class="ticket-details">
          <div>
            <span class="detail-label">Category</span>
            <span class="detail-value">
              {ticket.category || 'Other'}
            </span>
          </div>

          <div>
            <span class="detail-label">Assigned technician</span>
            <span
              class="detail-value"
              class:unassigned={!ticket.technician}
            >
              {ticket.technician || 'Unassigned'}
            </span>
          </div>

          <div>
            <span class="detail-label">Priority</span>
            <span
              class="detail-value priority-label"
              class:high={ticket.priority === 'High'}
              class:medium={ticket.priority === 'Medium'}
            >
              {ticket.priority || 'Not prioritized'}
            </span>
          </div>
        </div>

        <!-- Ticket Footer -->
        <div class="ticket-footer">
          <span class="ticket-meta">
            Reported {ticket.created || 'Unknown'}
          </span>

          <a
            class="view-button"
            href={'/tickets/' + encodeURIComponent(ticket.id)}
            aria-label={'View ticket ' + ticket.id}
          >
            View details
          </a>
        </div>

      </article>
    {:else}
      <div class="empty-state">
        {#if totalTickets === 0}
          No campus maintenance tickets have been submitted.
        {:else}
          No tickets match your search or filters.
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
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
    grid-template-columns: 1fr 1fr 1fr auto;
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

  /* Ticket Cards */

  .admin-ticket {
    padding: 16px;
    margin-bottom: 12px;
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

  /* Ticket Details */

  .ticket-details {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin: 16px 0;
  }

  .ticket-details > div {
    min-width: 0;
  }

  .detail-label {
    display: block;
    font-size: 11px;
    color: var(--secondary);
    margin-bottom: 5px;
  }

  .detail-value {
    display: block;
    font-size: 13px;
    color: var(--ink);
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  .detail-value.unassigned {
    color: var(--warning);
  }

  .priority-label.high {
    color: var(--danger);
  }

  .priority-label.medium {
    color: var(--warning);
  }

  /* Ticket Footer */

  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    border-top: 1px solid var(--border);
    padding-top: 12px;
  }

  .view-button {
    display: inline-block;
    text-decoration: none;
    background: var(--green);
    color: #EAF2EF;
    border-radius: var(--radius);
    padding: 9px 15px;
    font-size: 12px;
    font-weight: 600;
  }

  .view-button:hover {
    background: var(--green-accent);
  }

  .admin-ticket:hover {
    background: var(--bg-alt);
  }

  /* Responsive Layout */

  @media (max-width: 900px) {
    .filter-controls {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .clear-button {
      width: 100%;
    }
  }

  @media (max-width: 600px) {
    .filter-controls {
      grid-template-columns: 1fr;
    }

    .page-heading {
      flex-direction: column;
    }

    .ticket-heading {
      flex-wrap: wrap;
    }

    .ticket-details {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  @media (max-width: 480px) {
    .admin-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
