<script>
  import { onMount } from 'svelte';
  import { CampusFixAPI } from '$lib/api.js';
  import { STATUS_COLOR } from '$lib/shared.js';

  const priorityOrder = {
    High: 0,
    Medium: 1,
    Low: 2
  };

  let tickets = $state([]);
  let loading = $state(true);
  let error = $state('');

  // Administrator can view all campus tickets.
  let totalTickets = $derived(tickets.length);

  let pending = $derived(
    tickets.filter(ticket =>
      ticket.status === 'Open' || 
      (ticket.status === 'Assigned' && !ticket.technician)
    )
  );

  let inProgress = $derived(
    tickets.filter(ticket =>
      ticket.status === 'In progress'
    )
  );

  let resolved = $derived(
    tickets.filter(ticket =>
      ['Resolved', 'Closed'].includes(ticket.status)
    )
  );

  let active = $derived(
    tickets.filter(ticket =>
      ['Open', 'Assigned', 'In progress'].includes(ticket.status)
    )
  );

  let highPriority = $derived(
    active.filter(ticket => ticket.priority === 'High')
  );

  // Tickets requiring administrator attention.
  let attentionQueue = $derived(
    [...active]
      .sort((a, b) => {
        const aUnassigned = !a.technician ? 0 : 1;
        const bUnassigned = !b.technician ? 0 : 1;

        if (aUnassigned !== bUnassigned) {
          return aUnassigned - bUnassigned;
        }

        return (
          (priorityOrder[a.priority] ?? 3) -
          (priorityOrder[b.priority] ?? 3)
        );
      })
      .slice(0, 4)
  );

  // Recently completed tickets across campus.
  let recentlyResolved = $derived(
    [...resolved]
      .sort((a, b) =>
        (Date.parse(b.updated) || 0) -
        (Date.parse(a.updated) || 0)
      )
      .slice(0, 3)
  );

  onMount(() => {
    try {
      const result = CampusFixAPI.getTickets();

      if (!Array.isArray(result)) {
        throw new Error('Invalid ticket data');
      }

      tickets = result;
    } catch (err) {
      console.error('Failed to load tickets:', err);
      error = 'Unable to load tickets. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  function statusColors(status) {
    return STATUS_COLOR[status] ?? STATUS_COLOR.Open;
  }
</script>

<svelte:head>
  <title>Administrator Dashboard | CampusFix</title>
</svelte:head>

<main class="content">

  <!-- Dashboard Heading -->
  <div class="dashboard-heading">
    <div>
      <h1 class="headline">Administrator dashboard</h1>
      <p class="secondary-text">
        Manage campus maintenance requests and monitor ticket activity.
      </p>
    </div>

    <span class="workspace-label">Administrator workspace</span>
  </div>

  {#if loading}
    <div class="empty-state" role="status">
      Loading campus tickets...
    </div>

  {:else if error}
    <div class="notice-box" role="alert">{error}</div>

  {:else}

    <!-- Statistics Cards -->
    <div class="stat-grid admin-stats">

      <div class="stat-card">
        <div class="stat-num">{totalTickets}</div>
        <div class="stat-label">Total tickets</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{pending.length}</div>
        <div class="stat-label">Pending assignment</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{inProgress.length}</div>
        <div class="stat-label">In progress</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{resolved.length}</div>
        <div class="stat-label">Resolved / closed</div>
      </div>

    </div>

    <!-- High Priority Notice -->
    {#if highPriority.length > 0}
      <div class="priority-notice" role="status">
        <strong>{highPriority.length} high-priority ticket(s)</strong>
        require attention.
      </div>
    {/if}

    <!-- Dashboard Panels -->
    <div class="dashboard-columns">

      <!-- Tickets Needing Attention -->
      <section
        class="dashboard-panel"
        aria-labelledby="attention-title"
      >
        <div class="section-heading">
          <h2 id="attention-title" class="section-title">
            Tickets needing attention
          </h2>

          <a class="section-link" href="#all-tickets">
            View all
          </a>
        </div>

        <p class="panel-description secondary-text">
          Active maintenance requests, with unassigned tickets first.
        </p>

        {#each attentionQueue as ticket (ticket.id)}
          <a
            class="ticket-row"
            style:border-left={'4px solid ' + statusColors(ticket.status)[0]}
            href={'/tickets/' + encodeURIComponent(ticket.id)}
          >

            <div class="top">
              <span class="ticket-id">{ticket.id}</span>

              <span
                class="status-tag"
                style:color={statusColors(ticket.status)[0]}
              >
                {ticket.status}
              </span>
            </div>

            <div class="ticket-title queue-title">
              {ticket.title}
            </div>

            <div class="ticket-meta">
              {ticket.building || 'Unknown building'}
              ·
              {ticket.room || 'Unknown room'}
            </div>

            <div class="queue-footer">
              <span class="secondary-text">
                {ticket.category}
              </span>

              <span
                class="priority-label"
                class:high={ticket.priority === 'High'}
              >
                {ticket.priority
                  ? `${ticket.priority} priority`
                  : 'Not prioritized'}
              </span>
            </div>

            <div class="ticket-meta technician-info">
              Technician: {ticket.technician || 'Not assigned'}
            </div>

          </a>
        {:else}
          <div class="empty-state">
            No active maintenance tickets.
          </div>
        {/each}

      </section>

      <!-- Recently Resolved -->
      <section
        class="dashboard-panel"
        aria-labelledby="resolved-title"
      >
        <div class="section-heading">
          <h2 id="resolved-title" class="section-title">
            Recently resolved
          </h2>

          <a class="section-link" href="#all-tickets">
            View all
          </a>
        </div>

        <p class="panel-description secondary-text">
          Recently completed maintenance requests across campus.
        </p>

        {#each recentlyResolved as ticket (ticket.id)}
          <a
            class="completed-item"
            href={'/tickets/' + encodeURIComponent(ticket.id)}
          >

            <span class="ticket-id">{ticket.id}</span>

            <div class="ticket-title">
              {ticket.title}
            </div>

            <div class="ticket-meta">
              {ticket.building} · {ticket.room}
            </div>

            <div class="ticket-meta">
              Technician: {ticket.technician || 'Not assigned'}
            </div>

            <div class="ticket-meta">
              Last updated: {ticket.updated || 'Unknown'}
            </div>

          </a>
        {:else}
          <div class="empty-state">
            No resolved tickets yet.
          </div>
        {/each}

      </section>
    </div>

    <!-- All Tickets Section -->
    <section
      class="dashboard-panel all-tickets"
      id="all-tickets"
      aria-labelledby="all-tickets-title"
    >
      <div class="section-heading">
        <h2 id="all-tickets-title" class="section-title">
          All campus tickets
        </h2>
        <span class="ticket-count">{totalTickets} total</span>
      </div>

      <p class="panel-description secondary-text">
        Overview of all submitted campus maintenance requests.
      </p>

      {#each tickets as ticket (ticket.id)}
        <a
          class="ticket-row"
          href={'/tickets/' + encodeURIComponent(ticket.id)}
          style:border-left={'4px solid ' + statusColors(ticket.status)[0]}
        >
          <div class="top">
            <span class="ticket-id">{ticket.id}</span>
            <span
              class="status-tag"
              style:color={statusColors(ticket.status)[0]}
            >
              {ticket.status}
            </span>
          </div>

          <div class="ticket-title queue-title">{ticket.title}</div>

          <div class="ticket-meta">
            {ticket.building} · {ticket.room}
          </div>

          <div class="queue-footer">
            <span>
              {ticket.technician || 'Unassigned'}
            </span>
            <span
              class="priority-label"
              class:high={ticket.priority === 'High'}
            >
              {ticket.priority || 'No priority'}
            </span>
          </div>
        </a>
      {:else}
        <div class="empty-state">
          No campus tickets have been submitted.
        </div>
      {/each}

    </section>

  {/if}

</main>

<style>
  .dashboard-heading {
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

  .dashboard-heading p {
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

  .dashboard-columns {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
    gap: 20px;
  }

  .dashboard-panel {
    min-width: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    background: var(--bg);
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }

  .section-heading h2 {
    margin: 0;
    font-size: 19px;
  }

  .section-link {
    color: var(--ink);
    font-size: 12px;
    text-underline-offset: 3px;
    white-space: nowrap;
  }

  .panel-description {
    margin: 0 0 14px;
    font-size: 12px;
    line-height: 1.5;
  }

  .queue-title {
    margin-top: 8px;
  }

  .queue-footer {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    font-size: 11px;
  }

  .priority-label {
    color: var(--secondary);
    font-weight: 600;
  }

  .priority-label.high {
    color: var(--danger);
  }

  .technician-info {
    margin-top: 8px;
    font-size: 11px;
  }

  .priority-notice {
    background: var(--warning-bg);
    color: var(--warning);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .completed-item {
    display: block;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
    color: inherit;
    text-decoration: none;
  }

  .completed-item .ticket-title {
    margin-top: 5px;
  }

  .ticket-row:hover,
  .completed-item:hover {
    background: var(--bg-alt);
  }

  .all-tickets {
    margin-top: 20px;
    scroll-margin-top: 20px;
  }

  .ticket-count {
    color: var(--secondary);
    font-size: 12px;
  }

  @media (max-width: 700px) {
    .dashboard-columns {
      grid-template-columns: 1fr;
    }

    .dashboard-heading {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .admin-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
