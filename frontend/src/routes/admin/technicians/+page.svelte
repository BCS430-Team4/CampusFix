
<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { CampusFixAPI, type Ticket } from '$lib/api';

  type TechnicianSummary = {
    name: string;
    assigned: number;
    inProgress: number;
    completed: number;
    total: number;
    tickets: Ticket[];
  };

  let tickets = $state<Ticket[]>([]);
  let loading = $state(true);
  let error = $state('');
  let search = $state('');
  let sort = $state('name');
  let expandedName = $state<string | null>(null);

  const completedStatuses = ['Resolved', 'Closed'];

  // Load ticket information from the CampusFix backend.
  async function loadTickets() {
    loading = true;
    error = '';

    try {
      const result = await CampusFixAPI.getTickets();

      if (!Array.isArray(result)) {
        throw new Error('Invalid ticket response');
      }

      tickets = result;
    } catch (err) {
      console.error('Unable to load technicians:', err);
      error = 'Unable to load technician information. Check the backend connection.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void loadTickets();
  });

  // Group existing tickets by their assigned technician.
  // This is not a complete staff directory.
  let technicians = $derived.by((): TechnicianSummary[] => {
    const groups = new Map<string, Ticket[]>();

    for (const ticket of tickets) {
      const name = ticket.technician?.trim();

      if (!name) continue;

      const group = groups.get(name) ?? [];
      group.push(ticket);
      groups.set(name, group);
    }

    return [...groups.entries()].map(([name, items]) => ({
      name,
      assigned: items.filter(t =>
        ['Open', 'Assigned'].includes(t.status)
      ).length,
      inProgress: items.filter(t =>
        t.status === 'In progress'
      ).length,
      completed: items.filter(t =>
        completedStatuses.includes(t.status)
      ).length,
      total: items.length,
      tickets: items
    }));
  });

  let totalTechnicians = $derived(technicians.length);

  let activeAssignments = $derived(
    technicians.reduce(
      (sum, tech) => sum + tech.assigned + tech.inProgress,
      0
    )
  );

  let completedAssignments = $derived(
    technicians.reduce(
      (sum, tech) => sum + tech.completed,
      0
    )
  );

  let unassignedTickets = $derived(
    tickets.filter(t =>
      !t.technician?.trim() &&
      !completedStatuses.includes(t.status)
    ).length
  );

  let filteredTechnicians = $derived.by(() => {
    const query = search.trim().toLowerCase();

    const results = technicians.filter(tech =>
      tech.name.toLowerCase().includes(query)
    );

    return [...results].sort((a, b) => {
      if (sort === 'workload') {
        return (b.assigned + b.inProgress) -
          (a.assigned + a.inProgress);
      }

      if (sort === 'completed') {
        return b.completed - a.completed;
      }

      return a.name.localeCompare(b.name);
    });
  });

  function initials(name: string): string {
    return name
      .split(/[\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
  }

  function toggleDetails(name: string) {
    expandedName = expandedName === name ? null : name;
  }
</script>

<svelte:head>
  <title>Manage Technicians | CampusFix Administrator</title>
</svelte:head>

<main class="content">

  <!-- Page Heading -->
  <div class="page-heading">
    <div>
      <h1 class="headline">Manage Technicians</h1>
      <p class="secondary-text">
        Monitor technician workloads and maintenance assignments.
      </p>
    </div>

    <span class="workspace-label">
      Administrator workspace
    </span>
  </div>

  {#if loading}
    <div class="empty-state" role="status">
      Loading technician information...
    </div>

  {:else if error}
    <div class="notice-box" role="alert">
      {error}
      <button
        type="button"
        class="retry-button"
        onclick={() => void loadTickets()}
      >
        Try again
      </button>
    </div>

  {:else}

    <!-- Technician Statistics -->
    <div class="stat-grid technician-stats">

      <div class="stat-card">
        <div class="stat-num">{totalTechnicians}</div>
        <div class="stat-label">Known technicians</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{activeAssignments}</div>
        <div class="stat-label">Active assignments</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{completedAssignments}</div>
        <div class="stat-label">Completed assignments</div>
      </div>

      <div class="stat-card">
        <div class="stat-num">{unassignedTickets}</div>
        <div class="stat-label">Unassigned tickets</div>
      </div>

    </div>

    <!-- Search and Sort -->
    <section class="filter-panel">
      <div class="filter-fields">
        <div>
          <label for="technician-search">
            Search technicians
          </label>

          <input
            id="technician-search"
            type="search"
            placeholder="Search by technician name"
            bind:value={search}
          />
        </div>

        <div>
          <label for="technician-sort">
            Sort technicians
          </label>

          <select id="technician-sort" bind:value={sort}>
            <option value="name">Name (A–Z)</option>
            <option value="workload">Most active assignments</option>
            <option value="completed">Most completed</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Technician Directory -->
    <section aria-labelledby="technicians-title">

      <div class="section-heading">
        <h2 id="technicians-title" class="section-title">
          Technician Directory
        </h2>

        <span class="secondary-text">
          {filteredTechnicians.length} technician(s)
        </span>
      </div>

      <p class="directory-description secondary-text">
        Showing technicians associated with campus maintenance
        tickets. Staff without ticket history are not shown.
      </p>

      <div class="technician-grid">
        {#each filteredTechnicians as tech (tech.name)}

          <article class="technician-card">

            <div class="technician-header">
              <div class="avatar-circle">
                {initials(tech.name)}
              </div>

              <div class="technician-info">
                <h3>{tech.name}</h3>
                <p class="secondary-text">
                  Maintenance technician
                </p>
              </div>
            </div>

            <div class="workload-grid">

              <div class="workload-item">
                <strong>{tech.assigned}</strong>
                <span>Open / assigned</span>
              </div>

              <div class="workload-item">
                <strong>{tech.inProgress}</strong>
                <span>In progress</span>
              </div>

              <div class="workload-item">
                <strong>{tech.completed}</strong>
                <span>Completed</span>
              </div>

            </div>

            <div class="technician-footer">
              <span class="secondary-text">
                {tech.total} total tickets
              </span>

              <button
                type="button"
                class="view-button"
                aria-expanded={expandedName === tech.name}
                onclick={() => toggleDetails(tech.name)}
              >
                {expandedName === tech.name
                  ? 'Hide tickets'
                  : 'View tickets'}
              </button>
            </div>

            {#if expandedName === tech.name}
              <div class="ticket-list">
                <h4>Assigned ticket history</h4>

                {#each tech.tickets as ticket (ticket.id)}
                  <a
                    class="ticket-link"
                    href={resolve('/admin/tickets/[id]', {
                      id: ticket.id
                    })}
                  >
                    <div>
                      <strong>{ticket.id}</strong>
                      <span>{ticket.title}</span>
                    </div>

                    <span class="ticket-status">
                      {ticket.status}
                    </span>
                  </a>
                {/each}
              </div>
            {/if}

          </article>

        {:else}
          <div class="empty-state">
            {#if technicians.length === 0}
              No technicians have been assigned to tickets yet.
            {:else}
              No technicians match your search.
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Assignment Information -->
    <section class="assignment-panel">
      <h2 class="section-title">Ticket Assignments</h2>

      <p class="secondary-text">
        Assign or reassign technicians through the Administrator
        ticket detail pages.
      </p>

      <a
        class="assignment-link"
        href={resolve('/admin/assigned')}
      >
        View all campus tickets
      </a>
    </section>

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

  .page-heading h1 {
    margin: 0;
    font-size: 28px;
  }

  .page-heading p {
    margin: 6px 0 0;
    font-size: 13px;
  }

  .workspace-label {
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 7px 12px;
    color: var(--secondary);
    font-size: 11px;
    white-space: nowrap;
  }

  .technician-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--bg-alt);
    padding: 18px 12px;
  }

  .filter-panel {
    padding: 18px;
    margin-bottom: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-alt);
  }

  .filter-fields {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .filter-fields label {
    display: block;
    color: var(--secondary);
    font-size: 12px;
    margin-bottom: 8px;
  }

  .filter-fields input,
  .filter-fields select {
    width: 100%;
    box-sizing: border-box;
    padding: 11px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--ink);
    font: inherit;
  }

  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .section-heading h2 {
    margin: 0;
    font-size: 20px;
  }

  .directory-description {
    font-size: 13px;
    margin-bottom: 18px;
  }

  .technician-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .technician-card {
    min-width: 0;
    background: var(--bg-alt);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .technician-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }

  .avatar-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--green);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }

  .technician-info h3 {
    margin: 0;
    font-size: 17px;
  }

  .technician-info p {
    font-size: 12px;
    margin: 5px 0 0;
  }

  .workload-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 20px;
  }

  .workload-item {
    text-align: center;
    padding: 12px 6px;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .workload-item strong {
    display: block;
    font-size: 23px;
    margin-bottom: 6px;
  }

  .workload-item span {
    color: var(--secondary);
    font-size: 11px;
  }

  .technician-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border-top: 1px solid var(--border);
    padding-top: 16px;
    font-size: 12px;
  }

  .view-button,
  .retry-button,
  .assignment-link {
    background: var(--green);
    color: #fff;
    border: 0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .view-button:hover,
  .retry-button:hover,
  .assignment-link:hover {
    background: var(--green-accent);
  }

  .ticket-list {
    margin-top: 18px;
    border-top: 1px solid var(--border);
    padding-top: 14px;
  }

  .ticket-list h4 {
    font-size: 13px;
    margin: 0 0 12px;
  }

  .ticket-link {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border);
    color: var(--ink);
    text-decoration: none;
    font-size: 12px;
  }

  .ticket-link div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .ticket-link:hover {
    color: var(--green-accent);
  }

  .ticket-status {
    color: var(--secondary);
    white-space: nowrap;
  }

  .assignment-panel {
    margin-top: 24px;
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  .assignment-panel h2 {
    margin: 0 0 8px;
  }

  .assignment-panel p {
    font-size: 13px;
    margin-bottom: 20px;
  }

  @media (max-width: 800px) {
    .technician-grid {
      grid-template-columns: 1fr;
    }

    .technician-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .page-heading {
      flex-direction: column;
    }

    .filter-fields {
      grid-template-columns: 1fr;
    }
  }
</style>