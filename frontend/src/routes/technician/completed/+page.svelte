<script>
    import { onMount } from 'svelte';
    import { CampusFixAPI } from '$lib/api.js';
    import { CATEGORIES } from '$lib/shared.js';

    const technicianName = 'J. Delgado';

    let tickets = $state([]);
    let loading = $state(true);
    let error = $state('');

    let search = $state('');
    let category = $state('All');
    let sort = $state('newest');

    let completed = $derived(
        tickets.filter(ticket => 
            ticket.technician === technicianName &&
            ticket.status === 'Resolved'
        )
    );

    function completionTime(ticket) {
        const time = Date.parse(ticket.completedAt || '');
        return Number.isNaN(time) ? null : time;
    }

    function completionDate(ticket) {
        const time = completionTime(ticket);

        if (time === null) return 'Not Recorded';

        return new Date(time).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

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
                ticket.completionNotes
            ].join(' ').toLowerCase();

            return (
                (!query || searchable.includes(query)) && 
                (category === 'All' || ticket.category === category)
            );
        });

        return results.sort((a, b) => {
            const aTime = completionTime(a);
            const bTime = completionTime(b);

            //Tickets without a completion data will appear last
            if (aTime === null && bTime === null) {
                return a.id.localeCompare(b.id);
            }
            if (aTime === null) return 1;
            if (bTime === null) return -1;

            return sort === 'oldest'
                ? aTime - bTime 
                : bTime - aTime;
        });
    });

    onMount(() => {
        try {
            tickets = CampusFixAPI.getTickets();
        } catch {
            error = 'Unable to load completed tickets. Please refresh and try again.';
        } finally {
            loading = false;
        }
    });

    function clearFilters() {
        search = '';
        category = 'All';
        sort = 'newest';
    }
</script>

<svelte:head>
    <title>Completed Tickets | CampusFix</title>
</svelte:head>

<main class="content">
    <div class="page-heading">
        <h1 class="headline">Completed Tickets</h1>
        <p class="secondary-text">
            Review your resolved repairs and the work completed.
        </p>
    </div>

    {#if loading}
        <div class="empty-state" role="status">
            Loading completed tickets...
        </div>
    {:else if error}
        <div class="notice-box" role="alert">{error}</div>
    {:else}
        <section class="filter-panel" aria-label="Search and filter completed tickets">
            <div class="field-block">
                <label class="field-label" for="completed-search">
                    Search completed tickets
                </label>
                <input 
                    id="completed-search"
                    type="text"
                    placeholder="Search by ID, title, location, asset, or repair notes"
                    bind:value={search}
                />
            </div>

            <div class="filter-controls">
                <div>
                    <label class="field-label" for="category-filter">Category</label>
                    <select id="category-filter" bind:value={category}>
                        <option value="All">All categories</option>
                        {#each CATEGORIES as item}
                            <option value={item.label}>{item.label}</option>
                        {/each}    
                    </select>
                </div>

                <div>
                    <label class="field-label" for="completed-sort">Sort By</label>
                    <select id="completed-sort" bind:value={sort}>
                        <option value="newest">Newest Completed</option>
                        <option value="oldest">Oldest Completed</option>
                    </select>
                </div>

                <button
                    class="btn-secondary clear-button"
                    type="button"
                    onclick={clearFilters}
                >
                    Clear Filters
                </button>
            </div>
        </section>

        <div class="results-heading">
            <h2 class="section-title">Repair History</h2>
            <span class="secondary-text" role="status">
                Showing {filtered.length} of {completed.length}
            </span>
        </div>

        {#each filtered as ticket (ticket.id)}
            <a
                class="ticket-row completed-ticket"
                href={'/technician/tickets/' + encodeURIComponent(ticket.id)}
            >
                <div class="ticket-heading">           
                    <div>
                        <div class="ticket-id">{ticket.id}</div>
                        <div class="ticket-title">{ticket.title}</div>
                    </div>

                <span class="status-badge resolved-badge">Resolved</span>
                </div>

                <div class="ticket-meta">
                    {ticket.building} · {ticket.room}
                </div>

                <div class="history-meta">
                    <div>
                        <span class="meta-label">Category</span>
                        <span>{ticket.category}</span>
                    </div>
                    <div>
                        <span class="meta-label">Completed</span>
                        <span>{completionDate(ticket)}</span>
                    </div>
                </div>

                <div class="repair-notes">
                    <div class="notes-label">Work Completed</div>
                    <p>
                        {ticket.completionNotes || 'No completion notes recorded'}
                    </p>
                </div>

                <div class="ticket-footer">
                    <span class="ticket-meta">Last Updated {ticket.updated}</span>
                    <span class="details-label">View Repair Details</span>
                </div>
            </a>
        {:else}
            <div class="empty-state">
                {#if completed.length === 0}
                    No completed repairs yet. Tickets you resolve will appear.
                {:else}
                    No completed tickets match your search or category.
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

    .completed-ticket {
        padding: 18px;
        margin-bottom: 14px;
        border-left: 4px solid var(--success);
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

    .resolved-badge {
        flex-shrink: 0;
        color: var(--ink);
        background: var(--success-bg);
    }

    .history-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 16px 0;
        font-size: 13px;
    }

    .meta-label {
        display: block;
        margin-bottom: 4px;
        color: var(--secondary);
        font-size: 11px;
    }

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

    .ticket-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
    }

    .details-label {
        color: var(--ink);
        font-size: 12px;
        font-weight: 600;
    }

    .completed-ticket:hover {
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

    @media (max-width: 480px) {
        .history-meta {
            grid-template-columns: 1fr;
        }
    }


</style>    