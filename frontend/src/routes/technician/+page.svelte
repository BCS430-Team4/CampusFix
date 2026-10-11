<script>
    import { onMount } from 'svelte';
    import { CampusFixAPI } from '$lib/api.js';
    import { STATUS_COLOR } from '$lib/shared.js';

    const technicianName = 'J. Delgado';
    const priorityOrder = {High: 0, Medium: 1, Low: 2};

    let tickets = $state([]);
    let loading = $state(true);
    let error = $state('');

    let assigned = $derived(
        tickets.filter(ticket => ticket.technician === technicianName)
    );

    let active = $derived(
        assigned.filter(ticket =>
            ['Open', 'Assigned', 'In progress'].includes(ticket.status)
        )
    );

    let inProgress = $derived(
        active.filter(ticket => ticket.status === 'In progress')
    );

    let highPriority = $derived(
        active.filter(ticket => ticket.priority === 'High')
    );

    let completed = $derived(
        assigned.filter(ticket => ticket.status === 'Resolved')
    );

    let workQueue = $derived(
        [...active]
            .sort((a, b) =>
            (priorityOrder[a.priority] ?? 3) -
            (priorityOrder[b.priority] ?? 3)
        )
        .slice(0, 4)
    );

    let recentlyCompleted = $derived(
    [...completed]
      .sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated))
      .slice(0, 3)
  );

  onMount(() => {
    try {
      tickets = CampusFixAPI.getTickets();
    } catch {
      error = 'Unable to load tickets. Please refresh and try again.';
    } finally {
      loading = false;
    }
  });

  function statusColors(status) {
    return STATUS_COLOR[status] || STATUS_COLOR.Open;
  }
</script>

<svelte:head>
  <title>Technician Dashboard | CampusFix</title>
</svelte:head>

<main class="content">
  <div class="dashboard-heading">
    <div>
      <h1 class="headline">Technician dashboard</h1>
      <p class="secondary-text">
        Welcome, {technicianName}. Here is your assigned workload.
      </p>
    </div>

    <span class="workspace-label">Maintenance workspace</span>
  </div>

  {#if loading}
    <div class="empty-state" role="status">Loading your tickets…</div>
  {:else if error}
    <div class="notice-box" role="alert">{error}</div>
  {:else}
    <div class="stat-grid technician-stats">
      <div class="stat-card">
        <div class="stat-num">{active.length}</div>
        <div class="stat-label">Active assignments</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{inProgress.length}</div>
        <div class="stat-label">In progress</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{highPriority.length}</div>
        <div class="stat-label">High priority</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{completed.length}</div>
        <div class="stat-label">Resolved</div>
      </div>
    </div>

    <div class="dashboard-columns">
      <section class="dashboard-panel" aria-labelledby="queue-title">
        <div class="section-heading">
          <h2 id="queue-title" class="section-title">Your work queue</h2>
          <a class="section-link" href="/technician/assigned">View all</a>
        </div>

        <p class="panel-description secondary-text">
          Active assignments, with high-priority issues first.
        </p>

        {#each workQueue as ticket (ticket.id)}
          <a
            class="ticket-row"
            style:border-left={'4px solid ' + statusColors(ticket.status)[0]}
            href={'/technician/tickets/' + encodeURIComponent(ticket.id)}
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
              <span class="secondary-text">{ticket.category}</span>
              <span
                class="priority-label"
                class:high={ticket.priority === 'High'}
              >
                {ticket.priority
                  ? `${ticket.priority} priority`
                  : 'Not prioritized'}
              </span>
            </div>
          </a>
        {:else}
          <div class="empty-state">You have no active assignments.</div>
        {/each}
      </section>

      <section class="dashboard-panel" aria-labelledby="completed-title">
        <div class="section-heading">
          <h2 id="completed-title" class="section-title">Recently resolved</h2>
          <a class="section-link" href="/technician/completed">View all</a>
        </div>

        {#each recentlyCompleted as ticket (ticket.id)}
          <a
            class="completed-item"
            href={'/technician/tickets/' + encodeURIComponent(ticket.id)}
          >
            <span class="ticket-id">{ticket.id}</span>
            <div class="ticket-title">{ticket.title}</div>
            <div class="ticket-meta">
              {ticket.building} · {ticket.room}
            </div>
            <div class="ticket-meta">Last updated {ticket.updated}</div>
          </a>
        {:else}
          <div class="empty-state">No resolved assignments yet.</div>
        {/each}
      </section>
    </div>
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

  .technician-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .technician-stats .stat-card {
    background: var(--bg-alt);
    padding: 16px 10px;
  }

  .technician-stats .stat-label {
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

  @media (max-width: 700px) {
    .dashboard-columns {
      grid-template-columns: 1fr;
    }

    .dashboard-heading {
      flex-direction: column;
    }
  }

  @media (max-width: 480px) {
    .technician-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>